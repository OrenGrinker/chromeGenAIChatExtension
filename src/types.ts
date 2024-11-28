export interface Config {
  provider: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  model: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sourceLocation?: {
    text: string;
    index: number;
  };
}

export const DEFAULT_CONFIG: Config = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o' 
};

export interface ChatSession {
  id: string;
  timestamp: number;
  url: string;
  title: string;
  messages: Message[];
}

export const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'gpt-4o' },
  { value: 'gpt-4o-mini', label: 'gpt-4o Mini' },
];

export const CLAUDE_MODELS = [
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' }
];
