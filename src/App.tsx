import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSession, ProviderId, AppSettings, ServerStatus, ThemeMode, UserAccount } from './types';
import {
  loadActiveModelSelection,
  loadActiveSessionId,
  loadSessions,
  loadSettings,
  loadCurrentUser,
  logoutUser,
  saveActiveModelSelection,
  saveActiveSessionId,
  saveSessions,
  saveSettings,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { ChatMessagesView } from './components/ChatMessagesView';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { UpgradeModal } from './components/UpgradeModal';
import { GetAppModal } from './components/GetAppModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  // State management
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => loadActiveSessionId());

  const initialModel = loadActiveModelSelection();
  const [currentProvider, setCurrentProvider] = useState<ProviderId>(initialModel.provider);
  const [currentModel, setCurrentModel] = useState<string>(initialModel.model);

  const [geminiEnvAvailable, setGeminiEnvAvailable] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    geminiEnvKeyAvailable: true,
    groqEnvKeyAvailable: true,
    openrouterEnvKeyAvailable: true,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('gemini_sidebar_open_v1');
      if (stored !== null) return stored === 'true';
    } catch {}
    return true;
  });
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('gemini_sidebar_open_v1', String(isSidebarOpen));
    } catch {}
  }, [isSidebarOpen]);

  // User Authentication & Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isGetAppOpen, setIsGetAppOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Apply theme to document root (dark class, attributes, and styles)
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [settings.theme]);

  // Check server environment status for all provider keys on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data: ServerStatus) => {
        setServerStatus(data);
        setGeminiEnvAvailable(Boolean(data.geminiEnvKeyAvailable));
      })
      .catch((err) => {
        console.warn('Failed to query server status:', err);
      });
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Save active session id
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Theme toggle handler
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    saveSettings(updated);
  };

  // Save model selection
  const handleSelectModel = (provider: ProviderId, model: string) => {
    setCurrentProvider(provider);
    setCurrentModel(model);
    saveActiveModelSelection(provider, model);

    // If active session exists, update its model & provider
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, provider, model, updatedAt: Date.now() } : s
        )
      );
    }
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages: ChatMessage[] = currentSession ? currentSession.messages : [];
  const hasMessages = messages.length > 0;

  // New Chat Handler
  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveSessionId(null);
  };

  // Select Session Handler
  const handleSelectSession = (id: string) => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveSessionId(id);
    const targetSession = sessions.find((s) => s.id === id);
    if (targetSession) {
      setCurrentProvider(targetSession.provider);
      setCurrentModel(targetSession.model);
    }
  };

  // Delete Session Handler
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    setSessions([]);
    setActiveSessionId(null);
  };

  // Check if a provider has an available API key (either client-side or server-side env)
  const isProviderAvailable = (provider: ProviderId): boolean => {
    const userKey = settings.apiKeys[provider]?.trim();
    if (userKey && userKey.length > 0) return true;
    if (provider === 'gemini') return Boolean(serverStatus.geminiEnvKeyAvailable ?? geminiEnvAvailable);
    if (provider === 'groq') return Boolean(serverStatus.groqEnvKeyAvailable);
    if (provider === 'openrouter') return Boolean(serverStatus.openrouterEnvKeyAvailable);
    return false;
  };

  // Send Message / Streaming logic
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Determine active provider & auto-fallback if selected provider has no key
    let activeProvider = currentProvider;
    let activeModel = currentModel;

    if (!isProviderAvailable(activeProvider)) {
      if (isProviderAvailable('gemini')) {
        activeProvider = 'gemini';
        activeModel = 'gemini-3.8-flash';
        setCurrentProvider('gemini');
        setCurrentModel('gemini-3.8-flash');
      } else if (isProviderAvailable('groq')) {
        activeProvider = 'groq';
        activeModel = 'openai/gpt-oss-120b';
        setCurrentProvider('groq');
        setCurrentModel('openai/gpt-oss-120b');
      } else if (isProviderAvailable('openrouter')) {
        activeProvider = 'openrouter';
        activeModel = 'anthropic/claude-3.5-sonnet';
        setCurrentProvider('openrouter');
        setCurrentModel('anthropic/claude-3.5-sonnet');
      } else {
        setIsSettingsOpen(true);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      provider: activeProvider,
      model: activeModel,
      isStreaming: true,
    };

    let targetSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    if (!targetSessionId) {
      // Create new session
      targetSessionId = `session-${Date.now()}`;
      const title = text.length > 40 ? `${text.slice(0, 38)}...` : text;
      const newSession: ChatSession = {
        id: targetSessionId,
        title,
        messages: [userMessage, assistantPlaceholder],
        provider: activeProvider,
        model: activeModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updatedSessions = [newSession, ...updatedSessions];
      setSessions(updatedSessions);
      setActiveSessionId(targetSessionId);
    } else {
      // Append to existing session
      updatedSessions = updatedSessions.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            provider: activeProvider,
            model: activeModel,
            messages: [...s.messages, userMessage, assistantPlaceholder],
            updatedAt: Date.now(),
          };
        }
        return s;
      });
      setSessions(updatedSessions);
    }

    // Prepare messages history for API
    const sessionMessages =
      updatedSessions.find((s) => s.id === targetSessionId)?.messages || [];
    // Exclude the currently streaming assistant placeholder
    const conversationHistory = sessionMessages
      .filter((m) => m.id !== assistantMessageId)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: activeProvider,
          model: activeModel,
          messages: conversationHistory,
          apiKey: settings.apiKeys[activeProvider],
          apiKeys: settings.apiKeys,
          temperature: settings.temperature,
          systemInstruction: settings.systemPrompt,
          autoFallback: settings.autoFallback !== false,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(
          (errorJson as any)?.error || `Server responded with ${response.status} ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error('Readable stream not supported in response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed === 'data: [DONE]') {
            break;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.fallback) {
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === targetSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId
                            ? {
                                ...m,
                                fallback: data.fallback,
                                provider: data.fallback.fallbackProvider,
                                model: data.fallback.fallbackModel,
                              }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              }
              if (data.text) {
                accumulatedText += data.text;
                // Update assistant message in state
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === targetSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedText, isStreaming: true }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              }
            } catch (parseErr: any) {
              if (parseErr.message && !parseErr.message.includes('Unexpected end of JSON')) {
                throw parseErr;
              }
            }
          }
        }
      }

      // Mark streaming complete
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulatedText, isStreaming: false }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User intentionally stopped streaming
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return s;
          })
        );
      } else {
        console.error('Chat error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        error: err?.message || 'An error occurred while generating a response.',
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!currentSession || messages.length === 0 || isStreaming) return;

    // Find the last user message
    const lastUserMsgIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserMsgIdx;
    const lastUserMsg = messages[actualIdx];

    // Remove any assistant responses after this user message
    const prunedMessages = messages.slice(0, actualIdx);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: prunedMessages } : s
      )
    );

    // Re-send user message
    handleSendMessage(lastUserMsg.content);
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        settings.theme === 'dark' ? 'dark bg-black text-white' : 'light bg-white text-black'
      } select-text transition-colors duration-200`}
      data-theme={settings.theme}
    >
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsUpgradeOpen(true)}
        geminiEnvAvailable={geminiEnvAvailable}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenStudents={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Bar */}
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          currentProvider={currentProvider}
          currentModel={currentModel}
          onSelectModel={handleSelectModel}
          apiKeys={settings.apiKeys}
          geminiEnvAvailable={geminiEnvAvailable}
          serverStatus={serverStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenGetApp={() => setIsGetAppOpen(true)}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* View Switch: Landing Screen vs Chat Interface */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {!hasMessages ? (
            <LandingView
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              currentProvider={currentProvider}
              currentModel={currentModel}
              onSelectModel={handleSelectModel}
              apiKeys={settings.apiKeys}
              geminiEnvAvailable={geminiEnvAvailable}
              serverStatus={serverStatus}
              onOpenSettings={() => setIsSettingsOpen(true)}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Scrollable Chat Messages */}
              <ChatMessagesView
                messages={messages}
                isStreaming={isStreaming}
                onRegenerate={handleRegenerate}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSelectModel={handleSelectModel}
              />

              {/* Bottom Sticky Input Bar */}
              <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/95 dark:to-transparent pt-4 pb-3 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto w-full">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isStreaming={isStreaming}
                    onStopStreaming={handleStopStreaming}
                    currentProvider={currentProvider}
                    currentModel={currentModel}
                    onSelectModel={handleSelectModel}
                    apiKeys={settings.apiKeys}
                    geminiEnvAvailable={geminiEnvAvailable}
                    serverStatus={serverStatus}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    placeholder={`Ask ${currentModel}...`}
                  />

                  {/* Tanovai Disclaimer */}
                  <p className="text-[11px] text-zinc-500 dark:text-[#75777a] text-center mt-2 font-normal">
                    Tanovai and AI models may display inaccurate info, including about people, so double-check responses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        geminiEnvAvailable={geminiEnvAvailable}
        serverStatus={serverStatus}
        sessions={sessions}
        onClearAllSessions={handleClearAllSessions}
        onSelectTheme={handleSelectTheme}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onOpenSettings={() => {
          setIsUpgradeOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <GetAppModal
        isOpen={isGetAppOpen}
        onClose={() => setIsGetAppOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        sessionCount={sessions.length}
      />
    </div>
  );
}
