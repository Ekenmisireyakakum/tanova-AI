import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { StudyNotebook } from '../types';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNotebook: StudyNotebook | null;
  onSaveNotebook: (notebook: StudyNotebook) => void;
  onDeleteNotebook?: (id: string) => void;
  onStartQuizWithNotebook: (notebook: StudyNotebook) => void;
}

export function NotebookModal({
  isOpen,
  onClose,
  activeNotebook,
  onSaveNotebook,
  onDeleteNotebook,
  onStartQuizWithNotebook,
}: NotebookModalProps) {
  const [title, setTitle] = useState(activeNotebook?.title || '');
  const [subject, setSubject] = useState(activeNotebook?.subject || '');
  const [syllabus, setSyllabus] = useState(activeNotebook?.syllabusSnippet || '');

  React.useEffect(() => {
    if (activeNotebook) {
      setTitle(activeNotebook.title);
      setSubject(activeNotebook.subject);
      setSyllabus(activeNotebook.syllabusSnippet || '');
    } else {
      setTitle('');
      setSubject('');
      setSyllabus('');
    }
  }, [activeNotebook, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const notebook: StudyNotebook = {
      id: activeNotebook ? activeNotebook.id : `nb-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim() || 'General Studies',
      syllabusSnippet: syllabus.trim(),
      lessonCount: activeNotebook ? activeNotebook.lessonCount : 8,
      progressPercent: activeNotebook ? activeNotebook.progressPercent : 0,
      updatedAt: Date.now(),
      chapters: activeNotebook?.chapters || [
        { id: 'ch-1', title: 'Foundations & Core Principles', summary: 'Introduction to primary laws and basic definitions.', completed: true },
        { id: 'ch-2', title: 'Intermediate Applications & Problem Solving', summary: 'Applied analytical questions and worked examples.', completed: false },
        { id: 'ch-3', title: 'Advanced Synthesis & Exam Mastery', summary: 'Challenging multi-step scenarios and cumulative review.', completed: false },
      ],
    };

    onSaveNotebook(notebook);
    onClose();
  };

  const isEditingExisting = Boolean(activeNotebook);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#282a2c] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#282a2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#1e1f20] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {isEditingExisting ? activeNotebook?.title : 'Create Study Notebook'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#8e918f]">
                {isEditingExisting
                  ? `${activeNotebook?.subject || 'Subject'} • ${activeNotebook?.lessonCount || 8} Lessons`
                  : 'Structure syllabus topics into custom lesson plans and interactive quizzes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingExisting && onDeleteNotebook && (
              <button
                type="button"
                onClick={() => {
                  if (activeNotebook) {
                    onDeleteNotebook(activeNotebook.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition-colors"
                title="Delete notebook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active study notebook quick actions if viewing existing */}
          {isEditingExisting && activeNotebook && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18191a] border border-zinc-200 dark:border-[#282a2c] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                    Progress & Mastery
                  </span>
                  <div className="text-lg font-bold mt-0.5">
                    {activeNotebook.progressPercent}% Complete
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onStartQuizWithNotebook(activeNotebook);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Quiz Me on This Notebook</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-[#282a2c] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${activeNotebook.progressPercent}%` }}
                />
              </div>

              {/* Chapters list if any */}
              {activeNotebook.chapters && (
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-medium text-zinc-500 block">Syllabus Chapters:</span>
                  {activeNotebook.chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#282a2c] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            ch.completed ? 'text-emerald-500' : 'text-zinc-400'
                          }`}
                        />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {idx + 1}. {ch.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {ch.completed ? 'Mastered' : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Notebook Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AP Microeconomics or Organic Chemistry I"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18191a] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Course / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Economics, Biology, Computer Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18191a] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Syllabus Outline or Course Topics
              </label>
              <textarea
                rows={4}
                placeholder="Paste course syllabus, lecture topics, or textbook chapter headings..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18191a] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                {isEditingExisting ? 'Save Changes' : 'Create Notebook'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
