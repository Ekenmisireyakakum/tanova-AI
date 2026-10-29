import React from 'react';
import { Calendar, FileText, PenTool, Lightbulb, Cpu, Code2, Sparkles } from 'lucide-react';
import { ProviderId, ServerStatus } from '../types';
import { SUGGESTION_CHIPS } from '../config/models';
import { ChatInput } from './ChatInput';

interface LandingViewProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  currentProvider: ProviderId;
  currentModel: string;
  onSelectModel: (provider: ProviderId, model: string) => void;
  apiKeys: { gemini: string; groq: string; openrouter: string };
  geminiEnvAvailable: boolean;
  serverStatus?: ServerStatus;
  onOpenSettings: () => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="w-3.5 h-3.5 text-current" />,
  FileText: <FileText className="w-3.5 h-3.5 text-current" />,
  PenTool: <PenTool className="w-3.5 h-3.5 text-current" />,
  Lightbulb: <Lightbulb className="w-3.5 h-3.5 text-current" />,
  Cpu: <Cpu className="w-3.5 h-3.5 text-current" />,
  Code2: <Code2 className="w-3.5 h-3.5 text-current" />,
};

export function LandingView({
  onSendMessage,
  isStreaming,
  currentProvider,
  currentModel,
  onSelectModel,
  apiKeys,
  geminiEnvAvailable,
  serverStatus,
  onOpenSettings,
}: LandingViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full relative">
      {/* Background ambient glow effect (Monochrome) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-zinc-200/40 dark:bg-zinc-800/25 blur-[120px] pointer-events-none rounded-full" />

      {/* Greeting Title */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight font-['Google_Sans'] mb-3">
          <span className="gemini-gradient-text">Where should we start?</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Ask questions, analyze concepts, draft content, or execute code across{' '}
          <span className="text-black dark:text-white font-medium">Gemini</span>,{' '}
          <span className="text-black dark:text-white font-medium">Groq</span>, and{' '}
          <span className="text-black dark:text-white font-medium">OpenRouter</span>.
        </p>
      </div>

      {/* Main Central Input Bar */}
      <div className="w-full max-w-2xl relative z-10 mb-6">
        <ChatInput
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          currentProvider={currentProvider}
          currentModel={currentModel}
          onSelectModel={onSelectModel}
          apiKeys={apiKeys}
          geminiEnvAvailable={geminiEnvAvailable}
          serverStatus={serverStatus}
          onOpenSettings={onOpenSettings}
          placeholder="Ask Gemini, Groq, or OpenRouter..."
          isLanding
        />
      </div>

      {/* Small, Well-Arranged Suggestion Cards */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {SUGGESTION_CHIPS.map((chip, idx) => {
            const icon = ICONS_MAP[chip.icon] || <Sparkles className="w-3.5 h-3.5 text-current" />;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(chip.prompt)}
                className="group px-3 py-2 rounded-xl bg-white dark:bg-[#121212] hover:bg-zinc-100 dark:hover:bg-[#1a1a1a] border border-zinc-200 dark:border-[#262626] hover:border-zinc-300 dark:hover:border-[#383838] transition-all text-left flex items-center gap-2.5 shadow-2xs hover:shadow-xs"
              >
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#1c1c1c] text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium text-black dark:text-white truncate">
                    {chip.title}
                  </h3>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">
                    {chip.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
