import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  Lock,
  Search,
} from 'lucide-react';
import { ProviderId } from '../types';
import { AVAILABLE_MODELS, PROVIDERS } from '../config/models';
import { ProviderIcon } from './GeminiLogo';

export interface ModelSelectorProps {
  currentProvider: ProviderId;
  currentModel: string;
  onSelect: (provider: ProviderId, model: string) => void;
  onOpenSettings?: () => void;
  onOpenUpgrade?: () => void;
  compact?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  direction?: 'up' | 'down';
}

type MenuPage = 'gemini' | 'thinking' | 'other_providers';

export function ModelSelector({
  currentProvider,
  currentModel,
  onSelect,
  onOpenUpgrade,
  direction = 'up',
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState<MenuPage>('gemini');
  const [thinkingLevel, setThinkingLevel] = useState<'default' | 'high' | 'off'>('default');
  const [selectedOtherProvider, setSelectedOtherProvider] = useState<ProviderId>('groq');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActivePage('gemini');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current display label on trigger button
  const getTriggerLabel = () => {
    if (currentProvider === 'gemini') {
      if (currentModel === 'gemini-3.8-flash' || currentModel === 'auto' || currentModel === 'gemini-auto') {
        return { prefix: 'Gemini', suffix: 'Auto' };
      }
      if (currentModel === 'gemini-3.1-pro') {
        return { prefix: 'Gemini', suffix: '3.1 Pro' };
      }
      if (currentModel === 'gemini-4-argon') {
        return { prefix: 'Gemini', suffix: '4 Argon' };
      }
      if (currentModel === 'gemini-3.1-flash-lite') {
        return { prefix: 'Gemini', suffix: 'Flash Lite' };
      }
      return { prefix: 'Gemini', suffix: 'Auto' };
    }
    if (currentProvider === 'groq') {
      const match = AVAILABLE_MODELS.find((m) => m.id === currentModel);
      return { prefix: 'Groq', suffix: match?.name || currentModel };
    }
    if (currentProvider === 'openrouter') {
      const match = AVAILABLE_MODELS.find((m) => m.id === currentModel);
      return { prefix: 'OpenRouter', suffix: match?.name.split(' ')[0] || 'Model' };
    }
    return { prefix: 'Gemini', suffix: 'Auto' };
  };

  const { prefix, suffix } = getTriggerLabel();

  const isGeminiAutoActive =
    currentProvider === 'gemini' &&
    (currentModel === 'gemini-3.8-flash' || currentModel === 'auto' || currentModel === 'gemini-auto');
  const isGemini31ProActive = currentProvider === 'gemini' && currentModel === 'gemini-3.1-pro';
  const isGemini4ArgonActive = currentProvider === 'gemini' && currentModel === 'gemini-4-argon';

  const handleSelectGeminiModel = (modelId: string) => {
    onSelect('gemini', modelId);
    setIsOpen(false);
    setActivePage('gemini');
  };

  const handleSelectOtherModel = (provider: ProviderId, modelId: string) => {
    onSelect(provider, modelId);
    setIsOpen(false);
    setActivePage('gemini');
  };

  const otherModels = AVAILABLE_MODELS.filter((m) => {
    const matchesProvider = m.provider === selectedOtherProvider;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button Matching Screenshot Pill: "Gemini Auto ^" */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setActivePage('gemini');
        }}
        className="group inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#ebf0f4] hover:bg-[#e1e6eb] transition-all cursor-pointer select-none text-left"
        title={`Active model: ${prefix} ${suffix}`}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-[#1f1f1f] text-[14px] sm:text-[15px]">{prefix}</span>
        <span className="text-[#5f6368] text-[14px] sm:text-[15px] font-normal">{suffix}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#1f1f1f] stroke-[2.5] transition-transform ml-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#1f1f1f] stroke-[2.5] transition-transform ml-0.5" />
        )}
      </button>

      {/* Popover Menu: Attached right above or below trigger */}
      {isOpen && (
        <div
          className={`absolute z-50 ${
            direction === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
          } right-0 w-[265px] sm:w-[275px] bg-white rounded-[26px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-[#eef0f3] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {activePage === 'gemini' && (
            <div className="flex flex-col">
              {/* Option 1: Auto */}
              <button
                type="button"
                onClick={() => handleSelectGeminiModel('gemini-3.8-flash')}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left group"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isGeminiAutoActive ? (
                    <Check className="w-5 h-5 text-[#1f1f1f] stroke-[2.5]" />
                  ) : null}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-[#1f1f1f] leading-snug">
                    Auto
                  </span>
                  <span className="text-[13px] font-normal text-[#5f6368] leading-tight">
                    Gemini 3 models
                  </span>
                </div>
              </button>

              {/* Option 2: 3.1 Pro */}
              <button
                type="button"
                onClick={() => handleSelectGeminiModel('gemini-3.1-pro')}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left group"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isGemini31ProActive ? (
                    <Check className="w-5 h-5 text-[#1f1f1f] stroke-[2.5]" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#1f1f1f] stroke-[1.8]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-[#1f1f1f] leading-snug">
                    3.1 Pro
                  </span>
                  <span className="text-[13px] font-normal text-[#5f6368] leading-tight">
                    Advanced reasoning
                  </span>
                </div>
              </button>

              {/* Option 3: 4 Argon */}
              <button
                type="button"
                onClick={() => handleSelectGeminiModel('gemini-4-argon')}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left group"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isGemini4ArgonActive ? (
                    <Check className="w-5 h-5 text-[#1f1f1f] stroke-[2.5]" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#1f1f1f] stroke-[1.8]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-[#1f1f1f] leading-snug">
                    4 Argon
                  </span>
                  <span className="text-[13px] font-normal text-[#5f6368] leading-tight">
                    Complex tasks
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="border-t border-[#f0f2f5] my-1.5 mx-2.5" />

              {/* Thinking Level Row */}
              <button
                type="button"
                onClick={() => setActivePage('thinking')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left group"
              >
                <span className="text-[14.5px] font-normal text-[#1f1f1f] pl-[34px]">
                  Thinking level
                </span>
                <ChevronRight className="w-4 h-4 text-[#5f6368] group-hover:text-[#1f1f1f] transition-colors" />
              </button>

              {/* Subtle option to browse other providers if wanted */}
              <button
                type="button"
                onClick={() => setActivePage('other_providers')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left group mt-0.5"
              >
                <span className="text-[12.5px] font-normal text-[#72777a] pl-[34px] group-hover:text-[#1f1f1f]">
                  Groq & OpenRouter...
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8e9196] group-hover:text-[#1f1f1f] transition-colors" />
              </button>
            </div>
          )}

          {/* Thinking Level Submenu */}
          {activePage === 'thinking' && (
            <div className="flex flex-col p-1">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b border-[#f0f2f5]">
                <button
                  type="button"
                  onClick={() => setActivePage('gemini')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1f1f1f] hover:bg-[#f0f4f9] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[14px] font-medium text-[#1f1f1f]">Thinking level</span>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setThinkingLevel('default');
                    setActivePage('gemini');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#1f1f1f]">Default</span>
                    <span className="text-[12px] text-[#5f6368]">Adaptive depth</span>
                  </div>
                  {thinkingLevel === 'default' && <Check className="w-4 h-4 text-[#1f1f1f]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThinkingLevel('high');
                    setActivePage('gemini');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#1f1f1f]">High</span>
                    <span className="text-[12px] text-[#5f6368]">Deep reasoning for code & math</span>
                  </div>
                  {thinkingLevel === 'high' && <Check className="w-4 h-4 text-[#1f1f1f]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThinkingLevel('off');
                    setActivePage('gemini');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f0f4f9] transition-colors cursor-pointer text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#1f1f1f]">Off</span>
                    <span className="text-[12px] text-[#5f6368]">Instant answers</span>
                  </div>
                  {thinkingLevel === 'off' && <Check className="w-4 h-4 text-[#1f1f1f]" />}
                </button>
              </div>
            </div>
          )}

          {/* Other Providers (Groq & OpenRouter) Submenu */}
          {activePage === 'other_providers' && (
            <div className="flex flex-col p-1">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-2 border-b border-[#f0f2f5]">
                <button
                  type="button"
                  onClick={() => setActivePage('gemini')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1f1f1f] hover:bg-[#f0f4f9] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[14px] font-medium text-[#1f1f1f]">Other Providers</span>
              </div>

              {/* Provider Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#f0f4f9] rounded-xl mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedOtherProvider('groq')}
                  className={`py-1 text-xs rounded-lg font-medium cursor-pointer transition-all ${
                    selectedOtherProvider === 'groq'
                      ? 'bg-white text-[#1f1f1f] shadow-xs'
                      : 'text-[#5f6368] hover:text-[#1f1f1f]'
                  }`}
                >
                  Groq LPUs
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOtherProvider('openrouter')}
                  className={`py-1 text-xs rounded-lg font-medium cursor-pointer transition-all ${
                    selectedOtherProvider === 'openrouter'
                      ? 'bg-white text-[#1f1f1f] shadow-xs'
                      : 'text-[#5f6368] hover:text-[#1f1f1f]'
                  }`}
                >
                  OpenRouter
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-[#5f6368] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#f0f4f9] text-[#1f1f1f] rounded-lg border-none outline-none"
                />
              </div>

              {/* Models list */}
              <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                {otherModels.map((m) => {
                  const isCurrent = currentProvider === m.provider && currentModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectOtherModel(m.provider, m.id)}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#ebf0f4] text-[#1f1f1f] font-medium'
                          : 'hover:bg-[#f0f4f9] text-[#1f1f1f]'
                      }`}
                    >
                      <ProviderIcon provider={m.provider} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate font-medium">{m.name}</div>
                        <div className="text-[11px] text-[#5f6368] truncate">{m.tag || m.contextWindow}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#1f1f1f] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
