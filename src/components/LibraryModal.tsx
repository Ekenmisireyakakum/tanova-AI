import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { PromptTemplate } from '../types';
import { loadSavedPrompts, saveSavedPrompts } from '../utils/storage';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export function LibraryModal({ isOpen, onClose, onSelectPrompt }: LibraryModalProps) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(() => loadSavedPrompts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New prompt modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PromptTemplate['category']>('study');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newTags, setNewTags] = useState('');

  if (!isOpen) return null;

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
    onClose();
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

    // Reset form
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#282a2c] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#282a2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#1e1f20] flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Prompt & Study Library</h2>
              <p className="text-xs text-zinc-500 dark:text-[#8e918f]">
                Curated academic prompts, reasoning templates, and custom workflows
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
              <span>{isCreating ? 'Cancel' : 'New Template'}</span>
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

        {/* Search & Categories Bar */}
        <div className="px-6 pt-4 pb-3 space-y-3 bg-zinc-50/60 dark:bg-[#0c0c0c] border-b border-zinc-200 dark:border-[#282a2c]">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts by title, keywords, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#18191a] text-black dark:text-white placeholder-zinc-500 rounded-xl border border-zinc-200 dark:border-[#333537] focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Category Chips */}
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
                      ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-[#1e1f20] dark:text-[#c4c7c5] dark:hover:bg-[#282a2c]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Create Form or Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isCreating && (
            <form
              onSubmit={handleCreatePrompt}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#18191a] border border-zinc-300 dark:border-[#333537] space-y-4 mb-4"
            >
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Create Custom Study Prompt
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Chemistry Reaction Breakdown"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
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
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Brief Description
                </label>
                <input
                  type="text"
                  placeholder="What does this prompt achieve?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Prompt Content
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="The exact prompt instructions with [Placeholders] for Tanovai..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Chemistry, Reactions, College"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0c0c] rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white"
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
                  Save Prompt
                </button>
              </div>
            </form>
          )}

          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No prompts found matching your criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-black dark:text-white underline font-medium"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPrompts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 dark:bg-[#18191a] dark:hover:bg-[#1f2022] border border-zinc-200 dark:border-[#282a2c] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold text-black dark:text-white tracking-tight">
                        {item.title}
                      </h4>
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-1"
                          title="Delete custom template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#262626] text-[11.5px] font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3 line-clamp-3">
                      {item.prompt}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-zinc-500 dark:text-[#8e918f] bg-zinc-200/60 dark:bg-[#282a2c] px-2 py-0.5 rounded-md font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-[#282a2c]">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.prompt)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}
