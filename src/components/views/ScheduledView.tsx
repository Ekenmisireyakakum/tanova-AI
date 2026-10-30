import React, { useState } from 'react';
import {
  Clock,
  Play,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { ScheduledTask } from '../../types';
import { loadScheduledTasks, saveScheduledTasks } from '../../utils/storage';

interface ScheduledViewProps {
  onRunPrompt: (promptText: string) => void;
  onBackToChat: () => void;
}

export function ScheduledView({ onRunPrompt, onBackToChat }: ScheduledViewProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => loadScheduledTasks());
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newFrequency, setNewFrequency] = useState<ScheduledTask['frequency']>('daily');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('Study Quiz');

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

    setNewTitle('');
    setNewPrompt('');
    setNewFrequency('daily');
    setNewTime('09:00');
    setIsCreating(false);
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
              Scheduled Prompts & Routines
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated spaced repetition checks, daily challenges, and syllabus milestones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'Cancel' : 'New Schedule'}</span>
        </button>
      </div>

      {/* New Routine Inline Creator */}
      {isCreating && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 mb-6 shadow-xs animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Schedule New Study Routine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Routine Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Organic Chemistry Pop Quiz"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Active Recall / Coding"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Frequency
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500 cursor-pointer"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly (Sundays)</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Time (24h)
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Prompt to Execute
            </label>
            <textarea
              required
              rows={3}
              placeholder="Give me a 3-question active recall quiz on my hardest study topics..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* List of Tasks */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">No scheduled routines configured yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create an automated routine to receive daily diagnostic quizzes and study milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs hover:border-slate-300"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {task.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      task.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {task.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="capitalize">{task.frequency}</span> at {task.time}
                  </span>
                  {task.category && (
                    <span className="text-slate-400">
                      • {task.category}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200 line-clamp-2 mt-2">
                  {task.prompt}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    task.isActive
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {task.isActive ? 'Pause' : 'Resume'}
                </button>

                <button
                  type="button"
                  onClick={() => onRunPrompt(task.prompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                  title="Run this prompt right now in Tanovai"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
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
  );
}
