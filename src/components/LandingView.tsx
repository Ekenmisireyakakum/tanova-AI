import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Mic,
  MicOff,
  ChevronDown,
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { ProviderId, ServerStatus, StudyNotebook, UserAccount } from '../types';
import { loadNotebooks, saveNotebooks } from '../utils/storage';

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
  currentUser?: UserAccount | null;
}

export function LandingView({
  onSendMessage,
  isStreaming,
  currentProvider,
  currentModel,
  onSelectModel,
  currentUser,
}: LandingViewProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [notebooks, setNotebooks] = useState<StudyNotebook[]>(() => loadNotebooks());

  // Interactive Modals
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [isStudentPlanOpen, setIsStudentPlanOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isExplorationModalOpen, setIsExplorationModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // New notebook form state
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookSubject, setNewNotebookSubject] = useState('');
  const [syllabusText, setSyllabusText] = useState('');

  // Handle Voice Input
  const toggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
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
      }
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;

    const newNb: StudyNotebook = {
      id: `nb-${Date.now()}`,
      title: newNotebookTitle.trim(),
      subject: newNotebookSubject.trim() || 'General Study',
      syllabusSnippet: syllabusText.trim() || undefined,
      lessonCount: 4,
      progressPercent: 15,
      updatedAt: Date.now(),
    };

    const updated = [newNb, ...notebooks];
    setNotebooks(updated);
    saveNotebooks(updated);

    // Trigger prompt to set up initial lessons
    const prompt = syllabusText.trim()
      ? `Create a structured study guide and 4 interactive lessons for my new notebook "${newNb.title}" in ${newNb.subject}. Here is my syllabus outline:\n\n${syllabusText.trim()}`
      : `Create a structured study guide with lesson milestones for my new notebook "${newNb.title}" in ${newNb.subject}.`;

    setIsNewNotebookOpen(false);
    setNewNotebookTitle('');
    setNewNotebookSubject('');
    setSyllabusText('');
    onSendMessage(prompt);
  };

  const modelLabel =
    currentModel === 'gemini-3.8-flash'
      ? 'Gemini Auto'
      : currentModel === 'gemini-3.1-flash-lite'
      ? 'Gemini Lite'
      : currentModel.includes('llama')
      ? 'Groq Llama 3.3'
      : currentModel.includes('r1')
      ? 'DeepSeek R1'
      : 'Gemini Auto';

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full min-h-[calc(100vh-64px)] text-white select-none">
      {/* Top Header with Graduation Cap */}
      <div className="w-full flex flex-col items-center pt-2 sm:pt-6">
        <div className="flex items-center justify-center mb-3">
          <GraduationCap className="w-8 h-8 text-white stroke-[1.75]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[38px] font-normal tracking-tight font-['Google_Sans'] text-white text-center">
          Level up your studying
        </h1>

        {/* 4 Cards Grid/Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-full mt-8 sm:mt-10">
          {/* Card 1: Turn your syllabus into a study notebook */}
          <button
            type="button"
            onClick={() => setIsSyllabusModalOpen(true)}
            className="group flex flex-col text-left cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
          >
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-[#18191c] border border-zinc-800/80 group-hover:border-zinc-700 relative shadow-md flex items-center justify-center transition-all">
              {/* Fluttering Pastel Notebooks Graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a1b32] via-[#1a1c29] to-[#12192b] flex items-center justify-center p-3 overflow-hidden">
                {/* Central Soft Glow Card */}
                <div className="relative w-16 h-20 rounded-xl bg-gradient-to-tr from-rose-200/40 via-amber-100/60 to-cyan-100/40 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center z-10">
                  <div className="w-8 h-10 border border-white/50 rounded-md bg-white/20" />
                </div>

                {/* Floating flying pastel books around center */}
                <div className="absolute top-2 left-3 w-8 h-5 rounded-sm bg-gradient-to-r from-pink-400 to-rose-300 rotate-[-25deg] shadow-sm opacity-90" />
                <div className="absolute top-3 right-4 w-9 h-6 rounded-sm bg-gradient-to-r from-amber-300 to-orange-400 rotate-[35deg] shadow-sm opacity-90" />
                <div className="absolute bottom-2 left-4 w-10 h-6 rounded-sm bg-gradient-to-r from-cyan-300 to-blue-400 rotate-[15deg] shadow-sm opacity-90" />
                <div className="absolute bottom-3 right-3 w-8 h-5 rounded-sm bg-gradient-to-r from-fuchsia-400 to-purple-400 rotate-[-20deg] shadow-sm opacity-90" />
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-7 h-4 rounded-xs bg-gradient-to-r from-emerald-300 to-teal-300 rotate-[8deg] shadow-xs opacity-75" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-5 rounded-xs bg-gradient-to-r from-violet-300 to-indigo-300 rotate-[-12deg] shadow-xs opacity-75" />
              </div>
            </div>
            <span className="text-[13.5px] sm:text-[14px] font-normal text-white/90 mt-2.5 leading-snug group-hover:text-white">
              Turn your syllabus into a study notebook
            </span>
          </button>

          {/* Card 2: Claim your free student plan */}
          <button
            type="button"
            onClick={() => setIsStudentPlanOpen(true)}
            className="group flex flex-col text-left cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
          >
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-[#18191c] border border-zinc-800/80 group-hover:border-zinc-700 relative shadow-md flex items-center justify-center transition-all">
              {/* 3D Glass Crystal 12 Graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#12182b] via-[#0d1326] to-[#080d1a] flex items-center justify-center overflow-hidden">
                {/* 3D Crystal Block "12" */}
                <div className="relative flex items-center justify-center font-black tracking-tighter text-4xl sm:text-5xl font-['Google_Sans']">
                  <span className="bg-gradient-to-br from-cyan-300 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]">
                    12
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-md pointer-events-none rounded-full" />
                </div>
              </div>
            </div>
            <span className="text-[13.5px] sm:text-[14px] font-normal text-white/90 mt-2.5 leading-snug group-hover:text-white">
              Claim your free student plan
            </span>
          </button>

          {/* Card 3: Try immersive explorations */}
          <button
            type="button"
            onClick={() => setIsExplorationModalOpen(true)}
            className="group flex flex-col text-left cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
          >
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-[#18191c] border border-zinc-800/80 group-hover:border-zinc-700 relative shadow-md flex items-center justify-center transition-all">
              {/* Cosmic Spiral Galaxy Graphic */}
              <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                {/* Deep Galaxy with Relativistic Ray */}
                <div className="absolute w-24 h-16 rounded-full bg-gradient-to-r from-amber-200 via-indigo-400 to-purple-600 blur-sm rotate-[-30deg] opacity-80" />
                <div className="absolute w-1.5 h-32 bg-gradient-to-b from-cyan-200 via-cyan-400 to-transparent rotate-[35deg] blur-[0.5px] shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                {/* Tiny stars */}
                <div className="absolute w-1 h-1 rounded-full bg-white top-3 left-4 shadow-sm" />
                <div className="absolute w-1 h-1 rounded-full bg-white bottom-3 right-6 shadow-sm" />
                <div className="absolute w-0.5 h-0.5 rounded-full bg-cyan-200 top-6 right-3" />
                <div className="absolute w-0.5 h-0.5 rounded-full bg-amber-100 bottom-6 left-5" />
              </div>
            </div>
            <span className="text-[13.5px] sm:text-[14px] font-normal text-white/90 mt-2.5 leading-snug group-hover:text-white">
              Try immersive explorations
            </span>
          </button>

          {/* Card 4: Quiz yourself */}
          <button
            type="button"
            onClick={() => setIsQuizModalOpen(true)}
            className="group flex flex-col text-left cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5"
          >
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-[#18191c] border border-zinc-800/80 group-hover:border-zinc-700 relative shadow-md flex items-center justify-center transition-all">
              {/* Minimalist Green Checkmark Circles Pattern */}
              <div className="absolute inset-0 bg-[#0e120f] flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-3 gap-2.5 p-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[13.5px] sm:text-[14px] font-normal text-white/90 mt-2.5 leading-snug group-hover:text-white">
              Quiz yourself
            </span>
          </button>
        </div>

        {/* Section: Your study notebooks */}
        <div className="w-full mt-10 text-left">
          <h2 className="text-sm font-medium text-zinc-300 mb-3 px-1">
            Your study notebooks
          </h2>

          {/* Main Study Notebook Setup Card */}
          <div className="w-full rounded-3xl bg-[#1e1f20] border border-zinc-800/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
            <div>
              <h3 className="text-base font-normal text-white">
                Learning tailored to you
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Set up a study notebook to get custom lessons and track your progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewNotebookOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#282a2d] hover:bg-[#333539] text-white text-xs sm:text-sm font-medium border border-zinc-700/60 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New notebook</span>
            </button>
          </div>

          {/* List of existing notebooks if any */}
          {notebooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() =>
                    onSendMessage(`Open my study notebook "${nb.title}" for ${nb.subject} and show my next lesson.`)
                  }
                  className="p-4 rounded-2xl bg-[#18191c] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                      {nb.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{nb.subject}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full"
                          style={{ width: `${nb.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500">{nb.progressPercent}%</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-white shrink-0 ml-3">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill Chat Input at the bottom */}
      <div className="w-full max-w-2xl mx-auto mt-8 mb-4 relative z-20">
        <div className="w-full rounded-full bg-[#1e1f20] border border-zinc-800/80 hover:border-zinc-700/90 focus-within:border-zinc-600 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl transition-all">
          {/* Left: Plus Button */}
          <button
            type="button"
            onClick={() => setIsSyllabusModalOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors shrink-0 cursor-pointer"
            title="Add syllabus or study prompt"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Center: Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening... Speak now...' : 'Ask Gemini'}
            className="flex-1 bg-transparent text-white placeholder-zinc-400 text-sm sm:text-base px-3 py-1 focus:outline-none"
          />

          {/* Right: Model Selector & Mic */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Model Pill Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/50 transition-colors cursor-pointer"
              >
                <span>{modelLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Model Dropdown Menu */}
              {showModelDropdown && (
                <div className="absolute bottom-10 right-0 w-52 rounded-2xl bg-[#1e1f20] border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Model Selection
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModel('gemini', 'gemini-3.8-flash');
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                      currentModel === 'gemini-3.8-flash'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    <span>Gemini Auto (Flash)</span>
                    {currentModel === 'gemini-3.8-flash' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModel('gemini', 'gemini-3.1-flash-lite');
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                      currentModel === 'gemini-3.1-flash-lite'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    <span>Gemini Lite</span>
                    {currentModel === 'gemini-3.1-flash-lite' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModel('groq', 'llama-3.3-70b-versatile');
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                      currentModel === 'llama-3.3-70b-versatile'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    <span>Groq Llama 3.3 (800 t/s)</span>
                    {currentModel === 'llama-3.3-70b-versatile' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
              title={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: NEW NOTEBOOK MODAL */}
      {isNewNotebookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#18191c] rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-medium font-['Google_Sans'] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Create Study Notebook</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewNotebookOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotebook} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Notebook Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Differential Equations & Linear Algebra"
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121315] border border-zinc-800 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Course or Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Biology, Machine Learning"
                  value={newNotebookSubject}
                  onChange={(e) => setNewNotebookSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121315] border border-zinc-800 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Syllabus Outline or Key Topics (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste syllabus modules, chapters, or exam topics here to generate customized lessons..."
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121315] border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewNotebookOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-black bg-white hover:bg-zinc-200 rounded-xl transition-colors font-semibold cursor-pointer"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLAIM FREE STUDENT PLAN MODAL */}
      {isStudentPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#18191c] rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium font-['Google_Sans'] text-white">
              Claim Your Free Student Plan
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Enjoy 12 months of high-performance AI reasoning, unlimited study notebooks, and custom lesson synthesis completely free for students.
            </p>

            <div className="mt-5 space-y-2 text-left bg-[#121315] p-4 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>12 Months Free access with automatic renewals</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full access to Google Gemini 3.8 Flash & Pro</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited syllabus parsing & study notebooks</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated quizzes & flashcard generation</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsStudentPlanOpen(false)}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Plan Active (Claimed)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TURN SYLLABUS INTO NOTEBOOK MODAL */}
      {isSyllabusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#18191c] rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-medium font-['Google_Sans'] flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Turn Syllabus into Study Notebook</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSyllabusModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste your course syllabus, lecture schedule, or topic list below. Tanovai will synthesize it into chapters, key milestones, and interactive lessons.
              </p>
              <textarea
                rows={5}
                placeholder="Week 1: Foundations & Definitions&#10;Week 2: Core Theorems & Proofs&#10;Week 3: Midterm Review & Problem Sets..."
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#121315] border border-zinc-800 text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-400 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSyllabusModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = syllabusText.trim()
                      ? `Turn this syllabus into an organized study notebook with module breakdowns, core concepts, and key test milestones:\n\n${syllabusText.trim()}`
                      : 'Help me turn my upcoming course syllabus into a structured study notebook. What should I provide?';
                    setIsSyllabusModalOpen(false);
                    setSyllabusText('');
                    onSendMessage(prompt);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Generate Notebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: IMMERSIVE EXPLORATIONS MODAL */}
      {isExplorationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#18191c] rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-medium font-['Google_Sans'] flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Immersive Explorations</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExplorationModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-3 mb-4 leading-relaxed">
              Step into interactive thought experiments and deep explorations across science, physics, and philosophy.
            </p>

            <div className="space-y-2">
              {[
                {
                  title: 'Cosmic Relativistic Jets & Black Holes',
                  desc: 'Journey into the center of an active galactic nucleus and experience gravitational time dilation.',
                  prompt: 'Guide me through an immersive, vivid thought experiment exploring black hole event horizons, gravitational redshift, and relativistic plasma jets.',
                },
                {
                  title: 'Quantum Entanglement & Non-Locality',
                  desc: 'Explore the EPR paradox and Bell tests through intuitive step-by-step simulations.',
                  prompt: 'Take me on an immersive exploration of quantum entanglement, Bell inequalities, and what non-locality means for the fabric of spacetime.',
                },
                {
                  title: 'CRISPR & Epigenetics at the Molecular Scale',
                  desc: 'Visualize Cas9 ribonucleoprotein unwinding DNA double helices and making precise double-strand breaks.',
                  prompt: 'Walk me through an immersive molecular-scale simulation of CRISPR Cas9 binding to target DNA, guiding RNA matching, and subsequent cellular repair pathways.',
                },
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIsExplorationModalOpen(false);
                    onSendMessage(item.prompt);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-[#121315] hover:bg-zinc-800/80 border border-zinc-800/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: QUIZ YOURSELF MODAL */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#18191c] rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-medium font-['Google_Sans'] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Quiz Yourself</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-3 mb-4 leading-relaxed">
              Select a quick study subject or enter a topic to test your knowledge with interactive questions and instant explanations.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                'Differential Equations',
                'Organic Chemistry',
                'Machine Learning & Neural Nets',
                'Molecular Genetics',
                'Microeconomics & Markets',
                'World History & Civilizations',
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setIsQuizModalOpen(false);
                    onSendMessage(`Generate a 5-question interactive quiz on "${topic}". Present Question 1 first with 4 options (A, B, C, D) and wait for my answer before revealing the explanation.`);
                  }}
                  className="p-2.5 rounded-xl bg-[#121315] hover:bg-zinc-800 border border-zinc-800/80 text-xs font-medium text-zinc-300 hover:text-white text-left transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter any custom topic to quiz..."
                  id="customQuizTopic"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#121315] border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setIsQuizModalOpen(false);
                        onSendMessage(`Generate a 5-question interactive quiz on "${val}". Present Question 1 first with 4 options (A, B, C, D) and wait for my answer before revealing the explanation.`);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('customQuizTopic') as HTMLInputElement;
                    const val = el?.value?.trim();
                    if (val) {
                      setIsQuizModalOpen(false);
                      onSendMessage(`Generate a 5-question interactive quiz on "${val}". Present Question 1 first with 4 options (A, B, C, D) and wait for my answer before revealing the explanation.`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
