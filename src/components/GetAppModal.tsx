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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <GeminiLogo subtitle="App" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Install Tanovai on Any Device
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Enjoy fullscreen, offline caching, and instant AI access right from your home screen or dock.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-semibold text-slate-800">Desktop (Chrome / Edge / Safari)</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Click the install icon in your browser address bar or menu: <strong className="text-slate-800">Install Tanovai AI</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-semibold text-slate-800">Mobile (iOS & Android)</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Tap <Share className="inline w-3 h-3 text-slate-700 mx-1" /> (Share) in Safari or menu in Chrome, then choose <strong className="text-slate-800">Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
