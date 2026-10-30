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

export interface FallbackInfo {
  originalProvider: ProviderId;
  originalModel: string;
  fallbackProvider: ProviderId;
  fallbackModel: string;
  reason: string;
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
  fallback?: FallbackInfo;
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
  autoFallback: boolean;
}

export interface ServerStatus {
  geminiEnvKeyAvailable: boolean;
  groqEnvKeyAvailable?: boolean;
  openrouterEnvKeyAvailable?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarColor?: string;
  createdAt: number;
}

export interface StudyNotebook {
  id: string;
  title: string;
  subject: string;
  syllabusSnippet?: string;
  lessonCount: number;
  progressPercent: number;
  updatedAt: number;
  chapters?: {
    id: string;
    title: string;
    summary: string;
    completed: boolean;
  }[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'study' | 'coding' | 'writing' | 'stem' | 'productivity' | 'custom';
  description: string;
  prompt: string;
  tags: string[];
  isCustom?: boolean;
}

export interface ScheduledTask {
  id: string;
  title: string;
  prompt: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  time: string;
  days?: string[];
  isActive: boolean;
  lastRun?: number;
  category?: string;
}

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  title: string;
  subject?: string;
}
