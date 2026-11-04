import React, { useState, useRef, useEffect } from 'react';
import {
  PenLine,
  ScrollText,
  Brain,
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  Code2,
  FileText,
  Briefcase,
  Wand2,
} from 'lucide-react';
import { ProviderId, UserAccount } from '../types';
import { ModelSelector } from './ModelSelector';

interface LandingViewProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  onOpenSettings: () => void;
  onOpenUpgrade?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode: 'login' | 'signup', reason?: string | null) => void;
}

export function LandingView({
  onSendMessage,
  isStreaming,
  currentProvider,
  currentModel,
  onSelectModel,
  onOpenSettings,
  onOpenUpgrade,
  currentUser,
  onOpenAuth,
}: LandingViewProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close plus menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Speech recognition setup
  const toggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputText(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    if (currentUser) {
      setInputText('');
    }
  };

  // Clear draft once user logs in
  useEffect(() => {
    if (currentUser) {
      setInputText('');
    }
  }, [currentUser]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const suggestions = [
    {
      id: 'writing-prompts',
      icon: PenLine,
      text: 'Give me writing prompts based on my life',
    },
    {
      id: 'structure-sermon',
      icon: ScrollText,
      text: 'Help me structure a sermon',
    },
    {
      id: 'reflect-values',
      icon: Brain,
      text: 'Reflect on my personal values',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 w-full relative min-h-[calc(100vh-64px)] select-text bg-transparent">
      {/* Centered Container matching Gemini layout */}
      <div className="w-full max-w-[760px] flex flex-col items-center -mt-12 sm:-mt-16">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-normal text-[#1f1f1f] tracking-normal text-center mb-7 sm:mb-8 font-sans select-none">
          Where should we start?
        </h1>

        {/* Floating Input Pill Bar */}
        <div className="w-full relative mb-6">
          <div className="w-full h-14 sm:h-[58px] bg-white rounded-full border border-[#dfe3e7] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] focus-within:shadow-[0_4px_18px_rgba(0,0,0,0.1)] focus-within:border-[#cbd5e1] transition-all duration-200 flex items-center px-3.5 sm:px-5">
            {/* Plus Icon Button with Menu */}
            <div className="relative shrink-0" ref={plusMenuRef}>
              <button
                type="button"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f0f4f9] transition-colors cursor-pointer"
                title="Add files or prompt template"
                aria-label="Add files or prompt template"
              >
                <Plus className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Plus Menu Popover */}
              {showPlusMenu && (
                <div className="absolute top-11 left-0 w-64 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#72777a]">
                    Quick Starters
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('Review this code and identify bugs, edge cases, and performance improvements:\n\n```typescript\n\n```');
                        setShowPlusMenu(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#1f1f1f] hover:bg-[#f0f4f9] text-left transition-colors cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-[#444746] shrink-0" />
                      <span>Code Review & Debug</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('Draft a polite, executive-level email explaining that...');
                        setShowPlusMenu(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#1f1f1f] hover:bg-[#f0f4f9] text-left transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#444746] shrink-0" />
                      <span>Draft Professional Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('Act as an interviewer for a Software Engineer position. Ask me one question at a time and critique my answers.');
                        setShowPlusMenu(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#1f1f1f] hover:bg-[#f0f4f9] text-left transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-[#444746] shrink-0" />
                      <span>Mock Job Interview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('Brainstorm 5 innovative, high-impact product ideas around...');
                        setShowPlusMenu(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[#1f1f1f] hover:bg-[#f0f4f9] text-left transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4 text-[#444746] shrink-0" />
                      <span>Brainstorm Ideas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening... Speak now...' : 'Ask Gemini'}
              className="flex-1 bg-transparent border-none outline-none text-[#1f1f1f] placeholder:text-[#444746] text-base px-2.5 sm:px-3 font-normal"
            />

            {/* Right Controls: Model Selector & Mic & Send */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ModelSelector
                currentProvider={currentProvider}
                currentModel={currentModel}
                onSelect={onSelectModel}
                onOpenSettings={onOpenSettings}
                onOpenUpgrade={onOpenUpgrade}
                direction="up"
              />

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f0f4f9]'
                }`}
                title={isListening ? 'Stop recording' : 'Voice input'}
                aria-label={isListening ? 'Stop recording' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-5 h-5 stroke-[1.8]" />}
              </button>

              {/* Send Button if input has text */}
              {inputText.trim() && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isStreaming}
                  className="w-9 h-9 rounded-full bg-[#1f1f1f] hover:bg-[#000000] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs ml-0.5"
                  title="Send message"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Suggestion Prompt Items List */}
        <div className="w-full flex flex-col items-start gap-1 pl-3 sm:pl-5">
          {suggestions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSuggestionClick(item.text)}
                className="flex items-center gap-3.5 py-2 px-2.5 text-[#1f1f1f] hover:bg-black/[0.04] rounded-xl transition-colors cursor-pointer text-[15px] font-normal group text-left w-auto"
              >
                <Icon className="w-4 h-4 text-[#444746] group-hover:text-[#1f1f1f] shrink-0 stroke-[1.75]" />
                <span className="text-[#1f1f1f] group-hover:text-black font-normal">
                  {item.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notice for new users to create account */}
        {!currentUser && (
          <div className="w-full flex items-center gap-1.5 pl-3 sm:pl-5 mt-4 text-[13px] text-[#5f6368]">
            <span>New here?</span>
            <button
              type="button"
              onClick={() => onOpenAuth?.('signup', 'Create a free account to start searching and chatting with AI.')}
              className="text-[#1a73e8] hover:text-[#174ea6] font-medium hover:underline cursor-pointer"
            >
              Create an account
            </button>
            <span>to start searching and chatting.</span>
          </div>
        )}
      </div>
    </div>
  );
}
