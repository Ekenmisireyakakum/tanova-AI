import { ApiKeys, AppSettings, ChatSession, ProviderId, UserAccount } from '../types';

const STORAGE_KEYS = {
  API_KEYS: 'gemini_multi_api_keys_v1',
  SETTINGS: 'gemini_multi_settings_v1',
  SESSIONS: 'gemini_multi_sessions_v1',
  ACTIVE_SESSION: 'gemini_multi_active_session_id_v1',
  ACTIVE_PROVIDER: 'gemini_multi_active_provider_v1',
  ACTIVE_MODEL: 'gemini_multi_active_model_v1',
  THEME: 'gemini_multi_theme_v1',
  CURRENT_USER: 'tanovai_current_user_v1',
  USERS_DB: 'tanovai_users_db_v1',
};

export const defaultApiKeys: ApiKeys = {
  gemini: '',
  groq: '',
  openrouter: '',
};

export const defaultSettings: AppSettings = {
  apiKeys: defaultApiKeys,
  temperature: 0.7,
  systemPrompt: 'You are Tanovai, a helpful, thoughtful, and capable AI assistant powered by state-of-the-art models. Provide clear, accurate, and beautifully structured responses.',
  streamResponse: true,
  theme: 'light',
  autoFallback: true,
};

export function loadTheme(): 'light' | 'dark' {
  return 'light';
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
    return {
      ...defaultSettings,
      ...parsed,
      apiKeys: keys,
      theme: 'light',
      autoFallback: parsed.autoFallback !== undefined ? Boolean(parsed.autoFallback) : true,
    };
  } catch {
    return { ...defaultSettings, apiKeys: loadApiKeys(), theme: 'light' };
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
      autoFallback: settings.autoFallback !== undefined ? settings.autoFallback : true,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export const defaultSampleSessions: ChatSession[] = [];

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out previous demo sessions
    const filtered = parsed.filter((s: any) => !String(s?.id || '').startsWith('sample-'));
    if (filtered.length !== parsed.length) {
      saveSessions(filtered);
    }
    return filtered;
  } catch {
    return [];
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

// ==========================================
// User Authentication & Account Management
// ==========================================

export const DEFAULT_DEMO_USER: UserAccount | null = null;

interface StoredUserEntry {
  user: UserAccount;
  passwordHash: string;
}

// Simple base64 encode for client-side password hash demo
function hashPassword(pw: string): string {
  try {
    return btoa(unescape(encodeURIComponent(pw)));
  } catch {
    return pw;
  }
}

export function loadUsersDB(): StoredUserEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sanitize any previous demo account
    const sanitized = parsed.filter(
      (entry: any) =>
        entry?.user?.id !== 'user_ekenmisire' &&
        entry?.user?.email !== 'ekenmisire@tanovai.ai'
    );
    if (sanitized.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
}

export function saveUsersDB(db: StoredUserEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save users database:', err);
  }
}

export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw || raw === 'null' || raw === 'guest') {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed?.id === 'user_ekenmisire' || parsed?.email === 'ekenmisire@tanovai.ai') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'guest');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'guest');
    }
  } catch (err) {
    console.error('Failed to save current user:', err);
  }
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  avatarColor = '#4285F4'
): { success: boolean; user?: UserAccount; error?: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const db = loadUsersDB();
  const existing = db.find((entry) => entry.user.email.toLowerCase() === trimmedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    avatarColor,
    createdAt: Date.now(),
  };

  db.push({
    user: newUser,
    passwordHash: hashPassword(password),
  });

  saveUsersDB(db);
  saveCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; user?: UserAccount; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const db = loadUsersDB();
  const target = db.find((entry) => entry.user.email.toLowerCase() === trimmedEmail);

  if (!target) {
    return { success: false, error: 'No account found with this email. Please check your email or sign up.' };
  }

  if (target.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  saveCurrentUser(target.user);
  return { success: true, user: target.user };
}

export function logoutUser(): void {
  saveCurrentUser(null);
}

export function updateUserProfile(
  id: string,
  updates: Partial<UserAccount>
): UserAccount | null {
  const db = loadUsersDB();
  const index = db.findIndex((entry) => entry.user.id === id);
  if (index === -1) return null;

  const updatedUser = {
    ...db[index].user,
    ...updates,
  };
  db[index].user = updatedUser;
  saveUsersDB(db);

  const current = loadCurrentUser();
  if (current && current.id === id) {
    saveCurrentUser(updatedUser);
  }

  return updatedUser;
}

const NOTEBOOKS_KEY = 'tanovai_study_notebooks_v1';

export const DEFAULT_NOTEBOOKS: import('../types').StudyNotebook[] = [];

export function loadNotebooks(): import('../types').StudyNotebook[] {
  try {
    const raw = localStorage.getItem(NOTEBOOKS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const demoNotebookIds = ['nb-ochem', 'nb-diffeq', 'nb-deeplearning'];
    const filtered = parsed.filter((nb: any) => !demoNotebookIds.includes(nb?.id));
    if (filtered.length !== parsed.length) {
      saveNotebooks(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveNotebooks(notebooks: import('../types').StudyNotebook[]): void {
  try {
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
  } catch (err) {
    console.error('Failed to save study notebooks:', err);
  }
}

const PROMPTS_KEY = 'tanovai_custom_prompts_v1';

export const DEFAULT_PROMPT_TEMPLATES: import('../types').PromptTemplate[] = [];

export function loadSavedPrompts(): import('../types').PromptTemplate[] {
  try {
    const raw = localStorage.getItem(PROMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const demoPromptIds = ['socratic-tutor', 'feynman-explainer', 'code-auditor', 'exam-flashcards', 'lit-review', 'math-derivation'];
    const filtered = parsed.filter((p: any) => !demoPromptIds.includes(p?.id));
    if (filtered.length !== parsed.length) {
      saveSavedPrompts(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveSavedPrompts(prompts: import('../types').PromptTemplate[]): void {
  try {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  } catch (err) {
    console.error('Failed to save prompts:', err);
  }
}

const SCHEDULED_KEY = 'tanovai_scheduled_tasks_v1';

export const DEFAULT_SCHEDULED_TASKS: import('../types').ScheduledTask[] = [];

export function loadScheduledTasks(): import('../types').ScheduledTask[] {
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const demoTaskIds = ['task-daily-quiz', 'task-code-challenge', 'task-weekend-review'];
    const filtered = parsed.filter((t: any) => !demoTaskIds.includes(t?.id));
    if (filtered.length !== parsed.length) {
      saveScheduledTasks(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveScheduledTasks(tasks: import('../types').ScheduledTask[]): void {
  try {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save scheduled tasks:', err);
  }
}

const IMAGES_KEY = 'tanovai_generated_images_v1';

export const DEFAULT_GALLERY_IMAGES: import('../types').GeneratedImageItem[] = [];

export function loadImagesGallery(): import('../types').GeneratedImageItem[] {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const demoImageIds = ['img-1', 'img-2', 'img-3'];
    const filtered = parsed.filter((img: any) => !demoImageIds.includes(img?.id));
    if (filtered.length !== parsed.length) {
      saveImagesGallery(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveImagesGallery(images: import('../types').GeneratedImageItem[]): void {
  try {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch (err) {
    console.error('Failed to save images gallery:', err);
  }
}
