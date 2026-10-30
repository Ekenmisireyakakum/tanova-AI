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
    model: 'nvidia/nemotron-3.5-lightning:free',
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

// ==========================================
// User Authentication & Account Management
// ==========================================

export const DEFAULT_DEMO_USER: UserAccount = {
  id: 'user_ekenmisire',
  name: 'Ekenmisire Tanimu yakakum',
  email: 'ekenmisire@tanovai.ai',
  avatarUrl: '/assets/aistudio/image_48d5d302.png',
  avatarColor: '#4285F4',
  createdAt: Date.now() - 86400000 * 45,
};

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
      // Seed default demo user
      const initial: StoredUserEntry[] = [
        {
          user: DEFAULT_DEMO_USER,
          passwordHash: hashPassword('password123'),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [
      {
        user: DEFAULT_DEMO_USER,
        passwordHash: hashPassword('password123'),
      },
    ];
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
    if (raw === 'null' || raw === 'guest') {
      return null;
    }
    if (!raw) {
      // Default to demo user on initial load
      saveCurrentUser(DEFAULT_DEMO_USER);
      return DEFAULT_DEMO_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_USER;
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

export const DEFAULT_NOTEBOOKS: import('../types').StudyNotebook[] = [
  {
    id: 'nb-ochem',
    title: 'Organic Chemistry I & Mechanisms',
    subject: 'Chemistry',
    syllabusSnippet: 'Alkanes, SN1/SN2 Substitution, E1/E2 Elimination, Electrophilic Addition, Stereochemistry.',
    lessonCount: 8,
    progressPercent: 45,
    updatedAt: Date.now() - 3600000 * 20,
    chapters: [
      { id: 'ch-1', title: 'Stereochemistry & Chirality', summary: 'R/S enantiomers, diastereomers, optical rotation.', completed: true },
      { id: 'ch-2', title: 'SN1 vs SN2 Nucleophilic Substitution', summary: 'Carbocation intermediates, solvent effects, inversion of configuration.', completed: true },
      { id: 'ch-3', title: 'E1 & E2 Elimination Reactions', summary: 'Zaitsev vs Hofmann regioselectivity and anti-coplanar transition states.', completed: false },
    ],
  },
  {
    id: 'nb-diffeq',
    title: 'Differential Equations & Linear Systems',
    subject: 'Mathematics',
    syllabusSnippet: 'First order ODEs, integrating factors, homogeneous equations, Laplace transforms, Fourier series.',
    lessonCount: 12,
    progressPercent: 60,
    updatedAt: Date.now() - 3600000 * 48,
    chapters: [
      { id: 'ch-1', title: 'First-Order Linear Differential Equations', summary: 'Separable ODEs and integrating factor method.', completed: true },
      { id: 'ch-2', title: 'Second-Order Linear Homogeneous ODEs', summary: 'Characteristic equation and damped harmonic oscillators.', completed: true },
      { id: 'ch-3', title: 'Laplace Transform & Step Functions', summary: 'Transfer functions and solving IVPs algebraically.', completed: false },
    ],
  },
  {
    id: 'nb-deeplearning',
    title: 'Deep Learning & Transformer Models',
    subject: 'Computer Science',
    syllabusSnippet: 'Backpropagation, attention mechanisms, self-attention matrices, positional encodings, vision transformers.',
    lessonCount: 10,
    progressPercent: 30,
    updatedAt: Date.now() - 3600000 * 72,
    chapters: [
      { id: 'ch-1', title: 'Gradient Descent & Backprop Calculus', summary: 'Chain rule, computational graphs, Adam optimizer.', completed: true },
      { id: 'ch-2', title: 'Multi-Head Attention & QKV Projections', summary: 'Scaled dot-product attention and residual normalization.', completed: false },
    ],
  },
];

export function loadNotebooks(): import('../types').StudyNotebook[] {
  try {
    const raw = localStorage.getItem(NOTEBOOKS_KEY);
    if (!raw) {
      saveNotebooks(DEFAULT_NOTEBOOKS);
      return DEFAULT_NOTEBOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTEBOOKS;
  } catch {
    return DEFAULT_NOTEBOOKS;
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

export const DEFAULT_PROMPT_TEMPLATES: import('../types').PromptTemplate[] = [
  {
    id: 'socratic-tutor',
    title: 'Socratic Method Study Tutor',
    category: 'study',
    description: 'Guides you to answers by asking probing questions rather than just giving solutions.',
    prompt: 'Act as a master Socratic tutor in [Subject]. Do not simply give me the answers. Ask me one targeted conceptual question at a time to guide me toward deep understanding.',
    tags: ['Learning', 'Socratic', 'Tutoring'],
  },
  {
    id: 'feynman-explainer',
    title: 'Feynman Technique Simplifier',
    category: 'study',
    description: 'Explains complex university-level topics in clear language using everyday analogies.',
    prompt: 'Explain [Complex Concept] using the Feynman Technique. Break it down so that a bright 12-year-old can intuitively grasp it, use an everyday real-world analogy, and highlight common misconceptions.',
    tags: ['Feynman', 'Analogy', 'Intuition'],
  },
  {
    id: 'code-auditor',
    title: 'Full-Stack Code Auditor & Fixer',
    category: 'coding',
    description: 'Audits code for edge cases, performance bottlenecks, and security vulnerabilities.',
    prompt: 'Review the following code thoroughly for logic bugs, performance inefficiencies, time/space complexity (Big-O), and modern best practices. Provide the refactored code with clear explanations:\n\n```typescript\n// paste code here\n```',
    tags: ['TypeScript', 'Refactor', 'Performance'],
  },
  {
    id: 'exam-flashcards',
    title: 'Active Recall & Spaced Repetition Quiz',
    category: 'study',
    description: 'Generates progressive difficulty questions with detailed rubric justifications.',
    prompt: 'Create a 5-question active recall test on [Topic] covering fundamentals to advanced synthesis. For each question, provide a hint, the complete answer, and why other common student assumptions are flawed.',
    tags: ['Quiz', 'Spaced Repetition', 'Exams'],
  },
  {
    id: 'lit-review',
    title: 'Academic Literature Review Synthesizer',
    category: 'writing',
    description: 'Synthesizes academic findings, methodologies, research gaps, and theoretical frameworks.',
    prompt: 'Help me outline a literature review section for my paper on [Research Question]. Group research by theoretical approaches, contrast conflicting empirical findings, and highlight key unresolved gaps.',
    tags: ['Academic', 'Literature Review', 'Research'],
  },
  {
    id: 'math-derivation',
    title: 'Step-by-Step STEM Mathematical Derivation',
    category: 'stem',
    description: 'Provides rigorous mathematical proofs and calculus derivations with annotated justification for each step.',
    prompt: 'Walk me through a rigorous step-by-step derivation of [Formula / Theorem]. Show every intermediate algebraic transformation in LaTeX formatting and annotate the intuition behind each transition.',
    tags: ['Math', 'LaTeX', 'Proofs'],
  },
];

export function loadSavedPrompts(): import('../types').PromptTemplate[] {
  try {
    const raw = localStorage.getItem(PROMPTS_KEY);
    if (!raw) return DEFAULT_PROMPT_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROMPT_TEMPLATES;
  } catch {
    return DEFAULT_PROMPT_TEMPLATES;
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

export const DEFAULT_SCHEDULED_TASKS: import('../types').ScheduledTask[] = [
  {
    id: 'task-daily-quiz',
    title: 'Morning Spaced Repetition Check-In',
    prompt: 'Give me a 3-question active recall pop quiz on the hardest concepts from our previous study session. Wait for my answer before grading!',
    frequency: 'daily',
    time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isActive: true,
    category: 'Daily Quiz',
  },
  {
    id: 'task-code-challenge',
    title: 'Evening Data Structure & Algorithm Challenge',
    prompt: 'Provide one medium-level algorithm problem (Graph traversal, DP, or Sliding Window) with test cases and step-by-step thinking hints.',
    frequency: 'weekdays',
    time: '18:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isActive: true,
    category: 'Coding',
  },
  {
    id: 'task-weekend-review',
    title: 'Sunday Syllabus Mastery Review',
    prompt: 'Help me conduct a comprehensive review of my active study notebooks, assess mastery scores, and generate next week’s target study milestones.',
    frequency: 'weekly',
    time: '19:00',
    days: ['Sun'],
    isActive: false,
    category: 'Study Planning',
  },
];

export function loadScheduledTasks(): import('../types').ScheduledTask[] {
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    if (!raw) return DEFAULT_SCHEDULED_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCHEDULED_TASKS;
  } catch {
    return DEFAULT_SCHEDULED_TASKS;
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

export const DEFAULT_GALLERY_IMAGES: import('../types').GeneratedImageItem[] = [
  {
    id: 'img-1',
    title: 'Astrophysical Jet & Accretion Disk',
    prompt: 'Supermassive black hole with luminous relativistic plasma jets, glowing gravitational lensing accretion disk in deep space, scientific astrophysical visualization, 8k resolution, photorealistic cosmic rendering.',
    style: 'Scientific 3D',
    aspectRatio: '16:9',
    createdAt: Date.now() - 3600000 * 24,
    url: '/assets/aistudio/image_ab85e780.png',
    subject: 'Astrophysics',
  },
  {
    id: 'img-2',
    title: 'Eukaryotic Cell Mitosis Stages',
    prompt: 'Detailed 3D cross-section diagram of eukaryotic cell undergoing metaphase and anaphase, labeled spindle fibers, chromatin alignment, modern medical textbook infographic style, vibrant clarity.',
    style: 'Medical Infographic',
    aspectRatio: '1:1',
    createdAt: Date.now() - 3600000 * 12,
    url: '/assets/aistudio/image_48d5d302.png',
    subject: 'Cell Biology',
  },
  {
    id: 'img-3',
    title: 'Transformer Architecture Attention Map',
    prompt: 'Multi-head self-attention mechanism visualization with glowing tensor matrix connections, deep neural network latent space vector embeddings, sleek dark cybernetic style.',
    style: 'Deep Learning',
    aspectRatio: '16:9',
    createdAt: Date.now() - 3600000 * 6,
    url: '/assets/aistudio/image_76db0250.png',
    subject: 'Computer Science',
  },
];

export function loadImagesGallery(): import('../types').GeneratedImageItem[] {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    if (!raw) return DEFAULT_GALLERY_IMAGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GALLERY_IMAGES;
  } catch {
    return DEFAULT_GALLERY_IMAGES;
  }
}

export function saveImagesGallery(images: import('../types').GeneratedImageItem[]): void {
  try {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch (err) {
    console.error('Failed to save images gallery:', err);
  }
}
