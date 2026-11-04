import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Trash2,
  ArrowLeft,
  Edit2,
  Check,
} from 'lucide-react';
import { StudyNotebook } from '../../types';

interface NotebookViewProps {
  notebook: StudyNotebook | null;
  onSaveNotebook: (notebook: StudyNotebook) => void;
  onDeleteNotebook: (id: string) => void;
  onStartQuizWithNotebook: (notebook: StudyNotebook) => void;
  onBackToChat: () => void;
}

export function NotebookView({
  notebook,
  onSaveNotebook,
  onDeleteNotebook,
  onStartQuizWithNotebook,
  onBackToChat,
}: NotebookViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(notebook?.title || '');
  const [subject, setSubject] = useState(notebook?.subject || '');
  const [syllabus, setSyllabus] = useState(notebook?.syllabusSnippet || '');

  React.useEffect(() => {
    if (notebook) {
      setTitle(notebook.title);
      setSubject(notebook.subject);
      setSyllabus(notebook.syllabusSnippet || '');
    }
  }, [notebook]);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNb: StudyNotebook = {
      id: `nb-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim() || 'General Studies',
      syllabusSnippet: syllabus.trim(),
      lessonCount: 6,
      progressPercent: 0,
      updatedAt: Date.now(),
      chapters: [
        { id: 'ch-1', title: 'Foundations & Core Principles', summary: 'Introduction to primary definitions and laws.', completed: false },
        { id: 'ch-2', title: 'Intermediate Applications & Problem Sets', summary: 'Analytical questions and worked proofs.', completed: false },
        { id: 'ch-3', title: 'Advanced Synthesis & Exam Review', summary: 'Complex multi-step problems and cumulative mastery.', completed: false },
      ],
    };

    onSaveNotebook(newNb);
  };

  if (!notebook) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full text-slate-800">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200">
          <button
            type="button"
            onClick={onBackToChat}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Back to chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-['Poppins'] text-slate-900">
              Create Study Notebook
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize course materials, chapters, and automated revision quizzes
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateNew} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Notebook Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Microeconomics or Organic Chemistry I"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Course / Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Economics, Biology, Physics, Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Syllabus Outline or Course Topics
            </label>
            <textarea
              rows={4}
              placeholder="Paste syllabus modules, key lecture topics, or chapter outlines here..."
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full p-3.5 text-xs bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onBackToChat}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              Create Notebook
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleToggleChapter = (chapterId: string) => {
    if (!notebook.chapters) return;
    const updatedChapters = notebook.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );
    const completedCount = updatedChapters.filter((c) => c.completed).length;
    const progressPercent = Math.round((completedCount / updatedChapters.length) * 100);

    const updated = {
      ...notebook,
      chapters: updatedChapters,
      progressPercent,
      updatedAt: Date.now(),
    };
    onSaveNotebook(updated);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const updated = {
      ...notebook,
      title: title.trim(),
      subject: subject.trim() || 'General Studies',
      syllabusSnippet: syllabus.trim(),
      updatedAt: Date.now(),
    };
    onSaveNotebook(updated);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-['Poppins'] text-slate-900">
                {notebook.title}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                {notebook.subject}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {notebook.lessonCount || 8} Lessons • {notebook.progressPercent}% Mastered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </button>

          <button
            type="button"
            onClick={() => onStartQuizWithNotebook(notebook)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Quiz Me</span>
          </button>
        </div>
      </div>

      {/* Edit Form if open */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 mb-6 shadow-2xs animate-in fade-in duration-150"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Notebook Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Course / Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Syllabus Outline or Course Topics
            </label>
            <textarea
              rows={3}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Progress & Stats Card */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 mb-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Curriculum Mastery
            </span>
            <div className="text-2xl font-bold mt-0.5 text-slate-900">
              {notebook.progressPercent}% Complete
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartQuizWithNotebook(notebook)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Start Practice Quiz</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${notebook.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Chapters & Lessons Checklist */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
          Syllabus Chapters & Milestone Topics
        </h2>

        {notebook.chapters && notebook.chapters.length > 0 ? (
          <div className="space-y-2.5">
            {notebook.chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => handleToggleChapter(ch.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer shadow-2xs ${
                  ch.completed
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">
                    {ch.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        ch.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {idx + 1}. {ch.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {ch.summary}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    ch.completed
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ch.completed ? 'Mastered' : 'Click to complete'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            No chapter breakdown defined yet.
          </div>
        )}
      </div>

      {/* Syllabus Outline if any */}
      {notebook.syllabusSnippet && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mb-8 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Course Topics & Outline
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
            {notebook.syllabusSnippet}
          </p>
        </div>
      )}

      {/* Delete Notebook Area */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Manage this notebook</span>
        <button
          type="button"
          onClick={() => {
            onDeleteNotebook(notebook.id);
            onBackToChat();
          }}
          className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Notebook</span>
        </button>
      </div>
    </div>
  );
}
