import app from '../_server';

// Configure max serverless execution duration (60s) for streaming responses on Vercel
export const maxDuration = 60;

export default function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-groq-key, x-openrouter-key');
    res.status(204).end();
    return;
  }
  req.url = '/api/chat/stream';
  return app(req, res);
}
