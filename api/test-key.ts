import app from '../server';

export const maxDuration = 30;

export default function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-groq-key, x-openrouter-key');
    res.status(204).end();
    return;
  }
  req.url = '/api/test-key';
  return app(req, res);
}
