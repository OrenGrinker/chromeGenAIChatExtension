import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Config, Message } from '../types';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['config'], (result) => {
      if (result.config) {
        setConfig(result.config);
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab?.id || !currentTab.url || currentTab.url.startsWith('chrome://')) {
        setPageContent('Unable to access content on this page.');
        return;
      }

      setCurrentUrl(currentTab.url || '');
      setPageTitle(currentTab.title || '');
      
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => document.body.innerText
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          setPageContent('Unable to access content on this page.');
          return;
        }
        if (results && results[0]) {
          const content = results[0].result as string;
          setPageContent(content);
        }
      });
    });
  }, []);

  const saveSession = (messages: Message[]) => {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const newSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      url: currentUrl,
      title: pageTitle,
      messages
    };
    localStorage.setItem('chatSessions', JSON.stringify([...sessions, newSession]));
  };

  const handleOpenAIChat = async (newMessages: Message[]) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config?.apiKey}`
      },
      body: JSON.stringify({
        model: config?.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. You have access to the following webpage content: ${pageContent}\n\nPlease help answer questions about this content.`
          },
          ...newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    return {
      role: 'assistant' as const,
      content: data.choices[0].message.content
    };
  };

  const handleClaudeChat = async (newMessages: Message[]) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config?.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config?.model || 'claude-3-opus-20240229',
        messages: [
          {
            role: 'user',
            content: `You have access to the following webpage content: ${pageContent}\n\nPlease help answer questions about this content.`
          },
          ...newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling Claude API');
    }

    return {
      role: 'assistant' as const,
      content: data.content[0].text
    };
  };

  const handleGeminiChat = async (newMessages: Message[]) => {
    const genAI = new GoogleGenerativeAI(config?.apiKey || '');
    const model = genAI.getGenerativeModel({ model: config?.model || 'gemini-1.5-pro' });

    const prompt = `You have access to the following webpage content: ${pageContent}\n\nUser question: ${newMessages[newMessages.length - 1].content}`;
    
    const result = await model.generateContent(prompt);
    return {
      role: 'assistant' as const,
      content: result.response.text()
    };
  };

  const sendMessage = async () => {
    if (!config?.apiKey || !input.trim()) return;
    
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      let assistantMessage;
      
      switch (config.provider) {
        case 'openai':
          assistantMessage = await handleOpenAIChat(newMessages);
          break;
        
        case 'claude':
          assistantMessage = await handleClaudeChat(newMessages);
          break;
        
        case 'gemini':
          assistantMessage = await handleGeminiChat(newMessages);
          break;
        
        default:
          throw new Error('Invalid provider selected');
      }

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveSession(updatedMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}. Please check your API key and selected model.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-4'
                  : 'bg-gray-100 mr-4'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="relative">
          <input
            type="text"
            className="w-full p-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message and press Enter..."
            disabled={isLoading}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                     text-blue-500 hover:bg-blue-50 disabled:opacity-50"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;