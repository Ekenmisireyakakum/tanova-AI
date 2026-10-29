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
  Key,
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
}

export function ChatMessagesView({
  messages,
  isStreaming,
  onRegenerate,
  onOpenSettings,
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
              <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl bg-zinc-100 dark:bg-[#1a1a1a] px-5 py-3.5 text-black dark:text-white border border-zinc-200 dark:border-[#2e2e2e] shadow-2xs">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] sm:text-base">
                  {message.content}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 text-white dark:text-black mt-1 shadow-2xs">
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
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border border-zinc-300 dark:border-[#262626] flex items-center justify-center shrink-0 mt-1 shadow-2xs text-black dark:text-white">
              <ProviderIcon provider={provider} className="w-4 h-4" />
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 min-w-0">
              {/* Header: Provider & Model Info */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-black dark:text-white">
                  {providerName}
                </span>
                {message.model && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1f1f1f] text-black dark:text-white border border-zinc-200 dark:border-[#333333]">
                    {message.model}
                  </span>
                )}
                {message.isStreaming && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Thinking...</span>
                  </span>
                )}
              </div>

              {/* Message Body or Error (Strictly monochrome) */}
              {message.error ? (
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-black dark:border-white text-black dark:text-white text-sm">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Request Failed</p>
                      <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {message.error}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onOpenSettings}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-medium transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Configure API Keys</span>
                        </button>
                        <button
                          type="button"
                          onClick={onRegenerate}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-medium transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[15px] sm:text-base">
                  <MarkdownRenderer content={message.content} />
                </div>
              )}

              {/* Action Toolbar */}
              {!message.error && !message.isStreaming && message.content && (
                <div className="flex items-center gap-1 mt-3 text-zinc-500 dark:text-zinc-400">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(message.id, message.content)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
                    title={copiedId === message.id ? 'Copied' : 'Copy response'}
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4 text-black dark:text-white" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={() => handleSpeak(message.id, message.content)}
                    className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors ${
                      speakingId === message.id ? 'text-black dark:text-white bg-zinc-200 dark:bg-zinc-800' : ''
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
                    className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors ${
                      feedback[message.id] === 'up' ? 'text-black dark:text-white bg-zinc-200 dark:bg-zinc-800' : ''
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>

                  {/* Thumbs Down */}
                  <button
                    type="button"
                    onClick={() => handleFeedback(message.id, 'down')}
                    className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors ${
                      feedback[message.id] === 'down' ? 'text-black dark:text-white bg-zinc-200 dark:bg-zinc-800' : ''
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
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
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
