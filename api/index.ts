import app from '../server';

// Configure max serverless execution duration (60s) for streaming responses on Vercel
export const maxDuration = 60;

export default function handler(req: any, res: any) {
  // If req.url was rewritten to /api/index.ts, recover original path from Vercel headers if present
  const original = req.headers['x-matched-path'] || req.headers['x-now-route-matches'] || req.originalUrl || req.url;
  if (original && typeof original === 'string' && original !== '/api/index.ts' && original !== '/api') {
    req.url = original;
  }
  return app(req, res);
}
