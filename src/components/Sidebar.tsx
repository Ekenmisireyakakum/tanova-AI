import React, { useState } from 'react';
import {
  SquarePen,
  LayoutGrid,
  Image as ImageIcon,
  Clock,
  GraduationCap,
  Hexagon,
  Plus,
  Filter,
  Search,
  Settings,
  Trash2,
  X,
  User,
} from 'lucide-react';
import { ChatSession, ThemeMode, UserAccount } from '../types';
import { GeminiSparkleIcon } from './GeminiLogo';

export function UserAvatar({
  user,
  className = 'w-8 h-8',
}: {
  user?: UserAccount | null;
  className?: string;
}) {
  if (!user) {
    return (
      <div className={`${className} rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 text-zinc-500`}>
        <User className="w-4 h-4" />
      </div>
    );
  }

  if (user.avatarUrl) {
    return (
      <div
        className={`${className} rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 relative shrink-0 shadow-xs bg-zinc-900 flex items-center justify-center`}
      >
        <div
          className="w-full h-full rounded-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('${user.avatarUrl}')`,
            backgroundPosition: '50% 96.2%',
            backgroundSize: '175%',
          }}
        />
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      className={`${className} rounded-full border border-zinc-300 dark:border-zinc-700 relative shrink-0 shadow-xs flex items-center justify-center text-white text-xs font-semibold`}
      style={{ backgroundColor: user.avatarColor || '#4285F4' }}
    >
      {initials}
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onToggle?: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  geminiEnvAvailable?: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser?: UserAccount | null;
  onOpenProfile?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenStudents?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  onOpenHelp,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onOpenStudents,
}: SidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filtered chats list
  const filteredSessions = sessions.filter((s) =>
    (s.title || 'Untitled conversation').toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleActionClick = (actionName: string) => {
    if (actionName === 'customize') {
      onOpenSettings();
    } else if (actionName === 'students') {
      if (onOpenStudents) onOpenStudents();
      else onNewChat();
    } else if (actionName === 'new-notebook') {
      if (onOpenStudents) onOpenStudents();
      else onNewChat();
    } else {
      onNewChat();
    }
    // Only auto-close on very small mobile phones (< 640px), not in normal desktop / preview split pane!
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      onClose();
    }
  };

  const handleExpandAndSearch = () => {
    if (onOpen) onOpen();
    else if (onToggle) onToggle();
    setShowSearch(true);
  };

  const handleToggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else if (isOpen) {
      onClose();
    } else if (onOpen) {
      onOpen();
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay (only on very small mobile screens) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 sm:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Main Sidebar Wrapper */}
      <aside
        className={`fixed sm:relative inset-y-0 left-0 z-50 sm:z-20 shrink-0 h-full bg-white dark:bg-[#131314] text-black dark:text-[#e3e3e3] border-r border-zinc-200 dark:border-[#262626] flex flex-col transition-all duration-300 ease-in-out select-none shadow-2xl sm:shadow-none overflow-hidden ${
          isOpen
            ? 'w-[275px] translate-x-0'
            : '-translate-x-full sm:translate-x-0 sm:w-[68px]'
        }`}
      >
        {/* ======================================================== */}
        {/* MINIMIZED ICON RAIL (Rendered on desktop/tablet when collapsed) */}
        {/* Matches user screenshot image_48d5d302.png               */}
        {/* ======================================================== */}
        <div
          className={`w-[68px] h-full flex flex-col items-center justify-between py-3 transition-opacity duration-200 ${
            isOpen ? 'hidden' : 'hidden sm:flex'
          }`}
        >
          {/* Top Section: Sparkle Icon + Actions */}
          <div className="flex flex-col items-center w-full">
            {/* Top Gemini Sparkle Button (Click to expand sidebar) */}
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-[#282a2c] transition-colors mb-4 group cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <GeminiSparkleIcon className="w-6 h-6 group-hover:scale-105 transition-transform" useGradient={true} />
            </button>

            {/* Vertical Action Icon Stack */}
            <div className="flex flex-col items-center gap-1.5 w-full px-2">
              {/* 1. New Chat (Rounded button with Pen icon) */}
              <button
                type="button"
                onClick={onNewChat}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 dark:border-transparent dark:bg-[#282a2c] dark:hover:bg-[#333537] dark:text-white transition-colors shadow-2xs group"
                title="New chat"
                aria-label="New chat"
              >
                <SquarePen className="w-4 h-4 text-black dark:text-white group-hover:scale-105 transition-transform" />
              </button>

              {/* 2. Search */}
              <button
                type="button"
                onClick={handleExpandAndSearch}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Search conversations"
                aria-label="Search conversations"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* 3. Library (4 squares) */}
              <button
                type="button"
                onClick={() => handleActionClick('library')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Library"
                aria-label="Library"
              >
                <LayoutGrid className="w-[18px] h-[18px]" />
              </button>

              {/* 4. Images */}
              <button
                type="button"
                onClick={() => handleActionClick('images')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Images"
                aria-label="Images"
              >
                <ImageIcon className="w-[18px] h-[18px]" />
              </button>

              {/* 5. Scheduled */}
              <button
                type="button"
                onClick={() => handleActionClick('scheduled')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Scheduled"
                aria-label="Scheduled"
              >
                <Clock className="w-[18px] h-[18px]" />
              </button>

              {/* 6. Students */}
              <button
                type="button"
                onClick={() => handleActionClick('students')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Students"
                aria-label="Students"
              >
                <GraduationCap className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Bottom Section: Settings & User Avatar */}
          <div className="flex flex-col items-center gap-2.5 pb-1">
            {/* Settings Gear */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>

            {/* User Profile Avatar */}
            <div
              onClick={() => {
                if (currentUser) {
                  if (onOpenProfile) onOpenProfile();
                  else onOpenSettings();
                } else {
                  onOpenAuth?.('login');
                }
              }}
              className="cursor-pointer hover:opacity-85 transition-opacity"
              title={currentUser ? `Account: ${currentUser.name}` : 'Sign In'}
            >
              <UserAvatar user={currentUser} className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXPANDED FULL SIDEBAR (Rendered when isOpen is true)     */}
        {/* Matches user screenshot image_5e83836f.png               */}
        {/* ======================================================== */}
        <div
          className={`w-[275px] h-full flex flex-col transition-opacity duration-200 ${
            isOpen ? 'flex opacity-100' : 'hidden opacity-0'
          }`}
        >
          {/* Top Header: Tanovai Logo + Search Button + Collapse Squircle Button */}
          <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2 border-b border-transparent">
            {/* Tanovai Wordmark & Sparkle */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={onNewChat} title="Tanovai">
              <GeminiSparkleIcon className="w-5 h-5 shrink-0" useGradient={true} />
              <span className="text-[19px] font-medium tracking-tight text-black dark:text-white font-['Google_Sans']">
                Tanovai
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Search Icon Button */}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors"
                title="Search conversations"
                aria-label="Search conversations"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Collapse Sidebar Button (Squircle with vertical line from screenshot) */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black dark:bg-[#282a2c] dark:hover:bg-[#333537] dark:text-[#c4c7c5] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="4" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Search Input */}
          {showSearch && (
            <div className="px-3 pb-2 pt-1 transition-all">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-100 dark:bg-[#0c0c0c] text-black dark:text-white placeholder-zinc-500 rounded-lg border border-zinc-300 dark:border-[#333537] focus:outline-none focus:border-black dark:focus:border-white"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action List */}
          <div className="px-2 pt-1 space-y-0.5">
            {/* New Chat Button (Pill shape) */}
            <button
              type="button"
              onClick={() => {
                onNewChat();
                if (typeof window !== 'undefined' && window.innerWidth < 640) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 dark:border-transparent dark:bg-[#282a2c] dark:hover:bg-[#333537] dark:text-white text-[13.5px] font-medium transition-colors"
            >
              <SquarePen className="w-4 h-4 text-black dark:text-white shrink-0" />
              <span>New chat</span>
            </button>

            {/* Library */}
            <button
              type="button"
              onClick={() => handleActionClick('library')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <LayoutGrid className="w-4 h-4 text-current shrink-0" />
              <span>Library</span>
            </button>

            {/* Images */}
            <button
              type="button"
              onClick={() => handleActionClick('images')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <ImageIcon className="w-4 h-4 text-current shrink-0" />
              <span>Images</span>
            </button>

            {/* Scheduled */}
            <button
              type="button"
              onClick={() => handleActionClick('scheduled')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-current shrink-0" />
              <span>Scheduled</span>
            </button>

            {/* Students */}
            <button
              type="button"
              onClick={() => handleActionClick('students')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <GraduationCap className="w-4 h-4 text-current shrink-0" />
              <span>Students</span>
            </button>

            {/* Customize */}
            <button
              type="button"
              onClick={() => handleActionClick('customize')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <Hexagon className="w-4 h-4 text-current shrink-0" />
              <span>Customize</span>
            </button>
          </div>

          {/* Notebooks Section */}
          <div className="px-3 pt-3.5 pb-1">
            <div className="text-[12px] font-medium text-zinc-500 dark:text-[#8e918f] mb-0.5 px-1">
              Notebooks
            </div>
            <button
              type="button"
              onClick={() => handleActionClick('new-notebook')}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13.5px] font-normal text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c]/60 transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-current shrink-0" />
              <span>New notebook</span>
            </button>
          </div>

          {/* Chats Section: "All" + Filter Icon */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
            <span className="text-[12px] font-medium text-zinc-500 dark:text-[#8e918f]">
              All
            </span>
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 text-zinc-500 hover:text-black dark:text-[#8e918f] dark:hover:text-white rounded transition-colors"
              title="Filter conversations"
              aria-label="Filter conversations"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-0.5 space-y-0.5 min-h-[140px]">
            {filteredSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-[#75777a]">
                {filterQuery ? 'No matching conversations' : 'No chats yet'}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      if (typeof window !== 'undefined' && window.innerWidth < 640) onClose();
                    }}
                    className={`group relative flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-zinc-200 text-black font-medium dark:bg-[#282a2c] dark:text-white'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-[#c4c7c5] dark:hover:bg-[#282a2c]/50 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {session.title || 'Untitled conversation'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-black dark:text-[#8e918f] dark:hover:text-white rounded hover:bg-zinc-200 dark:hover:bg-[#333537] transition-all shrink-0"
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Pinned User Profile Bar */}
          <div className="p-2.5 border-t border-zinc-200 dark:border-[#282a2c] flex items-center justify-between bg-white dark:bg-[#131314]">
            {currentUser ? (
              <div
                onClick={onOpenProfile || onOpenSettings}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                title={`Account: ${currentUser.name}`}
              >
                {/* User Avatar */}
                <UserAvatar user={currentUser} className="w-8 h-8" />

                {/* User Name */}
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-black dark:text-white truncate block">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate block">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onOpenAuth?.('login')}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                title="Sign in or create account"
              >
                <UserAvatar user={null} className="w-8 h-8" />
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-black dark:text-white truncate block">
                    Sign In / Sign Up
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate block">
                    Guest session
                  </span>
                </div>
              </div>
            )}

            {/* Settings Gear Icon */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-[#c4c7c5] dark:hover:text-white dark:hover:bg-[#282a2c] transition-colors shrink-0 ml-1"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
