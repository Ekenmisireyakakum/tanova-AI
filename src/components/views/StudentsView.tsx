import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Award,
  FileText,
  Compass,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { StudyNotebook } from '../../types';
import { loadNotebooks } from '../../utils/storage';

interface StudentsViewProps {
  notebooks?: StudyNotebook[];
  onOpenNewNotebook: () => void;
  onOpenNotebook: (notebook: StudyNotebook) => void;
  onSendMessage?: (prompt: string) => void;
  onStartActivityInChat?: (prompt: string) => void;
  onBackToChat: () => void;
}

export function StudentsView({
  notebooks: propNotebooks,
  onOpenNewNotebook,
  onOpenNotebook,
  onSendMessage,
  onStartActivityInChat,
  onBackToChat,
}: StudentsViewProps) {
  const [internalNotebooks] = useState<StudyNotebook[]>(() => loadNotebooks());
  const notebooks = propNotebooks || internalNotebooks;
  const [syllabusInput, setSyllabusInput] = useState('');
  const [showSyllabusBox, setShowSyllabusBox] = useState(false);

  const handleStartActivity = (promptText: string) => {
    if (onSendMessage) onSendMessage(promptText);
    else if (onStartActivityInChat) onStartActivityInChat(promptText);
  };

  const handleConvertSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusInput.trim()) return;
    const msg = `Please synthesize this syllabus into an organized curriculum breakdown with weekly learning outcomes, key formulas, and diagnostic quizzes:\n\n${syllabusInput}`;
    if (onSendMessage) onSendMessage(msg);
    else if (onStartActivityInChat) onStartActivityInChat(msg);
    setShowSyllabusBox(false);
    setSyllabusInput('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToChat}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Back to chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              Student Learning Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accelerate coursework, syllabus synthesis, active recall quizzes, and exams
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewNotebook}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>+ New Notebook</span>
        </button>
      </div>

      {/* Academic Reasoning Header Card */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Academic Reasoning & Study Aids
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Coursework, Syllabi Synthesis & Interactive Learning
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Organize study notebooks, convert course syllabi into structured modules, and run spaced repetition quizzes with Tanovai.
          </p>
        </div>
      </div>

      {/* Workflows & Interactive Study Modes */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Interactive Study Workflows
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Syllabus Converter */}
          <button
            type="button"
            onClick={() => setShowSyllabusBox(!showSyllabusBox)}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Syllabus Converter
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Paste syllabus text to generate organized study modules.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold mt-4">
              <span>{showSyllabusBox ? 'Hide Input' : 'Open Converter'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 2: Diagnostic Pop Quiz */}
          <button
            type="button"
            onClick={() =>
              handleStartActivity(
                'Give me a 5-question active recall diagnostic pop quiz across my hardest academic subjects. Present Question 1 first and wait for my response!'
              )
            }
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                Diagnostic Pop Quiz
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Test memory and retention with adaptive questions and instant grading.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-4">
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 3: Socratic Method Tutor */}
          <button
            type="button"
            onClick={() =>
              handleStartActivity(
                'Act as my Socratic study tutor in my current course. Ask me one conceptual probing question at a time to help me derive core principles on my own.'
              )
            }
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                Socratic Tutor
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Deepen intuition through guided questioning rather than raw answers.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-4">
              <span>Launch Tutor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 4: Immersive Explorations */}
          <button
            type="button"
            onClick={() =>
              handleStartActivity(
                'Take me on an immersive, vivid simulation through a complex STEM thought experiment (e.g. quantum entanglement or astrophysical event horizons).'
              )
            }
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
                Thought Explorations
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Immersive simulations across physics, biology, and math.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-600 font-semibold mt-4">
              <span>Explore Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Inline Syllabus Box if toggled */}
        {showSyllabusBox && (
          <form
            onSubmit={handleConvertSyllabus}
            className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Paste Syllabus or Course Topics</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSyllabusBox(false)}
                className="text-xs text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={syllabusInput}
              onChange={(e) => setSyllabusInput(e.target.value)}
              placeholder="Week 1: Fundamentals & Limits&#10;Week 2: Derivatives & Chain Rule&#10;Week 3: Integrals & Applications..."
              className="w-full p-3 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSyllabusBox(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Generate Study Guide in Chat
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Study Notebooks */}
      <div className="pb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your Study Notebooks ({notebooks.length})
          </h2>
          <button
            type="button"
            onClick={onOpenNewNotebook}
            className="text-xs text-slate-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>+ Create Notebook</span>
          </button>
        </div>

        {notebooks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-800">No notebooks created yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Set up a study notebook to get custom lessons and track your progress.
            </p>
            <button
              type="button"
              onClick={onOpenNewNotebook}
              className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer shadow-xs"
            >
              Create Study Notebook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {notebooks.map((nb) => (
              <div
                key={nb.id}
                onClick={() => onOpenNotebook(nb)}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 flex items-center justify-between cursor-pointer group transition-all shadow-xs"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                      {nb.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {nb.subject} • {nb.lessonCount || 8} Lessons
                  </p>
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="w-28 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${nb.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {nb.progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
