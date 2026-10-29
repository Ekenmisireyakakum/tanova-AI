import { ApiKeys, AppSettings, ChatSession, ProviderId } from '../types';

const STORAGE_KEYS = {
  API_KEYS: 'gemini_multi_api_keys_v1',
  SETTINGS: 'gemini_multi_settings_v1',
  SESSIONS: 'gemini_multi_sessions_v1',
  ACTIVE_SESSION: 'gemini_multi_active_session_id_v1',
  ACTIVE_PROVIDER: 'gemini_multi_active_provider_v1',
  ACTIVE_MODEL: 'gemini_multi_active_model_v1',
  THEME: 'gemini_multi_theme_v1',
};

export const defaultApiKeys: ApiKeys = {
  gemini: '',
  groq: '',
  openrouter: '',
};

export const defaultSettings: AppSettings = {
  apiKeys: defaultApiKeys,
  temperature: 0.7,
  systemPrompt: 'You are Gemini, a helpful, thoughtful, and capable AI assistant. Provide clear, accurate, and beautifully structured responses.',
  streamResponse: true,
  theme: 'dark',
};

export function loadTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'light' || raw === 'dark') return raw;
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
}

export function loadApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!raw) return defaultApiKeys;
    const parsed = JSON.parse(raw);
    return {
      ...defaultApiKeys,
      ...parsed,
      gemini: typeof parsed.gemini === 'string' ? parsed.gemini : '',
      groq: typeof parsed.groq === 'string' ? parsed.groq : '',
      openrouter: typeof parsed.openrouter === 'string' ? parsed.openrouter : '',
    };
  } catch {
    return defaultApiKeys;
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to save API keys to localStorage:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const keys = loadApiKeys();
    const currentTheme = loadTheme();
    if (!raw) {
      return { ...defaultSettings, apiKeys: keys, theme: currentTheme };
    }
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed, apiKeys: keys, theme: parsed.theme || currentTheme };
  } catch {
    return { ...defaultSettings, apiKeys: loadApiKeys(), theme: loadTheme() };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    saveApiKeys(settings.apiKeys);
    saveTheme(settings.theme);
    const toSave = {
      temperature: settings.temperature,
      systemPrompt: settings.systemPrompt,
      streamResponse: settings.streamResponse,
      theme: settings.theme,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export const defaultSampleSessions: ChatSession[] = [
  {
    id: 'sample-1',
    title: 'Magnifying Glass Background Removal',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How do I isolate and remove the background from a magnifying glass photo while preserving the realistic glass lens refraction and transparency?',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'To remove a background from a magnifying glass while preserving realistic lens refraction:\n\n1. **Separate into Two Layers**:\n   - **Layer A (Opaque Frame & Handle)**: Use a hard-edge pen tool or subject selection mask.\n   - **Layer B (Glass Lens Area)**: Create a feathered elliptical selection of just the glass.\n\n2. **Isolate Glass Refraction**:\n   - Set Layer B blending mode to **Screen** or **Linear Dodge** for specular highlights.\n   - Duplicate Layer B and set to **Multiply** at 40% opacity to preserve edge shadows.\n\n3. **Refraction Displacement Map**:\n   - Use a subtle spherical pinch/magnify filter on the new background beneath the lens to simulate realistic focal magnification.',
        timestamp: Date.now() - 3600000 * 2 + 1000,
        provider: 'gemini',
        model: 'gemini-3.8-flash',
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Website Landing Page Generation Prompt',
    provider: 'groq',
    model: 'openai/gpt-oss-120b',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: 'Write a comprehensive prompt for generating a modern SaaS landing page.',
        timestamp: Date.now() - 3600000 * 5,
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: 'Here is a high-converting prompt template for AI web generation:\n\n> "Create a modern, high-contrast B2B SaaS landing page for an AI observability platform. Include: sticky navigation with blur backdrop, bold hero with value proposition, interactive live demo widget, customer proof logo carousel, 3-tier pricing matrix, and FAQ accordion with clean keyboard navigation."',
        timestamp: Date.now() - 3600000 * 5 + 1000,
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
      },
    ],
  },
  {
    id: 'sample-3',
    title: 'Natural Aging Photo Edit',
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
    messages: [],
  },
  {
    id: 'sample-4',
    title: 'Distributed SQL 48-Day Beginner Plan',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
    messages: [],
  },
  {
    id: 'sample-5',
    title: 'Branch • Software Project Pitch Deck G...',
    provider: 'groq',
    model: 'openai/gpt-oss-120b',
    createdAt: Date.now() - 3600000 * 36,
    updatedAt: Date.now() - 3600000 * 36,
    messages: [],
  },
  {
    id: 'sample-6',
    title: 'Software Project Pitch Deck Generation',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 48,
    messages: [],
  },
  {
    id: 'sample-7',
    title: 'Birthday Captions for Junior Sister',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    createdAt: Date.now() - 3600000 * 60,
    updatedAt: Date.now() - 3600000 * 60,
    messages: [],
  },
  {
    id: 'sample-8',
    title: 'Differential Equations Exam Help',
    provider: 'groq',
    model: 'qwen/qwen3.8-27b',
    createdAt: Date.now() - 3600000 * 72,
    updatedAt: Date.now() - 3600000 * 72,
    messages: [],
  },
];

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      saveSessions(defaultSampleSessions);
      return defaultSampleSessions;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSampleSessions;
  } catch {
    return defaultSampleSessions;
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

export function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch {
    return null;
  }
}

export function saveActiveSessionId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch (err) {
    console.error('Failed to save active session ID:', err);
  }
}

export function loadActiveModelSelection(): { provider: ProviderId; model: string } {
  try {
    const provider = (localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) as ProviderId) || 'gemini';
    const model = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODEL) || 'gemini-3.8-flash';
    return { provider, model };
  } catch {
    return { provider: 'gemini', model: 'gemini-3.8-flash' };
  }
}

export function saveActiveModelSelection(provider: ProviderId, model: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, provider);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODEL, model);
  } catch (err) {
    console.error('Failed to save model selection:', err);
  }
}
