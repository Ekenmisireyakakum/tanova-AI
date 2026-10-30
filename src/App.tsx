import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ChatSession,
  ProviderId,
  AppSettings,
  ThemeMode,
  UserAccount,
  StudyNotebook,
} from './types';
import {
  loadActiveModelSelection,
  loadActiveSessionId,
  loadSessions,
  loadSettings,
  loadCurrentUser,
  logoutUser,
  loadNotebooks,
  saveNotebooks,
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
import { MainWorkspaceView } from './components/Sidebar';
import { LibraryView } from './components/views/LibraryView';
import { ImagesView } from './components/views/ImagesView';
import { ScheduledView } from './components/views/ScheduledView';
import { StudentsView } from './components/views/StudentsView';
import { CustomizeView } from './components/views/CustomizeView';
import { NotebookView } from './components/views/NotebookView';

export default function App() {
  // State management
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => loadActiveSessionId());

  const initialModel = loadActiveModelSelection();
  const [currentProvider, setCurrentProvider] = useState<ProviderId>(initialModel.provider || 'gemini');
  const [currentModel, setCurrentModel] = useState<string>(initialModel.model || 'gemini-3.8-flash');

  // Study Notebooks state
  const [notebooks, setNotebooks] = useState<StudyNotebook[]>(() => loadNotebooks());
  const [activeNotebook, setActiveNotebook] = useState<StudyNotebook | null>(null);

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

  // Persist notebooks state
  useEffect(() => {
    saveNotebooks(notebooks);
  }, [notebooks]);

  // User Authentication & Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active Workspace View (inline transition, no modal popup)
  const [activeView, setActiveView] = useState<MainWorkspaceView>('chat');

  // Modals for auth / profile / upgrade
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

  // Apply light theme to document root (dark mode removed)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
    document.body.classList.remove('dark');
    document.body.classList.add('light');
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

  // Notebook handlers
  const handleSaveNotebook = (nb: StudyNotebook) => {
    setNotebooks((prev) => {
      const idx = prev.findIndex((n) => n.id === nb.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = nb;
        return next;
      }
      return [nb, ...prev];
    });
  };

  const handleDeleteNotebook = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    if (activeNotebook?.id === id) {
      setActiveNotebook(null);
    }
  };

  const handleStartQuizWithNotebook = (nb: StudyNotebook) => {
    const prompt = `Generate a 5-question comprehensive quiz for my study notebook "${nb.title}" (${nb.subject}). Present Question 1 first and wait for my response before revealing the answer.`;
    handleSendMessage(prompt);
  };

  // Send Message / Streaming logic
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setActiveView('chat');

    const activeProvider = currentProvider || 'gemini';
    const activeModel = currentModel || 'gemini-3.8-flash';

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

    const lastUserMsgIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserMsgIdx;
    const lastUserMsg = messages[actualIdx];

    const prunedMessages = messages.slice(0, actualIdx);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: prunedMessages } : s
      )
    );

    handleSendMessage(lastUserMsg.content);
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 select-text font-sans"
      data-theme="light"
    >
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeView={activeView}
        activeNotebookId={activeNotebook?.id}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          handleSelectSession(id);
          setActiveView('chat');
        }}
        onNewChat={() => {
          handleNewChat();
          setActiveView('chat');
        }}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setActiveView('customize')}
        onOpenHelp={() => setIsUpgradeOpen(true)}
        onOpenLibrary={() => setActiveView('library')}
        onOpenImages={() => setActiveView('images')}
        onOpenScheduled={() => setActiveView('scheduled')}
        onOpenStudents={() => setActiveView('students')}
        onOpenCustomize={() => setActiveView('customize')}
        onOpenNewNotebook={() => {
          setActiveNotebook(null);
          setActiveView('notebook');
        }}
        onOpenNotebook={(nb) => {
          setActiveNotebook(nb);
          setActiveView('notebook');
        }}
        notebooks={notebooks}
        onDeleteNotebook={handleDeleteNotebook}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={handleOpenAuth}
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
          onOpenSettings={() => setActiveView('customize')}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenGetApp={() => setIsGetAppOpen(true)}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* View Switch: Workspace Views vs Landing Screen vs Chat Interface */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {activeView === 'library' ? (
            <LibraryView
              onSelectPrompt={handleSendMessage}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : activeView === 'images' ? (
            <ImagesView
              onChatAboutImage={handleSendMessage}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : activeView === 'scheduled' ? (
            <ScheduledView
              onRunPrompt={handleSendMessage}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : activeView === 'students' ? (
            <StudentsView
              notebooks={notebooks}
              onOpenNotebook={(nb) => {
                setActiveNotebook(nb);
                setActiveView('notebook');
              }}
              onOpenNewNotebook={() => {
                setActiveNotebook(null);
                setActiveView('notebook');
              }}
              onSendMessage={handleSendMessage}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : activeView === 'customize' ? (
            <CustomizeView
              settings={settings}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              sessions={sessions}
              onClearAllSessions={handleClearAllSessions}
              onSelectTheme={handleSelectTheme}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : activeView === 'notebook' ? (
            <NotebookView
              notebook={activeNotebook}
              onSaveNotebook={(nb) => {
                handleSaveNotebook(nb);
                setActiveNotebook(nb);
              }}
              onDeleteNotebook={(id) => {
                handleDeleteNotebook(id);
                setActiveView('students');
              }}
              onStartQuizWithNotebook={handleStartQuizWithNotebook}
              onBackToChat={() => setActiveView('chat')}
            />
          ) : !hasMessages ? (
            <LandingView
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              currentProvider={currentProvider}
              currentModel={currentModel}
              onSelectModel={handleSelectModel}
              onOpenSettings={() => setActiveView('customize')}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Scrollable Chat Messages */}
              <ChatMessagesView
                messages={messages}
                isStreaming={isStreaming}
                onRegenerate={handleRegenerate}
                onOpenSettings={() => setActiveView('customize')}
                onSelectModel={handleSelectModel}
              />

              {/* Bottom Sticky Input Bar */}
              <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-white via-white/95 to-transparent pt-4 pb-3 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto w-full">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isStreaming={isStreaming}
                    onStopStreaming={handleStopStreaming}
                    currentProvider={currentProvider}
                    currentModel={currentModel}
                    onSelectModel={handleSelectModel}
                    onOpenSettings={() => setActiveView('customize')}
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

      {/* Modals for Settings, Auth, and Account info */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        sessions={sessions}
        onClearAllSessions={handleClearAllSessions}
        onSelectTheme={handleSelectTheme}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onOpenSettings={() => {
          setIsUpgradeOpen(false);
          setActiveView('customize');
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
        onOpenSettings={() => {
          setIsProfileOpen(false);
          setActiveView('customize');
        }}
        sessionCount={sessions.length}
      />
    </div>
  );
}
