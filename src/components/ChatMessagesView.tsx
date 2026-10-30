import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  User,
  Sparkles,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { ProviderIcon } from './GeminiLogo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PROVIDERS } from '../config/models';

interface ChatMessagesViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onRegenerate: () => void;
  onOpenSettings: () => void;
  onSelectModel?: (provider: any, model: string) => void;
}

function cleanDisplayError(error: string): string {
  if (!error) return 'An unexpected error occurred.';
  let text = error;
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) {
        text = parsed.error.message;
      } else if (parsed?.message) {
        text = parsed.message;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  if (text.toLowerCase().includes('api key') || text.toLowerCase().includes('api_key') || text.includes('401')) {
    return 'This model is currently unavailable. Please switch to Gemini 3.8 Flash or Gemini 3.1 Flash Lite.';
  }
  if (text.includes('503') || text.includes('UNAVAILABLE') || text.toLowerCase().includes('high demand')) {
    return 'This model is currently experiencing temporary high demand (503). Spikes in demand are usually temporary. Please try again or switch to Gemini 3.1 Flash Lite.';
  }
  if (text.includes('429') || text.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached (429). Please wait a moment before sending another message, or try Gemini 3.1 Flash Lite.';
  }
  return text.trim();
}

export function ChatMessagesView({
  messages,
  isStreaming,
  onRegenerate,
  onOpenSettings,
  onSelectModel,
}: ChatMessagesViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle Speech Synthesis cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, content: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = content.replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {messages.map((message, idx) => {
        const isUser = message.role === 'user';
        const isLastAssistant =
          !isUser &&
          idx === messages.length - 1;

        if (isUser) {
          return (
            <div key={message.id} className="flex justify-end items-start gap-3 pl-8">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl bg-slate-100 px-5 py-3.5 text-slate-800 border border-slate-200 shadow-2xs">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] sm:text-base">
                  {message.content}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center shrink-0 text-white mt-1 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            </div>
          );
        }

        // Assistant Message
        const provider = message.provider || 'gemini';
        const providerName = PROVIDERS[provider]?.name || provider;

        return (
          <div key={message.id} className="flex items-start gap-3 sm:gap-4 pr-4 sm:pr-8">
            {/* Provider Logo Avatar */}
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs text-slate-700">
              <ProviderIcon provider={provider} className="w-4 h-4" />
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 min-w-0">
              {/* Header: Provider & Model Info */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-800">
                  {providerName}
                </span>
                {message.model && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {message.model}
                  </span>
                )}
                {message.isStreaming && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Sparkles className="w-3 h-3 animate-spin text-blue-500" />
                    <span>Thinking...</span>
                  </span>
                )}
              </div>

              {/* Fallback Notice Badge */}
              {message.fallback && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-2.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] border border-slate-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    Auto-Fallback: Handled by <strong className="font-medium text-slate-900">{message.fallback.fallbackModel}</strong> due to {message.fallback.reason.toLowerCase()} on {message.fallback.originalModel}
                  </span>
                </div>
              )}

              {/* Message Body or Error */}
              {message.error ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Request Failed</p>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                        {cleanDisplayError(message.error)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {provider === 'gemini' && message.model !== 'gemini-3.1-flash-lite' && onSelectModel && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectModel('gemini', 'gemini-3.1-flash-lite');
                              setTimeout(() => onRegenerate(), 100);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Switch to Flash Lite & Retry</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onRegenerate}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[15px] sm:text-base text-slate-800">
                  <MarkdownRenderer content={message.content} />
                </div>
              )}

              {/* Action Toolbar */}
              {!message.error && !message.isStreaming && message.content && (
                <div className="flex items-center gap-1 mt-3 text-slate-400">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(message.id, message.content)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title={copiedId === message.id ? 'Copied' : 'Copy response'}
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={() => handleSpeak(message.id, message.content)}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors ${
                      speakingId === message.id ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    title={speakingId === message.id ? 'Stop reading' : 'Read aloud'}
                  >
                    {speakingId === message.id ? (
                      <VolumeX className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Thumbs Up */}
                  <button
                    type="button"
                    onClick={() => handleFeedback(message.id, 'up')}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors ${
                      feedback[message.id] === 'up' ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>

                  {/* Thumbs Down */}
                  <button
                    type="button"
                    onClick={() => handleFeedback(message.id, 'down')}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors ${
                      feedback[message.id] === 'down' ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    title="Bad response"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>

                  {/* Regenerate (available on last assistant message) */}
                  {isLastAssistant && (
                    <button
                      type="button"
                      onClick={onRegenerate}
                      className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
