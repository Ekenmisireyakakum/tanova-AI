import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Plus, Square, FileText, Code2, Briefcase, Wand2 } from 'lucide-react';
import { ProviderId } from '../types';
import { ModelSelector } from './ModelSelector';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming?: () => void;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  apiKeys: { gemini: string; groq: string; openrouter: string };
  geminiEnvAvailable: boolean;
  onOpenSettings: () => void;
  placeholder?: string;
  isLanding?: boolean;
}

export function ChatInput({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  currentProvider,
  currentModel,
  onSelectModel,
  apiKeys,
  geminiEnvAvailable,
  onOpenSettings,
  placeholder = 'Ask Gemini, Groq, or OpenRouter...',
  isLanding = false,
}: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 220)}px`;
    }
  }, [inputText]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Close plus menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming && onStopStreaming) {
      onStopStreaming();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const insertPromptTemplate = (template: string) => {
    setInputText(template);
    setShowPlusMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const hasContent = inputText.trim().length > 0;

  return (
    <div className="w-full relative">
      {/* Container simulating Gemini's rounded input pill */}
      <div
        className={`w-full rounded-[28px] sm:rounded-[32px] bg-[#f4f4f5] dark:bg-[#121212] border transition-all duration-200 shadow-2xs dark:shadow-sm ${
          hasContent || isListening
            ? 'border-black dark:border-white shadow-md ring-1 ring-black/20 dark:ring-white/20'
            : 'border-zinc-300 dark:border-[#262626] hover:border-zinc-400 dark:hover:border-[#404040]'
        }`}
      >
        {/* Text Input Area */}
        <div className="px-5 pt-3.5 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening... Speak now...' : placeholder}
            className="w-full bg-transparent text-black dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 text-base leading-relaxed resize-none focus:outline-none min-h-[44px] max-h-[220px]"
          />
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
          {/* Left: Plus Button & Model Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Plus Button with Menu */}
            <div className="relative" ref={plusMenuRef}>
              <button
                type="button"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors"
                title="Add context or prompt template"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Plus Menu Popover (Monochrome) */}
              {showPlusMenu && (
                <div className="absolute bottom-11 left-0 w-64 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Quick Starters
                  </div>
                  <div className="mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => insertPromptTemplate('Review this code and identify bugs, edge cases, and performance improvements:\n\n```typescript\n\n```')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors"
                    >
                      <Code2 className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span>Code Review & Debug</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPromptTemplate('Draft a polite, executive-level email to our client explaining that...')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors"
                    >
                      <FileText className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span>Draft Professional Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPromptTemplate('Act as an interviewer for a Senior Software Engineer position. Ask me one question at a time and critique my answers.')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span>Mock Job Interview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPromptTemplate('Brainstorm 5 innovative, high-impact product ideas around AI automation for...')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors"
                    >
                      <Wand2 className="w-4 h-4 text-black dark:text-white shrink-0" />
                      <span>Brainstorm Ideas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Selector Pill inside the input bar */}
            <ModelSelector
              currentProvider={currentProvider}
              currentModel={currentModel}
              onSelect={onSelectModel}
              apiKeys={apiKeys}
              geminiEnvAvailable={geminiEnvAvailable}
              onOpenSettings={onOpenSettings}
              compact
            />
          </div>

          {/* Right: Microphone & Submit / Stop Button */}
          <div className="flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-black text-white dark:bg-white dark:text-black animate-pulse'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-800'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center transition-all shadow-md"
                title="Stop response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!hasContent}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  hasContent
                    ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md cursor-pointer scale-100'
                    : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed scale-95 opacity-50'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
