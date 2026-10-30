import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, PlusCircle } from 'lucide-react';
import { ModelInfo, ProviderId } from '../types';
import { AVAILABLE_MODELS, PROVIDERS } from '../config/models';
import { ProviderIcon } from './GeminiLogo';

interface ModelSelectorProps {
  currentProvider: ProviderId;
  currentModel: string;
  onSelect: (provider: ProviderId, model: string) => void;
  onOpenSettings?: () => void;
  compact?: boolean;
}

export function ModelSelector({
  currentProvider,
  currentModel,
  onSelect,
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
        className={`group inline-flex items-center gap-2 rounded-full transition-all text-left cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            : 'px-3.5 py-1.5 text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs'
        }`}
      >
        <div className="text-slate-700">
          <ProviderIcon provider={currentProvider} className="w-4 h-4 shrink-0" />
        </div>
        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
          {activeModelInfo.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 sm:left-auto sm:right-0 w-[92vw] sm:w-[420px] max-w-[440px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          {/* Header & Provider Tabs */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Model
              </span>
              <span className="text-[11px] text-slate-400">
                Managed Multi-Model Mesh
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-200">
              {(['gemini', 'groq', 'openrouter'] as ProviderId[]).map((p) => {
                const isSelected = activeTab === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveTab(p)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-700 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <ProviderIcon provider={p} className="w-3.5 h-3.5 shrink-0" />
                    <span className="capitalize">{p === 'gemini' ? 'Gemini' : p === 'groq' ? 'Groq' : 'OpenRouter'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider status tagline */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {PROVIDERS[activeTab].tagline}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Ready
            </span>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${PROVIDERS[activeTab].name} models...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500"
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
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-900 border border-slate-400 font-medium'
                      : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-slate-700">
                    <ProviderIcon provider={model.provider} className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {model.name}
                      </span>
                      {model.tag && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                          {model.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {model.description}
                    </p>
                    {model.contextWindow && (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Context: {model.contextWindow}
                      </span>
                    )}
                  </div>

                  {isCurrent && (
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}

            {filteredModels.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                No models found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Custom model section */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors font-medium cursor-pointer"
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
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!customModelId.trim()}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[11px] text-slate-500 hover:underline cursor-pointer"
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
