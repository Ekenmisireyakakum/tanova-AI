import React from 'react';
import { Menu, Settings, Download, Sparkles, Sun, Moon, LogIn } from 'lucide-react';
import { ProviderId, ThemeMode, UserAccount } from '../types';
import { TanovaiLogo } from './GeminiLogo';
import { ModelSelector } from './ModelSelector';
import { UserAvatar } from './Sidebar';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
  onOpenGetApp: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
}

export function TopBar({
  onToggleSidebar,
  isSidebarOpen,
  currentProvider,
  currentModel,
  onSelectModel,
  onOpenSettings,
  onOpenUpgrade,
  onOpenGetApp,
  theme,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isSidebarOpen && <TanovaiLogo />}

        <div className="hidden sm:block ml-1">
          <ModelSelector
            currentProvider={currentProvider}
            currentModel={currentModel}
            onSelect={onSelectModel}
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
            onOpenSettings={onOpenSettings}
            compact
          />
        </div>

        {/* "Get app" button */}
        <button
          type="button"
          onClick={onOpenGetApp}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get app</span>
        </button>

        {/* "Upgrade" / "Advanced" button */}
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-current" />
          <span className="hidden xs:inline">Tanovai Pro</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Settings & Preferences"
          aria-label="Settings & Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile avatar or Sign In button */}
        {currentUser ? (
          <div
            onClick={onOpenProfile || onOpenSettings}
            className="cursor-pointer hover:opacity-85 transition-opacity"
            title={`Account: ${currentUser.name}`}
          >
            <UserAvatar user={currentUser} className="w-8 h-8" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth?.('login')}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-700 hover:bg-slate-800 text-white transition-opacity cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
