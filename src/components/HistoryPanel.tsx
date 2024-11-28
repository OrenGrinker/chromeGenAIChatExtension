import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Globe } from 'lucide-react';
import type { ChatSession } from '../types';

const HistoryPanel: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const savedSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    setSessions(savedSessions.sort((a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp));
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex h-[600px] bg-white dark:bg-gray-900">
      <div className="w-1/3 border-r dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Chat History</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors
                       ${selectedSession?.id === session.id 
                         ? 'bg-blue-50 dark:bg-blue-900/20' 
                         : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              onClick={() => setSelectedSession(session)}
            >
              <h3 className="font-medium mb-2 truncate dark:text-white">{session.title}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(session.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{new URL(session.url).hostname}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {selectedSession ? (
          <>
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{selectedSession.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSession.url}</p>
              </div>
              <button
                onClick={() => deleteSession(selectedSession.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg 
                         transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-73px)] p-4 space-y-4">
              {selectedSession.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 dark:text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to view its history
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;