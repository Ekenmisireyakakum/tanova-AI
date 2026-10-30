import React, { useState } from 'react';
import { X, User, Mail, Calendar, LogOut, Key, Check, Edit2, Sparkles, UserPlus } from 'lucide-react';
import { UserAccount } from '../types';
import { updateUserProfile } from '../utils/storage';
import { GeminiSparkleIcon } from './GeminiLogo';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSettings: () => void;
  sessionCount: number;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenSettings,
  sessionCount,
}: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');

  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setIsEditing(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!currentUser || !editName.trim()) return;
    updateUserProfile(currentUser.id, { name: editName.trim() });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col text-black dark:text-white transition-all">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GeminiSparkleIcon className="w-5 h-5" useGradient={true} />
            <h2 className="text-lg font-semibold tracking-tight font-['Google_Sans']">
              Tanovai Account
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {currentUser ? (
            <>
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1c] border border-zinc-200 dark:border-zinc-800">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-lg border-2 border-white/20 shadow-md"
                  style={{
                    backgroundColor: currentUser.avatarColor || '#4285F4',
                    backgroundImage: currentUser.avatarUrl ? `url('${currentUser.avatarUrl}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!currentUser.avatarUrl && getInitials(currentUser.name)}
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mb-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-sm font-semibold bg-white dark:bg-black px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        className="p-1 rounded bg-black text-white dark:bg-white dark:text-black"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold truncate text-black dark:text-white">
                        {currentUser.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        title="Edit name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>{currentUser.email}</span>
                  </p>

                  <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {/* Stats & Info */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1c] border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-xl font-bold text-black dark:text-white font-['Google_Sans']">
                    {sessionCount}
                  </span>
                  <span className="text-xs text-zinc-500">Saved Chats</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1c] border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-xl font-bold text-black dark:text-white font-['Google_Sans']">
                    3
                  </span>
                  <span className="text-xs text-zinc-500">Connected AI Engines</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-zinc-500" />
                    <span>Manage API Keys & Model Parameters</span>
                  </div>
                  <span className="text-zinc-400">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4 text-zinc-500" />
                    <span>Switch or Add Another Account</span>
                  </div>
                  <span className="text-zinc-400">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium transition-colors cursor-pointer mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Tanovai</span>
                </button>
              </div>
            </>
          ) : (
            /* Guest / Not logged in state */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                <User className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  You are currently browsing as a Guest
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                  Sign in or create an account to save your chat histories, customize models, and sync settings.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('signup');
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
