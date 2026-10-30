import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  PenTool,
  Compass,
  Lightbulb,
  ArrowUp,
  Mic,
  MicOff,
  Plus,
} from 'lucide-react';
import { ProviderId, UserAccount } from '../types';
import { GeminiSparkleIcon } from './GeminiLogo';
import { ModelSelector } from './ModelSelector';

interface LandingViewProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  onOpenSettings: () => void;
  currentUser?: UserAccount | null;
}

export function LandingView({
  onSendMessage,
  isStreaming,
  currentProvider,
  currentModel,
  onSelectModel,
  onOpenSettings,
  currentUser,
}: LandingViewProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'there';

  const suggestionPrompts = [
    {
      id: 'explain',
      category: 'Understand',
      title: 'Explain a complex idea',
      prompt: 'Explain how transformers and attention mechanisms work in machine learning using a clear, intuitive analogy.',
      icon: Lightbulb,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'code',
      category: 'Code & Build',
      title: 'Debug or write clean code',
      prompt: 'Write a TypeScript utility with generics to retry a promise with exponential backoff and error logging.',
      icon: Code2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'write',
      category: 'Write & Edit',
      title: 'Draft or polish text',
      prompt: 'Help me draft a concise, compelling update for stakeholders announcing the successful launch of our new feature.',
      icon: PenTool,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'brainstorm',
      category: 'Explore & Plan',
      title: 'Brainstorm creative angles',
      prompt: 'Give me 5 distinct and creative business ideas that solve real friction in online collaborative learning.',
      icon: Compass,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
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
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center px-4 sm:px-6 py-6 md:py-10 max-w-4xl mx-auto w-full min-h-[calc(100vh-56px)] bg-white text-zinc-900 select-text">
      {/* Top Greeting Header */}
      <div className="w-full flex flex-col items-start pt-6 sm:pt-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <GeminiSparkleIcon className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Tanovai AI
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hello, {firstName}
          </span>
          <br />
          <span className="text-zinc-400 font-normal text-3xl sm:text-4xl md:text-5xl mt-1 block">
            How can I help you today?
          </span>
        </h1>
      </div>

      {/* Suggestion Starter Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-8">
        {suggestionPrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSendMessage(item.prompt)}
              className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between group h-36"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mt-2.5 group-hover:text-slate-950 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Central Input Box */}
      <div className="w-full max-w-3xl mb-4">
        <div className="w-full rounded-[28px] sm:rounded-[32px] bg-white border border-slate-300 hover:border-slate-400 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all duration-200 shadow-xs">
          {/* Textarea */}
          <div className="px-5 pt-3.5 pb-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening... Speak now...' : 'Ask Tanovai anything...'}
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base leading-relaxed resize-none focus:outline-none min-h-[50px] max-h-[180px]"
            />
          </div>

          {/* Bottom Bar: Plus, Model Pill, Mic, Send */}
          <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <ModelSelector
                currentProvider={currentProvider}
                currentModel={currentModel}
                onSelect={onSelectModel}
                onOpenSettings={onOpenSettings}
                compact
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isListening ? 'Stop recording' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim()
                    ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-xs cursor-pointer scale-100'
                    : 'text-slate-300 bg-slate-100 cursor-not-allowed scale-95'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11.5px] text-zinc-400 text-center mt-2.5 font-normal">
          Tanovai can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
