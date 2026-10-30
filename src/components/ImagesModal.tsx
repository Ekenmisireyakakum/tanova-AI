import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  ImageIcon,
  Send,
  Trash2,
  RefreshCw,
  Compass,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { GeneratedImageItem } from '../types';
import { loadImagesGallery, saveImagesGallery } from '../utils/storage';

interface ImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatAboutImage: (prompt: string) => void;
}

export function ImagesModal({ isOpen, onClose, onChatAboutImage }: ImagesModalProps) {
  const [images, setImages] = useState<GeneratedImageItem[]>(() => loadImagesGallery());
  const [promptInput, setPromptInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Scientific 3D');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImageItem | null>(null);

  if (!isOpen) return null;

  const styles = [
    'Scientific 3D',
    'Textbook Diagram',
    'Photorealistic 8K',
    'Deep Learning',
    'Minimalist Vector',
  ];

  const aspectRatios = [
    { id: '16:9', label: '16:9 Widescreen' },
    { id: '1:1', label: '1:1 Square' },
    { id: '9:16', label: '9:16 Portrait' },
  ];

  const sampleIdeas = [
    'Solar coronal mass ejection hitting Earth magnetosphere with Aurora Borealis',
    'Human synaptic cleft neurotransmitter vesicle exocytosis mechanism',
    'Quantum superposition wave function collapse in double-slit experiment',
    'Cross-section of a nuclear fusion tokamak reactor magnetic chamber',
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    setIsGenerating(true);

    // Simulate generation with realistic high-fidelity assets or fallback render
    setTimeout(() => {
      // Pick one of our curated high-res assets or dynamic abstract svg
      const sampleAssets = [
        '/assets/aistudio/image_ab85e780.png',
        '/assets/aistudio/image_48d5d302.png',
        '/assets/aistudio/image_76db0250.png',
        '/assets/aistudio/image_5e83836f.png',
      ];
      const randomAsset = sampleAssets[Math.floor(Math.random() * sampleAssets.length)];

      const newImage: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        title: promptInput.slice(0, 40) + (promptInput.length > 40 ? '...' : ''),
        prompt: promptInput.trim(),
        style: selectedStyle,
        aspectRatio: selectedRatio,
        createdAt: Date.now(),
        url: randomAsset,
        subject: selectedStyle,
      };

      const updated = [newImage, ...images];
      setImages(updated);
      saveImagesGallery(updated);
      setIsGenerating(false);
      setPromptInput('');
      setSelectedImage(newImage);
    }, 1200);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    saveImagesGallery(updated);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const handleStartChatWithImage = (img: GeneratedImageItem) => {
    onChatAboutImage(
      `Explain the science, principles, and key mechanisms behind this visualization:\n\n"${img.prompt}"`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#282a2c] w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#282a2c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#1e1f20] flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">AI Image Studio & Visuals</h2>
              <p className="text-xs text-zinc-500 dark:text-[#8e918f]">
                Generate and explore scientific visualizations, concept diagrams, and study aids
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Generation Prompt Bar */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#18191a] border border-zinc-200 dark:border-[#282a2c] space-y-4">
            <form onSubmit={handleGenerate} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={2}
                  required
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe an educational diagram, scientific visual, or concept to generate..."
                  className="w-full p-3 pr-24 text-xs bg-white dark:bg-[#0c0c0c] text-black dark:text-white placeholder-zinc-500 rounded-xl border border-zinc-300 dark:border-[#282a2c] focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !promptInput.trim()}
                  className="absolute right-2.5 bottom-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Style & Aspect Ratio Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Style selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[11px] text-zinc-500 font-medium mr-1">Style:</span>
                  {styles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                        selectedStyle === style
                          ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                          : 'bg-zinc-200/70 hover:bg-zinc-300 text-zinc-700 dark:bg-[#282a2c] dark:text-zinc-300 dark:hover:bg-[#333537]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                {/* Aspect ratio selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 font-medium mr-1">Aspect:</span>
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setSelectedRatio(ratio.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                        selectedRatio === ratio.id
                          ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                          : 'bg-zinc-200/70 hover:bg-zinc-300 text-zinc-700 dark:bg-[#282a2c] dark:text-zinc-300 dark:hover:bg-[#333537]'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick inspiration chips */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-400">Try prompt:</span>
                {sampleIdeas.slice(0, 2).map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(idea)}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white underline truncate max-w-xs text-left"
                  >
                    "{idea}"
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Gallery Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-black dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-500" />
              Visual Gallery ({images.length})
            </h3>
            <span className="text-xs text-zinc-500">Click any image to view details & discuss with Tanovai</span>
          </div>

          {/* Grid of Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-[#18191a] border border-zinc-200 dark:border-[#282a2c] hover:border-black dark:hover:border-zinc-500 transition-all cursor-pointer shadow-xs"
              >
                <div className="aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold text-black dark:text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 bg-zinc-200 dark:bg-[#282a2c] px-1.5 py-0.5 rounded shrink-0">
                      {item.style}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.prompt}
                  </p>
                </div>

                {/* Hover overlay actions */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-xs transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Image Detail Modal / Overlay */}
        {selectedImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#18191a] border border-zinc-200 dark:border-[#282a2c] max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-[#282a2c]">
                <h4 className="text-sm font-semibold">{selectedImage.title}</h4>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                    Image Prompt & Description
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono bg-zinc-50 dark:bg-[#0c0c0c] p-3 rounded-xl border border-zinc-200 dark:border-[#282a2c]">
                    {selectedImage.prompt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedImage.id, selectedImage.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-[#333537] text-xs font-medium hover:bg-zinc-100 dark:hover:bg-[#282a2c] transition-colors"
                    >
                      {copiedId === selectedImage.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied Prompt</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedImage.url}
                      download={`tanovai-${selectedImage.id}.png`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-[#333537] text-xs font-medium hover:bg-zinc-100 dark:hover:bg-[#282a2c] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartChatWithImage(selectedImage)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Discuss with Tanovai</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
