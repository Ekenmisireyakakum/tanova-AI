import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Download,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { AppSettings, ChatSession, ThemeMode } from '../../types';

interface CustomizeViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  sessions: ChatSession[];
  onClearAllSessions: () => void;
  onSelectTheme: (theme: ThemeMode) => void;
  onBackToChat: () => void;
}

export function CustomizeView({
  settings,
  onSaveSettings,
  sessions,
  onClearAllSessions,
  onSelectTheme,
  onBackToChat,
}: CustomizeViewProps) {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSelectTheme = (theme: ThemeMode) => {
    setFormData((prev) => ({ ...prev, theme: 'light' }));
    onSelectTheme('light');
  };

  const handleExportData = () => {
    if (sessions.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tanovai_conversations_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToChat}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Back to chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-['Poppins'] text-slate-900">
              Customization & Preferences
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize AI persona, temperature, themes, and data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6 pb-12">
        {/* Section 1: AI Persona & Instructions */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3 shadow-2xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Assistant Persona & Instructions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Define custom guidance, formatting rules, or academic context injected into conversations.
            </p>
          </div>

          <textarea
            rows={4}
            value={formData.systemPrompt}
            onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
            className="w-full p-3.5 text-xs bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 leading-relaxed resize-none"
            placeholder="e.g. You are a helpful, thoughtful study tutor who provides intuitive step-by-step breakdowns..."
          />
        </div>

        {/* Section 2: Temperature & Creativity */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Response Temperature ({formData.temperature})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls creativity vs determinism. Lower values give precise factual responses.
              </p>
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

        {/* Section 3: Universal Demand Spike Fallback */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-2xs">
          <label className="flex items-start justify-between cursor-pointer gap-4">
            <div>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Demand Spike Resilience Mesh</span>
              </span>
              <span className="text-xs text-slate-500 block mt-1 leading-relaxed">
                Automatically route to a linked backup model if your selected model experiences a temporary 503 high traffic demand spike.
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

        {/* Section 4: Interface Theme */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3 shadow-2xs">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Appearance & Typography
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clean white workspace theme with Google Poppins typography and a soft touch of ash.
            </p>
          </div>

          <div className="pt-1">
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-300 bg-white text-slate-800 shadow-xs max-w-xs">
              <Sun className="w-4 h-4 text-amber-500" />
              <div className="text-xs font-semibold">
                Clean White & Soft Ash (Active)
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Data & History */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Export Chat History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download all saved conversations as a JSON file.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export ({sessions.length})</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Clear All Conversations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently delete all stored chats from this browser.
              </p>
            </div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllSessions();
                    setConfirmClear(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold cursor-pointer shadow-xs"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
