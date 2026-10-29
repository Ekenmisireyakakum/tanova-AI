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
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Hi',
      });
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
app.post('/api/chat/stream', async (req: Request, res: Response): Promise<void> => {
  const { provider, model, messages, apiKey, systemInstruction, temperature } = req.body;

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

  // Helper to send SSE event
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const sendError = (errorMessage: string) => {
    sendEvent({ error: errorMessage });
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // 1. GOOGLE GEMINI
  if (provider === 'gemini') {
    const keyToUse = (apiKey && apiKey.trim().length > 0) ? apiKey.trim() : process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      sendError('Gemini API key is missing. Please set your key in Settings or configure GEMINI_API_KEY.');
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Format conversation history for Gemini SDK
      // Roles must be 'user' or 'model'
      const contents = messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }],
      }));

      const modelToUse = model || 'gemini-3.8-flash';

      const responseStream = await ai.models.generateContentStream({
        model: modelToUse,
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          sendEvent({ text });
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err: any) {
      console.error('Gemini streaming error:', err);
      sendError(err?.message || 'Error occurred while streaming Gemini response.');
      return;
    }
  }

  // 2. GROQ
  if (provider === 'groq') {
    const groqKey =
      apiKey && apiKey.trim().length > 0 ? apiKey.trim() : process.env.GROQ_API_KEY?.trim();
    if (!groqKey) {
      sendError('Groq API key is missing. Please add your Groq API key in Settings (starts with gsk_).');
      return;
    }

    try {
      const formattedMessages = [...messages];
      if (systemInstruction && systemInstruction.trim().length > 0) {
        formattedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'openai/gpt-oss-120b',
          messages: formattedMessages,
          stream: true,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        }),
      });

      if (!groqRes.ok) {
        const errJson = await groqRes.json().catch(() => ({}));
        const msg = (errJson as any)?.error?.message || `Groq request failed with HTTP ${groqRes.status}`;
        sendError(msg);
        return;
      }

      if (!groqRes.body) {
        sendError('No response stream received from Groq.');
        return;
      }

      // Stream lines from Groq response
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

          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                sendEvent({ text: deltaContent });
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err: any) {
      console.error('Groq streaming error:', err);
      sendError(err?.message || 'Error occurred while contacting Groq.');
      return;
    }
  }

  // 3. OPENROUTER
  if (provider === 'openrouter') {
    const openRouterKey = (apiKey && apiKey.trim().length > 0) ? apiKey.trim() : process.env.OPENROUTER_API_KEY?.trim();
    if (!openRouterKey) {
      sendError('OpenRouter API key is missing. Please add your OpenRouter key in Settings (starts with sk-or-v1-).');
      return;
    }

    try {
      const formattedMessages = [...messages];
      if (systemInstruction && systemInstruction.trim().length > 0) {
        formattedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gemini.google.com',
          'X-Title': 'Gemini Multi-Provider Chat',
        },
        body: JSON.stringify({
          model: model || 'meta-llama/llama-3.3-70b-instruct',
          messages: formattedMessages,
          stream: true,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        }),
      });

      if (!orRes.ok) {
        const errJson = await orRes.json().catch(() => ({}));
        let msg = (errJson as any)?.error?.message || `OpenRouter request failed with HTTP ${orRes.status}`;
        if (msg.toLowerCase().includes('insufficient credits')) {
          msg = `${msg} Tip: Try selecting a free-tier model such as Nemotron 3.5 Lightning (Free) or Liquid LFM 2.5 (Free) from the model selector!`;
        }
        sendError(msg);
        return;
      }

      if (!orRes.body) {
        sendError('No response stream received from OpenRouter.');
        return;
      }

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

          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                sendEvent({ text: deltaContent });
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err: any) {
      console.error('OpenRouter streaming error:', err);
      sendError(err?.message || 'Error occurred while contacting OpenRouter.');
      return;
    }
  }

  sendError(`Unsupported provider "${provider}". Choose Google Gemini, Groq, or OpenRouter.`);
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
