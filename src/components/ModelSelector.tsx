import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, PlusCircle, ExternalLink } from 'lucide-react';
import { ModelInfo, ProviderId, ServerStatus } from '../types';
import { AVAILABLE_MODELS, PROVIDERS } from '../config/models';
import { ProviderIcon } from './GeminiLogo';

interface ModelSelectorProps {
  currentProvider: ProviderId;
  currentModel: string;
  onSelect: (provider: ProviderId, model: string) => void;
  apiKeys: { gemini: string; groq: string; openrouter: string };
  geminiEnvAvailable: boolean;
  serverStatus?: ServerStatus;
  onOpenSettings: () => void;
  compact?: boolean;
}

export function ModelSelector({
  currentProvider,
  currentModel,
  onSelect,
  apiKeys,
  geminiEnvAvailable,
  serverStatus,
  onOpenSettings,
  compact = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProviderId>(currentProvider);
  const [searchQuery, setSearchQuery] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModelInfo = AVAILABLE_MODELS.find(
    (m) => m.provider === currentProvider && m.id === currentModel
  ) || {
    id: currentModel,
    name: currentModel,
    provider: currentProvider,
    description: 'Custom model',
    tag: 'Custom',
  };

  const filteredModels = AVAILABLE_MODELS.filter((m) => {
    const matchesProvider = m.provider === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const isKeyConfigured = (p: ProviderId): boolean => {
    const userKey = apiKeys[p]?.trim();
    if (userKey && userKey.length > 0) return true;
    if (p === 'gemini') return Boolean(serverStatus?.geminiEnvKeyAvailable ?? geminiEnvAvailable);
    if (p === 'groq') return Boolean(serverStatus?.groqEnvKeyAvailable);
    if (p === 'openrouter') return Boolean(serverStatus?.openrouterEnvKeyAvailable);
    return false;
  };

  const handleSelectModel = (provider: ProviderId, modelId: string) => {
    onSelect(provider, modelId);
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customModelId.trim()) {
      onSelect(activeTab, customModelId.trim());
      setCustomModelId('');
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setActiveTab(currentProvider);
          setIsOpen(!isOpen);
        }}
        className={`group inline-flex items-center gap-2 rounded-full transition-all text-left ${
          compact
            ? 'px-2.5 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a1a] dark:hover:bg-[#262626] text-black dark:text-white border border-zinc-200 dark:border-[#262626]'
            : 'px-3.5 py-1.5 text-sm bg-white hover:bg-zinc-50 dark:bg-[#121212] dark:hover:bg-[#1c1c1c] text-black dark:text-white border border-zinc-200 dark:border-[#262626] shadow-2xs'
        }`}
      >
        <div className="text-black dark:text-white">
          <ProviderIcon provider={currentProvider} className="w-4 h-4 shrink-0" />
        </div>
        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
          {activeModelInfo.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 sm:left-auto sm:right-0 w-[92vw] sm:w-[420px] max-w-[440px] rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header & Provider Tabs */}
          <div className="p-3 bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-[#262626]">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Select AI Provider & Model
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-xs text-black dark:text-white underline hover:opacity-80 flex items-center gap-1 font-medium"
              >
                API Keys
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-200/80 dark:bg-[#1a1a1a] rounded-xl border border-zinc-200 dark:border-[#262626]">
              {(['gemini', 'groq', 'openrouter'] as ProviderId[]).map((p) => {
                const isSelected = activeTab === p;
                const configured = isKeyConfigured(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveTab(p)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ProviderIcon provider={p} className="w-3.5 h-3.5 shrink-0" />
                    <span className="capitalize">{p === 'gemini' ? 'Gemini' : p === 'groq' ? 'Groq' : 'OpenRouter'}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        configured
                          ? 'bg-current'
                          : 'border border-current opacity-60'
                      }`}
                      title={configured ? 'Key configured' : 'Key missing'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider status banner */}
          <div className="px-4 py-2 bg-zinc-100/60 dark:bg-[#121212]/80 border-b border-zinc-200 dark:border-[#262626] flex items-center justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">
              {PROVIDERS[activeTab].tagline}
            </span>
            {!isKeyConfigured(activeTab) && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-black dark:text-white underline font-semibold flex items-center gap-1"
              >
                Add Key
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-zinc-200 dark:border-[#262626]">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${PROVIDERS[activeTab].name} models...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#121212] text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 rounded-lg border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Models list */}
          <div className="max-h-[260px] overflow-y-auto p-2 space-y-1">
            {filteredModels.map((model) => {
              const isCurrent = currentProvider === activeTab && currentModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectModel(activeTab, model.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-black dark:border-white'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-black dark:text-white">
                    <ProviderIcon provider={model.provider} className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-black dark:text-white truncate">
                        {model.name}
                      </span>
                      {model.tag && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                          {model.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {model.description}
                    </p>
                    {model.contextWindow && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                        Context: {model.contextWindow}
                      </span>
                    )}
                  </div>

                  {isCurrent && (
                    <Check className="w-4 h-4 text-black dark:text-white shrink-0 mt-1" />
                  )}
                </button>
              );
            })}

            {filteredModels.length === 0 && (
              <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No models found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Custom model section */}
          <div className="p-3 bg-zinc-50 dark:bg-[#121212] border-t border-zinc-200 dark:border-[#262626]">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-black dark:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Enter custom {PROVIDERS[activeTab].name} model ID</span>
              </button>
            ) : (
              <form onSubmit={handleApplyCustom} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. meta-llama/llama-guard-3-8b"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-lg border border-zinc-300 dark:border-[#262626] focus:outline-none focus:border-black dark:focus:border-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!customModelId.trim()}
                    className="px-3 py-1.5 bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-medium rounded-lg"
                  >
                    Apply
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:underline"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
