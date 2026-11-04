import { ModelInfo, ProviderId } from '../types';

export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  tagline: string;
  badgeColor: string;
  iconType: 'gemini' | 'groq' | 'openrouter';
}

export const PROVIDERS: Record<ProviderId, ProviderMetadata> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Multimodal intelligence by Google',
    badgeColor: 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900',
    iconType: 'gemini',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    tagline: 'Ultra-fast LPU inference engine',
    badgeColor: 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900',
    iconType: 'groq',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    tagline: 'Unified multi-model access',
    badgeColor: 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900',
    iconType: 'openrouter',
  },
};

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Google Gemini
  {
    id: 'gemini-3.8-flash',
    name: 'Auto',
    provider: 'gemini',
    description: 'Gemini 3 models',
    tag: 'Auto',
    isPopular: true,
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-3.1-pro',
    name: '3.1 Pro',
    provider: 'gemini',
    description: 'Advanced reasoning',
    tag: 'Advanced reasoning',
    isPopular: true,
    contextWindow: '2M tokens',
  },
  {
    id: 'gemini-4-argon',
    name: '4 Argon',
    provider: 'gemini',
    description: 'Complex tasks',
    tag: 'Complex tasks',
    isPopular: false,
    contextWindow: '2M tokens',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'gemini',
    description: 'Ultra lightweight, instantaneous responses for chat',
    tag: 'Fastest',
    isPopular: false,
    contextWindow: '1M tokens',
  },

  // Groq
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'groq',
    description: 'OpenAI 120B reasoning model running on Groq LPUs with 131K context',
    tag: 'Flagship 120B',
    isPopular: true,
    contextWindow: '131K tokens',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'groq',
    description: 'Ultra-fast OpenAI 20B reasoning model on Groq hardware',
    tag: 'Fast 20B',
    isPopular: true,
    contextWindow: '131K tokens',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    provider: 'groq',
    description: 'Alibaba Qwen 3.8 27B model on high-speed Groq LPU inference',
    tag: '27B',
    isPopular: true,
    contextWindow: '131K tokens',
  },
  {
    id: 'allam-2-7b',
    name: 'ALLaM 2 7B',
    provider: 'groq',
    description: 'Lightweight conversational model by SDAIA running on Groq',
    tag: 'Lightweight',
    isPopular: false,
    contextWindow: '4K tokens',
  },

  // OpenRouter Free Tier (Active on free accounts)
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 Lightning (Free)',
    provider: 'openrouter',
    description: 'High-speed NVIDIA reasoning and conversational model, 100% free on OpenRouter',
    tag: 'Free Tier',
    isPopular: true,
    contextWindow: '128K tokens',
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'Liquid LFM 2.5 (Free)',
    provider: 'openrouter',
    description: 'Liquid Neural Network architecture for ultra-responsive low-latency chat',
    tag: 'Free Tier',
    isPopular: true,
    contextWindow: '32K tokens',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google Gemma 4 26B (Free)',
    provider: 'openrouter',
    description: 'Google’s open model running for free on OpenRouter',
    tag: 'Free Tier',
    isPopular: false,
    contextWindow: '8K tokens',
  },

  // OpenRouter Premium / Paid credits
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'openrouter',
    description: 'Leading open reasoning model with transparent chain-of-thought',
    tag: 'Reasoning Leader',
    isPopular: true,
    contextWindow: '164K tokens',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    description: 'Top-tier code generation, nuanced writing, and deep analysis',
    tag: 'SOTA',
    isPopular: true,
    contextWindow: '200K tokens',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'openrouter',
    description: 'Meta’s best 70B open model via multiple redundant backends',
    tag: 'Balanced',
    isPopular: true,
    contextWindow: '128K tokens',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openrouter',
    description: 'OpenAI’s nimble multimodal model for quick, smart tasks',
    tag: 'Economical',
    isPopular: true,
    contextWindow: '128K tokens',
  },
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large 2',
    provider: 'openrouter',
    description: 'Flagship multilingual reasoning and coding by Mistral AI',
    tag: 'Multilingual',
    isPopular: false,
    contextWindow: '128K tokens',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'openrouter',
    description: 'Alibaba’s exceptional open weight model with deep math/code skills',
    tag: 'Math & Code',
    isPopular: false,
    contextWindow: '128K tokens',
  },
];

export const SUGGESTION_CHIPS = [
  {
    title: 'Suggest a smarter schedule for me',
    subtitle: 'Optimize a busy weekday for deep work & breaks',
    category: 'Plan',
    icon: 'Calendar',
    prompt: 'Suggest a smarter, realistic daily schedule for me to balance 4 hours of deep focus work, meetings, physical exercise, and downtime.',
  },
  {
    title: 'Strengthen my CV summary',
    subtitle: 'Make it punchy, metric-driven and impactful',
    category: 'Career',
    icon: 'FileText',
    prompt: 'Help me strengthen my professional CV summary. Ask me 3 questions about my background, then produce 2 compelling versions highlighting impact and skills.',
  },
  {
    title: 'Rewrite this in a different voice',
    subtitle: 'From formal to conversational or executive',
    category: 'Writing',
    icon: 'PenTool',
    prompt: 'Rewrite the following text into 3 distinct voices: (1) executive and concise, (2) warm and conversational, (3) persuasive and energetic.\n\nText: "We need to fix our communication because projects are getting delayed and people are confused about what to prioritize."',
  },
  {
    title: 'Explain quantum computing simply',
    subtitle: 'With clear real-world analogies',
    category: 'Understand',
    icon: 'Lightbulb',
    prompt: 'Explain how quantum computing works and why it matters in simple terms using everyday analogies that anyone can understand.',
  },
  {
    title: 'Compare Groq vs Gemini vs OpenRouter',
    subtitle: 'Architectures, speed and ideal use cases',
    category: 'Tech',
    icon: 'Cpu',
    prompt: 'Compare Groq LPU inference, Google Gemini models, and the OpenRouter gateway. What are their unique strengths, speeds, and ideal use cases?',
  },
  {
    title: 'Code a clean TypeScript streaming utility',
    subtitle: 'Robust SSE consumer with error retry',
    category: 'Code',
    icon: 'Code2',
    prompt: 'Write a clean, production-ready TypeScript function that consumes a Server-Sent Events (SSE) streaming API with abort controller and error handling.',
  },
];
