// src/components/ConfigPanel.tsx
import React, { useState, useEffect } from 'react';
import { Key, Bot } from 'lucide-react';
import type { Config } from '../types';
import { DEFAULT_CONFIG } from '../types';

const ConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    chrome.storage.sync.get(['config'], (result) => {
      if (result.config) {
        setConfig(result.config);
      } else {
        chrome.storage.sync.set({ config: DEFAULT_CONFIG });
      }
    });
  }, []);

  const saveConfig = (newConfig: Config) => {
    chrome.storage.sync.set({ config: newConfig }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving config:', chrome.runtime.lastError);
        setSaveStatus('Error saving');
      } else {
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    });
  };

  const handleApiKeyChange = (apiKey: string) => {
    const newConfig = { ...config, apiKey };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleProviderChange = (provider: 'openai' | 'claude' | 'gemini') => {
    let defaultModel;
    switch (provider) {
      case 'openai':
        defaultModel = 'gpt-4o';
        break;
      case 'claude':
        defaultModel = 'claude-3-opus-20240229';
        break;
      case 'gemini':
        defaultModel = 'gemini-1.5-pro';
        break;
      default:
        defaultModel = 'gpt-4o';
    }

    const newConfig = { ...config, provider, model: defaultModel };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleModelChange = (model: string) => {
    const newConfig = { ...config, model };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const getModelOptions = () => {
    switch (config.provider) {
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'gpt-4o' },
          { value: 'gpt-4o-mini', label: 'gpt-4o-mini' }
        ];
      case 'claude':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Provider Settings</h2>
        {saveStatus && (
          <span className="text-sm text-green-500">{saveStatus}</span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Provider</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <button
              className={`p-4 rounded-lg border flex items-center space-x-3 ${
                config.provider === 'openai' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleProviderChange('openai')}
            >
              <Bot className="w-5 h-5" />
              <span>OpenAI</span>
            </button>
            <button
              className={`p-4 rounded-lg border flex items-center space-x-3 ${
                config.provider === 'claude' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleProviderChange('claude')}
            >
              <Bot className="w-5 h-5" />
              <span>Claude</span>
            </button>
            <button
              className={`p-4 rounded-lg border flex items-center space-x-3 ${
                config.provider === 'gemini' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleProviderChange('gemini')}
            >
              <Bot className="w-5 h-5" />
              <span>Gemini</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Model</label>
          <select
            className="mt-2 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={config.model}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {getModelOptions().map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">API Key</label>
          <div className="relative mt-2">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={config.apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;