import React, { useState } from 'react';
import { MessageSquare, Settings, History } from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import ConfigPanel from './components/ConfigPanel';
import HistoryPanel from './components/HistoryPanel';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'config' | 'history'>('chat');

  return (
    <div className="w-[400px] h-screen bg-white">
      <div className="flex items-center justify-between border-b bg-white px-4 sticky top-0 z-10">
        <div className="flex">
          <button
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-blue-500 text-gray-600'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-blue-500 text-gray-600'
            }`}
            onClick={() => setActiveTab('config')}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-blue-500 text-gray-600'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-53px)] overflow-hidden">
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'config' && <ConfigPanel />}
        {activeTab === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
};

export default Popup;