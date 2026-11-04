import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party browser extensions (e.g. MetaMask inpage scripts) polluting error boundaries
if (typeof window !== 'undefined') {
  const isExtensionNoise = (err: unknown): boolean => {
    if (!err) return false;
    const str = String((err as any)?.stack || (err as any)?.message || err).toLowerCase();
    return (
      str.includes('metamask') ||
      str.includes('chrome-extension://') ||
      str.includes('moz-extension://') ||
      str.includes('safari-web-extension://') ||
      str.includes('inpage.js')
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      if (
        event.filename?.startsWith('chrome-extension:') ||
        event.filename?.startsWith('moz-extension:') ||
        event.filename?.includes('inpage.js') ||
        isExtensionNoise(event.error) ||
        isExtensionNoise(event.message)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isExtensionNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
