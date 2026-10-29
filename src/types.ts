export type ProviderId = 'gemini' | 'groq' | 'openrouter';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderId;
  description: string;
  tag?: string;
  isPopular?: boolean;
  contextWindow?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: ProviderId;
  model?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: ProviderId;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ApiKeys {
  gemini: string;
  groq: string;
  openrouter: string;
}

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  apiKeys: ApiKeys;
  temperature: number;
  systemPrompt: string;
  streamResponse: boolean;
  theme: ThemeMode;
}

export interface ServerStatus {
  geminiEnvKeyAvailable: boolean;
  groqEnvKeyAvailable?: boolean;
  openrouterEnvKeyAvailable?: boolean;
}
