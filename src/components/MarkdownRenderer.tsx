import React, { useMemo, useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Configure marked for clean GFM rendering
  const html = useMemo(() => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content || '') as string;
    } catch (e) {
      console.error('Markdown parse error:', e);
      return content;
    }
  }, [content]);

  return (
    <div
      className="prose-gemini overflow-hidden select-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#0c0c0c] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-[#262626] bg-zinc-100 dark:bg-[#121212] text-xs text-zinc-700 dark:text-zinc-300">
        <span className="font-mono uppercase text-[11px] font-semibold text-black dark:text-white">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className="text-black dark:text-white font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="!m-0 !p-0 !bg-transparent !border-0">
          <code className="font-mono text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}
