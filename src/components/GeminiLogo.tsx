import React from 'react';
import { Zap, Globe } from 'lucide-react';
import { ProviderId } from '../types';

export function GeminiSparkleIcon({
  className = 'w-5 h-5',
  animated = false,
  useGradient = true,
}: {
  className?: string;
  animated?: boolean;
  useGradient?: boolean;
}) {
  if (!useGradient) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${animated ? 'animate-gemini-pulse' : ''}`}
      >
        <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" />
      </svg>
    );
  }

  // Iconic Google Gemini Multi-Color Gradient matching user screenshots
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-gemini-pulse' : ''}`}
    >
      <defs>
        <linearGradient id="geminiSparkleGradColor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="25%" stopColor="#FBBC04" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="75%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#9B72CB" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#geminiSparkleGradColor)"
      />
    </svg>
  );
}

export function ProviderIcon({ provider, className = 'w-4 h-4' }: { provider: ProviderId; className?: string }) {
  if (provider === 'groq') {
    return <Zap className={`${className} text-current`} />;
  }
  if (provider === 'openrouter') {
    return <Globe className={`${className} text-current`} />;
  }
  return <GeminiSparkleIcon className={className} />;
}

export function TanovaiLogo({
  showWordmark = true,
  subtitle,
  className = '',
}: {
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <GeminiSparkleIcon className="w-5 h-5 shrink-0" useGradient={true} />
      {showWordmark && (
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tracking-tight text-slate-800 font-sans">
            Tanovai
          </span>
          {subtitle && (
            <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-700 bg-slate-100 font-medium border border-slate-200">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Alias for backwards compatibility
export const GeminiLogo = TanovaiLogo;
