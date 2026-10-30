import React, { useState } from 'react';
import {
  X,
  Sliders,
  Database,
  Sparkles,
  Sun,
  Trash2,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, ChatSession, ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  sessions: ChatSession[];
  onClearAllSessions: () => void;
  onSelectTheme: (theme: ThemeMode) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  sessions,
  onClearAllSessions,
  onSelectTheme,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'model' | 'theme' | 'data'>('model');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [confirmClear, setConfirmClear] = useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSelectTheme = (theme: ThemeMode) => {
    setFormData((prev) => ({ ...prev, theme: 'light' }));
    onSelectTheme('light');
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tanovai-chat-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            Settings & Customization
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'model'
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>AI Model & Persona</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'theme'
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Appearance & Theme</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Chat History & Data</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI MODEL & PERSONA */}
          {activeTab === 'model' && (
            <div className="space-y-5">
              {/* System Persona */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="text-sm font-semibold text-slate-800 block">
                  AI Assistant Persona & Custom Instructions
                </label>
                <span className="text-xs text-slate-500 block leading-relaxed">
                  Tailor how Tanovai answers your questions. Provide guidelines on tone, depth, formatting, and perspective.
                </span>
                <textarea
                  rows={4}
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full p-3 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500 leading-relaxed resize-none"
                  placeholder="e.g. You are an academic research assistant who explains concepts using the Socratic method and provides worked derivations..."
                />
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-slate-800 block">
                      Response Creativity & Precision ({formData.temperature})
                    </label>
                    <span className="text-xs text-slate-500">
                      Lower values produce concise, deterministic answers; higher values produce creative, exploratory explanations.
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-slate-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.5)</span>
                </div>
              </div>

              {/* Universal High Demand Auto-Recovery */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start justify-between cursor-pointer gap-3">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Universal Demand Spike Auto-Fallback</span>
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 leading-relaxed">
                      Automatically route to a linked backup model if your selected model experiences a temporary 503 high traffic demand spike or temporary outage.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoFallback !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, autoFallback: e.target.checked }))
                    }
                    className="w-4 h-4 mt-1 accent-slate-700 cursor-pointer rounded shrink-0"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-sm font-semibold text-slate-800 block">
                  Interface Appearance
                </label>
                <span className="text-xs text-slate-500 block">
                  Optimized for minimal, high-clarity study with Poppins typography and a subtle soft ash touch.
                </span>

                <div className="p-4 rounded-xl border border-slate-300 bg-white text-slate-800 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Clean White & Soft Ash Slate</p>
                      <p className="text-[11px] text-slate-500">Dark mode disabled per display preferences</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHAT DATA & EXPORT */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-800">Export Chat History</h3>
                  <p className="text-xs text-slate-500">Download all saved conversations as a JSON file.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={sessions.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export ({sessions.length})</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-800">Clear All History</h3>
                  <p className="text-xs text-slate-500">Permanently delete all stored chats from this browser.</p>
                </div>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllSessions();
                        setConfirmClear(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-semibold cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    disabled={sessions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-slate-500" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
