import React from 'react';
import { Menu, Settings, Download, Sparkles, PenLine, LogIn } from 'lucide-react';
import { ProviderId, ThemeMode, UserAccount } from '../types';
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
  onNewChat?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
  showModelInTopBar?: boolean;
}

export function TopBar({
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings,
  onOpenUpgrade,
  onOpenGetApp,
  onNewChat,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}: TopBarProps) {
  return (
    <header className="h-14 sm:h-16 bg-transparent px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left side: Menu hamburger button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f0f4f9] transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Collapse menu' : 'Main menu'}
          aria-label={isSidebarOpen ? 'Collapse menu' : 'Main menu'}
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Right side: Get app, Upgrade, and Dashed Pen button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* "Get app" button */}
        <button
          type="button"
          onClick={onOpenGetApp}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium text-[#1f1f1f] bg-[#f0f4f9] hover:bg-[#e3e8f0] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2] text-[#1f1f1f]" />
          <span>Get app</span>
        </button>

        {/* "Upgrade" button with soft blue pill */}
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-[#c2e7ff] hover:bg-[#b3ddfc] text-[#001d35] transition-colors cursor-pointer shadow-none"
        >
          <Sparkles className="w-4 h-4 fill-[#001d35] text-[#001d35]" />
          <span>Upgrade</span>
        </button>

        {/* Dashed circle pen icon button (as seen in screenshot) */}
        <button
          type="button"
          onClick={onNewChat || onOpenSettings}
          className="w-9 h-9 rounded-full border border-dashed border-[#72777a] hover:border-[#1f1f1f] hover:bg-[#f0f4f9] flex items-center justify-center text-[#444746] hover:text-[#1f1f1f] transition-all cursor-pointer"
          title="New chat"
          aria-label="New chat"
        >
          <PenLine className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* User profile avatar or Settings/Sign In if available */}
        {currentUser ? (
          <div
            onClick={onOpenProfile || onOpenSettings}
            className="cursor-pointer hover:opacity-85 transition-opacity ml-1"
            title={`Account: ${currentUser.name}`}
          >
            <UserAvatar user={currentUser} className="w-8 h-8" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
