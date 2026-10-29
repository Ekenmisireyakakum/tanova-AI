import React from 'react';
import { Menu, Settings, Download, Sparkles, Sun, Moon } from 'lucide-react';
import { ProviderId, ThemeMode } from '../types';
import { GeminiLogo } from './GeminiLogo';
import { ModelSelector } from './ModelSelector';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  apiKeys: { gemini: string; groq: string; openrouter: string };
  geminiEnvAvailable: boolean;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
  onOpenGetApp: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function TopBar({
  onToggleSidebar,
  isSidebarOpen,
  currentProvider,
  currentModel,
  onSelectModel,
  apiKeys,
  geminiEnvAvailable,
  onOpenSettings,
  onOpenUpgrade,
  onOpenGetApp,
  theme,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-zinc-200 dark:border-[#262626] bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <GeminiLogo />

        <div className="hidden sm:block ml-1">
          <ModelSelector
            currentProvider={currentProvider}
            currentModel={currentModel}
            onSelect={onSelectModel}
            apiKeys={apiKeys}
            geminiEnvAvailable={geminiEnvAvailable}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile model selector */}
        <div className="block sm:hidden">
          <ModelSelector
            currentProvider={currentProvider}
            currentModel={currentModel}
            onSelect={onSelectModel}
            apiKeys={apiKeys}
            geminiEnvAvailable={geminiEnvAvailable}
            onOpenSettings={onOpenSettings}
            compact
          />
        </div>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all shadow-2xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-white" />
          ) : (
            <Moon className="w-4 h-4 text-black" />
          )}
        </button>

        {/* "Get app" button */}
        <button
          type="button"
          onClick={onOpenGetApp}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get app</span>
        </button>

        {/* "Upgrade" / "Advanced" button */}
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-black dark:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shadow-2xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-current" />
          <span className="hidden xs:inline">Try Advanced</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Settings & API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile avatar (Pure black/white) */}
        <div
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-semibold cursor-pointer shadow-2xs border border-zinc-300 dark:border-zinc-700 shrink-0"
          title="Account & Keys"
        >
          U
        </div>
      </div>
    </header>
  );
}
