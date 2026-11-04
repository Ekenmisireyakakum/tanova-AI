import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env first, then .env.local overrides (matches the README's documented flow)
dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Avoid Express body-parser hanging in Vercel serverless functions when req.body is already pre-parsed
app.use((req, _res, next) => {
  if (req.body !== undefined) {
    (req as any)._body = true;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// CORS & Preflight handling for Vercel and local
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-groq-key, x-openrouter-key');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// Health / Status check
app.get(['/api/status', '/status', '*/status'], (_req: Request, res: Response) => {
  res.json({
    geminiEnvKeyAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    groqEnvKeyAvailable: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0),
    openrouterEnvKeyAvailable: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0),
  });
});

// Test API Key endpoint
app.post(['/api/test-key', '/test-key', '*/test-key'], async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});
    const { provider, apiKey } = body;

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

  if (provider === 'gemini') {
      const ai = new GoogleGenAI({
        apiKey: effectiveKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const testModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let response: any = null;
      let lastTestErr: any = null;
      for (const m of testModels) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: 'Hi',
          });
          if (response) break;
        } catch (testErr: any) {
          lastTestErr = testErr;
          const testErrMsg = String(testErr?.message || testErr).toLowerCase();
          if (
            testErrMsg.includes('404') ||
            testErrMsg.includes('not found') ||
            testErrMsg.includes('unsupported') ||
            testErrMsg.includes('503') ||
            testErrMsg.includes('unavailable') ||
            testErrMsg.includes('high demand')
          ) {
            continue;
          }
          throw testErr;
        }
      }
      if (!response && lastTestErr) {
        throw lastTestErr;
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

// Image generation endpoint using Gemini imagen model
app.post(['/api/images/generate', '/images/generate', '*/images/generate'], async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});
    const { prompt, apiKey, apiKeys } = body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ error: 'A prompt is required' });
      return;
    }

    const geminiKey = getEffectiveKey('gemini', apiKey, apiKeys);
    if (!geminiKey) {
      res.status(401).json({ error: 'No Gemini API key found. Image generation requires a Gemini API key.' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const imageResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt.trim(),
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
      },
    });

    const image = imageResponse.generatedImages?.[0];
    if (!image?.image?.imageBytes) {
      res.status(500).json({ error: 'Image generation returned no data.' });
      return;
    }

    const b64 = image.image.imageBytes;
    const dataUrl = `data:image/jpeg;base64,${b64}`;
    res.json({ url: dataUrl });
  } catch (err: any) {
    console.error('Image generation error:', err);
    const msg = err?.message || String(err);
    if (msg.toLowerCase().includes('not supported') || msg.includes('404')) {
      res.status(400).json({ error: 'Image generation is not available with your current API key or plan. Imagen requires a paid Google AI API key.' });
    } else {
      res.status(500).json({ error: msg || 'Image generation failed.' });
    }
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
    add('openrouter', 'google/gemini-2.0-flash-exp:free', 'Gemini Flash (OpenRouter)');
    add('openrouter', 'meta-llama/llama-3.3-70b-instruct', 'Llama 3.3 70B (OpenRouter)');
  }

  // 3. Cross-Provider Fallback (Backup to other available providers)
  if (hasGeminiKey && primaryProvider !== 'gemini') {
    add('gemini', 'gemini-3.8-flash', 'Gemini 3.8 Flash');
    add('gemini', 'gemini-3.1-flash-lite', 'Gemini 3.1 Flash Lite');
  }
  if (hasOpenRouterKey && primaryProvider !== 'openrouter') {
    add('openrouter', 'google/gemini-2.0-flash-exp:free', 'Gemini Flash (OpenRouter)');
  }
  if (hasGroqKey && primaryProvider !== 'groq') {
    add('groq', 'openai/gpt-oss-20b', 'Groq GPT OSS 20B');
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
    let modelName = cand.model;
    if (
      modelName === 'gemini-3.1-pro' ||
      modelName === 'gemini-2.5-pro' ||
      modelName === 'gemini-4-argon' ||
      modelName === 'auto' ||
      modelName === 'gemini-auto'
    ) {
      modelName = 'gemini-3.8-flash';
    }

    const candidateModels = [
      modelName,
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    let responseStream: any = null;
    let lastGeminiErr: any = null;

    for (const testModel of candidateModels) {
      try {
        const streamConfig: any = {};
        if (systemInstruction && systemInstruction.trim().length > 0) {
          streamConfig.systemInstruction = systemInstruction.trim();
        }
        if (!testModel.includes('3.8') && !testModel.includes('4-argon') && typeof temperature === 'number') {
          streamConfig.temperature = temperature;
        }

        responseStream = await ai.models.generateContentStream({
          model: testModel,
          contents,
          config: Object.keys(streamConfig).length > 0 ? streamConfig : undefined,
        });
        if (responseStream) break;
      } catch (gemErr: any) {
        lastGeminiErr = gemErr;
        const msg = String(gemErr?.message || gemErr).toLowerCase();
        if (
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('unsupported') ||
          msg.includes('is not supported') ||
          msg.includes('503') ||
          msg.includes('unavailable') ||
          msg.includes('high demand')
        ) {
          continue;
        }
        throw gemErr;
      }
    }

    if (!responseStream) {
      throw lastGeminiErr || new Error('Failed to start Gemini generation stream');
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
app.post(['/api/chat/stream', '/chat/stream', '*/chat/stream'], async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.body;
    let body = rawBody;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = {};
      }
    } else if (!rawBody) {
      body = {};
    }

    const {
      provider = 'gemini',
      model,
      messages,
      apiKey,
      apiKeys,
      systemInstruction,
      temperature,
      autoFallback = true,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'A non-empty messages array is required' });
      return;
    }

    const hasGemini = Boolean(getEffectiveKey('gemini', apiKey, apiKeys));
    const hasGroq = Boolean(getEffectiveKey('groq', apiKey, apiKeys));
    const hasOpenRouter = Boolean(getEffectiveKey('openrouter', apiKey, apiKeys));
    const hasAnyKey = hasGemini || hasGroq || hasOpenRouter;

    if (!hasAnyKey) {
      res.status(401).json({
        error: `No API key found for ${provider}. Please set GEMINI_API_KEY in your Vercel Environment Variables, or enter your API key in Settings.`,
      });
      return;
    }

    // Set SSE response headers (no Connection: keep-alive to support HTTP/2 and Vercel serverless)
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      try {
        res.flushHeaders();
      } catch {}
    }

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
        return 'The requested model is temporarily unavailable. Please verify your API key or try Gemini 3.8 Flash.';
      }

      return text.trim();
    }

    // Helper to send SSE event
    const sendEvent = (data: any) => {
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      } catch (writeErr) {
        console.warn('Failed to write SSE event:', writeErr);
      }
    };

    const sendError = (errorMessage: any) => {
      sendEvent({ error: formatErrorMessage(errorMessage) });
      try {
        res.write('data: [DONE]\n\n');
        res.end();
      } catch {}
    };

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
  } catch (outerErr: any) {
    console.error('Unhandled chat/stream error in handler:', outerErr);
    if (!res.headersSent) {
      res.status(500).json({
        error: outerErr?.message || 'Internal server error while processing request',
      });
    } else {
      try {
        res.write(`data: ${JSON.stringify({ error: outerErr?.message || 'Stream connection error' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } catch {}
    }
  }
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

// Only start standalone HTTP server when not in a serverless environment like Vercel
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
