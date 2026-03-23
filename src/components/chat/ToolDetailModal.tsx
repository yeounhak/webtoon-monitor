'use client';

import { useEffect, useRef } from 'react';

interface ToolDetailModalProps {
  title: string;
  content: string;
  isError?: boolean;
  httpMeta?: { method: string; url: string };
  onClose: () => void;
}

export function ToolDetailModal({
  title,
  content,
  isError,
  httpMeta,
  onClose,
}: ToolDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-700">
          <h2
            className={`text-sm font-semibold ${
              isError
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-800 dark:text-zinc-200'
            }`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-auto p-5">
          {httpMeta && (
            <p className="mb-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
              <span className="font-semibold">{httpMeta.method}</span>{' '}
              {httpMeta.url}
            </p>
          )}
          <pre
            className={`whitespace-pre-wrap break-all text-xs leading-relaxed ${
              isError
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
