import React from 'react';
import { Zap, Globe } from 'lucide-react';
import { ProviderId } from '../types';

export function GeminiSparkleIcon({
  className = 'w-5 h-5',
  animated = false,
  useGradient = false,
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

  // Monochrome gradient for sleek pure black and white theme
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-gemini-pulse' : ''}`}
    >
      <defs>
        <linearGradient id="geminiSparkleGradMono" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#geminiSparkleGradMono)"
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

export function GeminiLogo({
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
      <GeminiSparkleIcon className="w-5 h-5 shrink-0 text-black dark:text-white" />
      {showWordmark && (
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-medium tracking-tight text-black dark:text-white font-['Google_Sans']">
            Gemini
          </span>
          {subtitle && (
            <span className="text-[10px] px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 font-medium border border-zinc-200 dark:border-zinc-700">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
