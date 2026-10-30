import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health / Status check
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    geminiEnvKeyAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    groqEnvKeyAvailable: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0),
    openrouterEnvKeyAvailable: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0),
  });
});

// Test API Key endpoint
app.post('/api/test-key', async (req: Request, res: Response): Promise<void> => {
  const { provider, apiKey } = req.body;

  if (!provider) {
    res.status(400).json({ valid: false, error: 'Provider is required' });
    return;
  }

  const effectiveKey =
    (apiKey && apiKey.trim().length > 0 ? apiKey.trim() : '') ||
    (provider === 'gemini' ? process.env.GEMINI_API_KEY : '') ||
    (provider === 'groq' ? process.env.GROQ_API_KEY : '') ||
    (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : '');

  if (!effectiveKey) {
    res.status(400).json({ valid: false, error: `No API key provided for ${provider}` });
    return;
  }

  try {
    if (provider === 'gemini') {
      const ai = new GoogleGenAI({
        apiKey: effectiveKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: 'Hi',
        });
      } catch (testErr: any) {
        const testErrMsg = String(testErr?.message || testErr);
        if (testErrMsg.includes('503') || testErrMsg.includes('UNAVAILABLE') || testErrMsg.toLowerCase().includes('high demand')) {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: 'Hi',
          });
        } else {
          throw testErr;
        }
      }
      if (response && response.text) {
        res.json({ valid: true, message: 'Google Gemini key is active and responding!' });
        return;
      }
      res.json({ valid: true, message: 'Google Gemini key verified' });
      return;
    }

    if (provider === 'groq') {
      const checkRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${effectiveKey.trim()}`,
        },
      });
      if (!checkRes.ok) {
        const errJson = await checkRes.json().catch(() => ({}));
        res.status(checkRes.status).json({
          valid: false,
          error: (errJson as any)?.error?.message || `Groq error: ${checkRes.status} ${checkRes.statusText}`,
        });
        return;
      }
      res.json({ valid: true, message: 'Groq key is valid and connected!' });
      return;
    }

    if (provider === 'openrouter') {
      const checkRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          Authorization: `Bearer ${effectiveKey.trim()}`,
        },
      });
      if (!checkRes.ok) {
        const errJson = await checkRes.json().catch(() => ({}));
        res.status(checkRes.status).json({
          valid: false,
          error: (errJson as any)?.error?.message || `OpenRouter error: ${checkRes.status} ${checkRes.statusText}`,
        });
        return;
      }
      const data = await checkRes.json().catch(() => ({}));
      res.json({
        valid: true,
        message: 'OpenRouter key is valid and connected!',
        data: (data as any)?.data,
      });
      return;
    }

    res.status(400).json({ valid: false, error: 'Unknown provider' });
  } catch (error: any) {
    console.error('Test key error:', error);
    res.status(500).json({ valid: false, error: error?.message || 'Verification failed' });
  }
});

// Unified Chat Streaming endpoint
// Model candidate interface for resilience mesh
interface ModelCandidate {
  provider: 'gemini' | 'groq' | 'openrouter';
  model: string;
  name: string;
}

function getEffectiveKey(
  provider: string,
  clientApiKey?: string,
  clientApiKeys?: Record<string, string>
): string {
  if (clientApiKey && clientApiKey.trim().length > 0) return clientApiKey.trim();
  if (clientApiKeys?.[provider]?.trim()?.length) return clientApiKeys[provider].trim();
  if (provider === 'gemini') return (process.env.GEMINI_API_KEY || '').trim();
  if (provider === 'groq') return (process.env.GROQ_API_KEY || '').trim();
  if (provider === 'openrouter') return (process.env.OPENROUTER_API_KEY || '').trim();
  return '';
}

function isRetryableSpike(error: any): boolean {
  if (!error) return false;
  const str = String(error?.message || error?.status || error).toLowerCase();
  return (
    str.includes('503') ||
    str.includes('unavailable') ||
    str.includes('high demand') ||
    str.includes('429') ||
    str.includes('resource_exhausted') ||
    str.includes('overloaded') ||
    str.includes('capacity') ||
    str.includes('502') ||
    str.includes('504') ||
    str.includes('rate limit') ||
    str.includes('insufficient credits') ||
    str.includes('temporarily unavailable')
  );
}

function getSpikeReason(error: any): string {
  const str = String(error?.message || error).toLowerCase();
  if (str.includes('503') || str.includes('unavailable') || str.includes('high demand')) {
    return 'High demand spike (503)';
  }
  if (str.includes('429') || str.includes('resource_exhausted') || str.includes('rate limit')) {
    return 'Traffic rate limit (429)';
  }
  if (str.includes('insufficient credits')) {
    return 'Credits limit (switched to free backup)';
  }
  if (str.includes('502') || str.includes('504')) {
    return 'Temporary gateway timeout';
  }
  return 'High traffic spike';
}

function buildFallbackChain(
  primaryProvider: 'gemini' | 'groq' | 'openrouter',
  primaryModel: string,
  autoFallback: boolean,
  hasGeminiKey: boolean,
  hasGroqKey: boolean,
  hasOpenRouterKey: boolean
): ModelCandidate[] {
  const chain: ModelCandidate[] = [];

  const add = (provider: 'gemini' | 'groq' | 'openrouter', model: string, name: string) => {
    if (!chain.some((c) => c.provider === provider && c.model === model)) {
      chain.push({ provider, model, name });
    }
  };

  // 1. Primary Model
  add(
    primaryProvider,
    primaryModel,
    `${primaryProvider === 'gemini' ? 'Gemini' : primaryProvider === 'groq' ? 'Groq' : 'OpenRouter'} ${primaryModel}`
  );

  if (!autoFallback) {
    return chain;
  }

  // 2. Intra-Provider Fallback (Backup within the same provider)
  if (primaryProvider === 'gemini') {
    if (primaryModel !== 'gemini-3.1-flash-lite') {
      add('gemini', 'gemini-3.1-flash-lite', 'Gemini 3.1 Flash Lite');
    } else {
      add('gemini', 'gemini-3.8-flash', 'Gemini 3.8 Flash');
    }
  } else if (primaryProvider === 'groq') {
    if (primaryModel === 'openai/gpt-oss-120b') {
      add('groq', 'openai/gpt-oss-20b', 'Groq GPT OSS 20B');
      add('groq', 'qwen/qwen3.8-27b', 'Groq Qwen 3.8 27B');
    } else if (primaryModel === 'openai/gpt-oss-20b') {
      add('groq', 'qwen/qwen3.8-27b', 'Groq Qwen 3.8 27B');
      add('groq', 'openai/gpt-oss-120b', 'Groq GPT OSS 120B');
    } else {
      add('groq', 'openai/gpt-oss-20b', 'Groq GPT OSS 20B');
    }
  } else if (primaryProvider === 'openrouter') {
    add('openrouter', 'nvidia/nemotron-3.5-lightning:free', 'Nemotron 3.5 Lightning (Free)');
    add('openrouter', 'liquid/lfm-2.5-2.6b:free', 'Liquid LFM 2.5 (Free)');
  }

  // 3. Cross-Provider Fallback (Backup to other available providers)
  if (hasGeminiKey && primaryProvider !== 'gemini') {
    add('gemini', 'gemini-3.1-flash-lite', 'Gemini 3.1 Flash Lite');
  }
  if (hasGroqKey && primaryProvider !== 'groq') {
    add('groq', 'openai/gpt-oss-20b', 'Groq GPT OSS 20B');
  }
  if (hasOpenRouterKey && primaryProvider !== 'openrouter') {
    add('openrouter', 'nvidia/nemotron-3.5-lightning:free', 'Nemotron 3.5 Lightning (Free)');
  }

  return chain;
}

async function executeCandidateStream(
  cand: ModelCandidate,
  effectiveKey: string,
  messages: any[],
  systemInstruction: string | undefined,
  temperature: number | undefined,
  onChunk: (text: string) => void
): Promise<void> {
  if (cand.provider === 'gemini') {
    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));
    const config: any = {};
    if (systemInstruction && systemInstruction.trim().length > 0) {
      config.systemInstruction = systemInstruction.trim();
    }
    if (!cand.model.includes('3.8') && !cand.model.includes('4-argon') && typeof temperature === 'number') {
      config.temperature = temperature;
    }
    let modelName = cand.model;
    if (modelName === 'gemini-3.1-pro') modelName = 'gemini-2.5-pro';
    if (modelName === 'gemini-4-argon') modelName = 'gemini-3.8-flash';

    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
    } catch (err: any) {
      if (modelName !== 'gemini-3.8-flash') {
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });
      } else {
        throw err;
      }
    }
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
    return;
  }

  if (cand.provider === 'groq') {
    const formattedMessages = [...messages];
    if (systemInstruction && systemInstruction.trim().length > 0) {
      formattedMessages.unshift({ role: 'system', content: systemInstruction.trim() });
    }
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cand.model,
        messages: formattedMessages,
        stream: true,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });
    if (!groqRes.ok) {
      const errJson = await groqRes.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || `Groq HTTP ${groqRes.status}`;
      throw new Error(msg);
    }
    if (!groqRes.body) throw new Error('No stream body from Groq');
    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') return;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch {}
        }
      }
    }
    return;
  }

  if (cand.provider === 'openrouter') {
    const formattedMessages = [...messages];
    if (systemInstruction && systemInstruction.trim().length > 0) {
      formattedMessages.unshift({ role: 'system', content: systemInstruction.trim() });
    }
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gemini.google.com',
        'X-Title': 'Gemini Multi-Provider Chat',
      },
      body: JSON.stringify({
        model: cand.model,
        messages: formattedMessages,
        stream: true,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });
    if (!orRes.ok) {
      const errJson = await orRes.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || `OpenRouter HTTP ${orRes.status}`;
      throw new Error(msg);
    }
    if (!orRes.body) throw new Error('No stream body from OpenRouter');
    const reader = orRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') return;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch {}
        }
      }
    }
    return;
  }

  throw new Error(`Unsupported provider: ${cand.provider}`);
}

// Unified Chat Streaming endpoint with Universal Fallback Mesh
app.post('/api/chat/stream', async (req: Request, res: Response): Promise<void> => {
  const {
    provider,
    model,
    messages,
    apiKey,
    apiKeys,
    systemInstruction,
    temperature,
    autoFallback = true,
  } = req.body;

  if (!provider || !messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Provider and a non-empty messages array are required' });
    return;
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Helper to format/clean raw error messages
  function formatErrorMessage(err: any): string {
    if (!err) return 'An unexpected error occurred.';
    let text = typeof err === 'string' ? err : err.message || String(err);

    // Unpack nested stringified JSON errors from upstream APIs
    for (let i = 0; i < 3; i++) {
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error?.message) {
          text = parsed.error.message;
        } else if (parsed?.message) {
          text = parsed.message;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    if (text.includes('503') || text.includes('UNAVAILABLE') || text.toLowerCase().includes('high demand')) {
      return 'The model is currently experiencing high demand (503). Spikes in demand are usually temporary. Please try again or switch to Gemini 3.1 Flash Lite.';
    }
    if (text.includes('429') || text.includes('RESOURCE_EXHAUSTED')) {
      return 'Rate limit reached (429). Please wait a moment before sending another message, or try Gemini 3.1 Flash Lite.';
    }
    if (text.toLowerCase().includes('api key') || text.toLowerCase().includes('api_key') || text.includes('401')) {
      return 'The requested model is temporarily unavailable. Please try Gemini 3.8 Flash or Gemini 3.1 Flash Lite.';
    }

    return text.trim();
  }

  // Helper to send SSE event
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  const sendError = (errorMessage: any) => {
    sendEvent({ error: formatErrorMessage(errorMessage) });
    res.write('data: [DONE]\n\n');
    res.end();
  };

  const hasGemini = Boolean(getEffectiveKey('gemini', apiKey, apiKeys));
  const hasGroq = Boolean(getEffectiveKey('groq', apiKey, apiKeys));
  const hasOpenRouter = Boolean(getEffectiveKey('openrouter', apiKey, apiKeys));

  const chain = buildFallbackChain(
    provider,
    model || (provider === 'gemini' ? 'gemini-3.8-flash' : provider === 'groq' ? 'openai/gpt-oss-120b' : 'meta-llama/llama-3.3-70b-instruct'),
    autoFallback !== false,
    hasGemini,
    hasGroq,
    hasOpenRouter
  );

  let streamedAnyChunk = false;
  let lastError: any = null;

  for (let i = 0; i < chain.length; i++) {
    const candidate = chain[i];
    const candKey = getEffectiveKey(candidate.provider, apiKey, apiKeys);
    if (!candKey) {
      continue;
    }

    if (i > 0) {
      console.log(`Auto-fallback engaged: routing from ${provider}:${model} to ${candidate.provider}:${candidate.model}`);
      sendEvent({
        fallback: {
          originalProvider: provider,
          originalModel: model,
          fallbackProvider: candidate.provider,
          fallbackModel: candidate.model,
          reason: getSpikeReason(lastError),
        },
      });
    }

    try {
      await executeCandidateStream(
        candidate,
        candKey,
        messages,
        systemInstruction,
        temperature,
        (chunkText) => {
          streamedAnyChunk = true;
          sendEvent({ text: chunkText });
        }
      );

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err: any) {
      console.warn(`Candidate ${candidate.provider}:${candidate.model} failed:`, err?.message || err);
      lastError = err;

      // If tokens have already begun streaming to user, cannot restart mid-generation
      if (streamedAnyChunk) {
        sendError(err);
        return;
      }

      // If autoFallback is disabled, fail immediately
      if (!autoFallback) {
        sendError(err);
        return;
      }

      // If error is not a transient spike and it was candidate 0, continue only if more candidates exist
      if (!isRetryableSpike(err) && i === 0 && !String(err?.message || err).includes('missing')) {
        sendError(err);
        return;
      }
    }
  }

  sendError(lastError || 'The selected model is temporarily unavailable. Please try again shortly or switch to Gemini 3.8 Flash.');
});

// Frontend serving
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini Multi-Provider Chat running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
