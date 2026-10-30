import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  Code,
  PenTool,
  Atom,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowUpRight,
  Bookmark,
  ArrowLeft,
} from 'lucide-react';
import { PromptTemplate } from '../../types';
import { loadSavedPrompts, saveSavedPrompts } from '../../utils/storage';

interface LibraryViewProps {
  onSelectPrompt: (promptText: string) => void;
  onBackToChat: () => void;
}

export function LibraryView({ onSelectPrompt, onBackToChat }: LibraryViewProps) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(() => loadSavedPrompts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New prompt state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PromptTemplate['category']>('study');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = [
    { id: 'all', label: 'All Templates', icon: Bookmark },
    { id: 'study', label: 'Study & Exams', icon: BookOpen },
    { id: 'coding', label: 'Coding & CS', icon: Code },
    { id: 'writing', label: 'Academic Writing', icon: PenTool },
    { id: 'stem', label: 'STEM & Math', icon: Atom },
    { id: 'custom', label: 'My Custom Prompts', icon: Sparkles },
  ];

  const filteredPrompts = prompts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'custom'
        ? p.isCustom
        : p.category === selectedCategory;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = (promptText: string) => {
    onSelectPrompt(promptText);
  };

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const created: PromptTemplate = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Custom user template',
      prompt: newPrompt.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isCustom: true,
    };

    const updated = [created, ...prompts];
    setPrompts(updated);
    saveSavedPrompts(updated);

    setNewTitle('');
    setNewDescription('');
    setNewPrompt('');
    setNewTags('');
    setIsCreating(false);
  };

  const handleDeletePrompt = (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    saveSavedPrompts(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full text-slate-800">
      {/* Top Header with Back to Chat and New Template */}
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
              Prompt & Study Library
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic templates, reasoning frameworks, and quick workflow prompts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'Cancel' : 'New Template'}</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form
          onSubmit={handleCreatePrompt}
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 mb-6 shadow-xs animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Create Custom Template
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Chemistry Reaction Breakdown"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="study">Study & Exams</option>
                <option value="coding">Coding & CS</option>
                <option value="writing">Academic Writing</option>
                <option value="stem">STEM & Math</option>
                <option value="productivity">Productivity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="What does this prompt achieve?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Prompt Instructions
            </label>
            <textarea
              required
              rows={3}
              placeholder="The instructions to send to Tanovai..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Chemistry, College, Flashcards"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Template
            </button>
          </div>
        </form>
      )}

      {/* Search and Category Filter Bar */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompt templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-700 text-white font-medium shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No templates found matching your search</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-2 text-xs text-slate-700 underline font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                    {item.title}
                  </h3>
                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed mb-3 line-clamp-3">
                  {item.prompt}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleUsePrompt(item.prompt)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Use Prompt</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
