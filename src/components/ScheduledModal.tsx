import React, { useState } from 'react';
import {
  X,
  Clock,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bell,
  Sparkles,
} from 'lucide-react';
import { ScheduledTask } from '../types';
import { loadScheduledTasks, saveScheduledTasks } from '../utils/storage';

interface ScheduledModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunPrompt: (promptText: string) => void;
}

export function ScheduledModal({ isOpen, onClose, onRunPrompt }: ScheduledModalProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => loadScheduledTasks());
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newFrequency, setNewFrequency] = useState<ScheduledTask['frequency']>('daily');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('Study Quiz');

  if (!isOpen) return null;

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
    setTasks(updated);
    saveScheduledTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveScheduledTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const created: ScheduledTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      prompt: newPrompt.trim(),
      frequency: newFrequency,
      time: newTime,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      isActive: true,
      category: newCategory,
    };

    const updated = [created, ...tasks];
    setTasks(updated);
    saveScheduledTasks(updated);

    // Reset form
    setNewTitle('');
    setNewPrompt('');
    setNewFrequency('daily');
    setNewTime('09:00');
    setIsCreating(false);
  };

  const handleRunNow = (task: ScheduledTask) => {
    onRunPrompt(task.prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#282a2c] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#282a2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#1e1f20] flex items-center justify-center">
              <Clock className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Scheduled Prompts & Routines</h2>
              <p className="text-xs text-zinc-500 dark:text-[#8e918f]">
                Automate spaced repetition pop quizzes, syllabus checkpoints, and daily challenges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'Cancel' : 'New Schedule'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* New Task Form */}
          {isCreating && (
            <form
              onSubmit={handleCreateTask}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#18191a] border border-zinc-300 dark:border-[#333537] space-y-4"
            >
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Schedule a New Study Routine
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Routine Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily Organic Chemistry Pop Quiz"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spaced Repetition / Coding"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly (Sundays)</option>
                    <option value="custom">Custom Schedule</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Time (24h)
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Prompt to Execute
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Give me a 3-question active recall quiz on my hardest study topics..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          )}

          {/* List of Scheduled Tasks */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No scheduled routines configured yet.</p>
              <p className="text-xs text-zinc-400 mt-1">
                Create a scheduled routine to receive daily pop quizzes and study challenges.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18191a] border border-zinc-200 dark:border-[#282a2c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-black dark:text-white">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          task.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {task.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="capitalize">{task.frequency}</span> at {task.time}
                      </span>
                      {task.category && (
                        <span className="text-zinc-400 dark:text-zinc-500">
                          • {task.category}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono bg-white dark:bg-[#0c0c0c] p-2 rounded-lg border border-zinc-200 dark:border-[#262626] line-clamp-2 mt-2">
                      {task.prompt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        task.isActive
                          ? 'border-zinc-300 dark:border-[#333537] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#282a2c]'
                          : 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {task.isActive ? 'Pause' : 'Resume'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRunNow(task)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                      title="Run this prompt right now in Tanovai"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#282a2c] transition-colors"
                      title="Delete routine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
