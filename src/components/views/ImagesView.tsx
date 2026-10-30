import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Send,
  Trash2,
  RefreshCw,
  Layers,
  ArrowLeft,
  X,
} from 'lucide-react';
import { GeneratedImageItem } from '../../types';
import { loadImagesGallery, saveImagesGallery } from '../../utils/storage';

interface ImagesViewProps {
  onChatAboutImage: (prompt: string) => void;
  onBackToChat: () => void;
}

export function ImagesView({ onChatAboutImage, onBackToChat }: ImagesViewProps) {
  const [images, setImages] = useState<GeneratedImageItem[]>(() => loadImagesGallery());
  const [promptInput, setPromptInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Scientific 3D');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImageItem | null>(null);

  const styles = [
    'Scientific 3D',
    'Textbook Diagram',
    'Photorealistic 8K',
    'Deep Learning',
    'Minimalist Vector',
  ];

  const aspectRatios = [
    { id: '16:9', label: '16:9' },
    { id: '1:1', label: '1:1' },
    { id: '9:16', label: '9:16' },
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

    setTimeout(() => {
      const sampleAssets = [
        '/assets/aistudio/image_ab85e780.png',
        '/assets/aistudio/image_48d5d302.png',
        '/assets/aistudio/image_76db0250.png',
        '/assets/aistudio/image_5e83836f.png',
      ];
      const randomAsset = sampleAssets[Math.floor(Math.random() * sampleAssets.length)];

      const newImage: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        title: promptInput.slice(0, 45) + (promptInput.length > 45 ? '...' : ''),
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
              AI Visuals & Diagrams
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate and explore scientific diagrams, visual study aids, and illustrations
            </p>
          </div>
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mb-6 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              required
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe a scientific diagram, visual model, or concept to generate..."
              className="w-full p-3.5 pr-28 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-500 resize-none"
            />
            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim()}
              className="absolute right-3 bottom-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Style:</span>
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-slate-700 text-white font-medium'
                      : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Aspect:</span>
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setSelectedRatio(ratio.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                    selectedRatio === ratio.id
                      ? 'bg-slate-700 text-white font-medium'
                      : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick inspiration chips */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Try prompt:</span>
            {sampleIdeas.slice(0, 2).map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptInput(idea)}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline truncate max-w-xs text-left cursor-pointer"
              >
                "{idea}"
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Gallery Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          Visual Gallery ({images.length})
        </h2>
        <span className="text-xs text-slate-500">Click any image to inspect or chat with Tanovai</span>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 mb-8">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">No generated images yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Describe a concept above and click "Generate Visual" to render scientific diagrams and visual explanations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-8">
          {images.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3.5">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-xs font-semibold text-slate-800 truncate">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                    {item.style}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {item.prompt}
                </p>
              </div>

              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-white backdrop-blur-xs transition-colors cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Image Detail Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">{selectedImage.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Prompt
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedImage.prompt}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedImage.id, selectedImage.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedImage.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleStartChatWithImage(selectedImage);
                    setSelectedImage(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
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
  );
}
