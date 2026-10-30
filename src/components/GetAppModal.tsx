import React from 'react';
import { X, Smartphone, Monitor, Share } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';

interface GetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetAppModal({ isOpen, onClose }: GetAppModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl border border-zinc-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#121212]">
          <div className="flex items-center gap-2">
            <GeminiLogo subtitle="App" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Pure monochrome) */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="text-lg font-medium text-black dark:text-white font-['Google_Sans']">
              Install Tanovai on Any Device
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Enjoy fullscreen, offline caching, and instant AI access right from your home screen or dock.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-start gap-3">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-semibold text-black dark:text-white">Desktop (Chrome / Edge / Safari)</h4>
                <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Click the install icon in your browser address bar or menu: <strong className="text-black dark:text-white">Install Tanovai AI</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] flex items-start gap-3">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-semibold text-black dark:text-white">Mobile (iOS & Android)</h4>
                <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Tap <Share className="inline w-3 h-3 text-black dark:text-white mx-1" /> (Share) in Safari or menu in Chrome, then choose <strong className="text-black dark:text-white">Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#121212] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl transition-colors shadow-2xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
