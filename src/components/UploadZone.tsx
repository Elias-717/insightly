'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SAMPLE_DATASETS } from '@/data/samples';
import type { ParserState } from '@/hooks/useCsvParser';

interface UploadZoneProps {
  state: ParserState;
  onFile: (file: File) => void;
  onSample: (id: 'grades' | 'sales' | 'messy') => void;
  onCancel: () => void;
}

export function UploadZone({ state, onFile, onSample, onCancel }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const isParsing = state.status === 'parsing';

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a CSV or TSV file by clicking or dragging it here"
        onClick={() => !isParsing && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isParsing) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition',
          dragging
            ? 'border-violet bg-violet/5'
            : 'border-slate-300 hover:border-violet/60 dark:border-slate-700',
          isParsing && 'pointer-events-none opacity-70',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
          }}
        />

        {isParsing ? (
          <div className="flex flex-col items-center gap-4" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet" />
            <p className="font-medium">
              Parsing… {state.progressRows > 0 && `${state.progressRows.toLocaleString()} rows`}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold">Drop your CSV here</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or click to browse · .csv / .tsv · up to 20 MB
            </p>
          </>
        )}
      </div>

      {state.status === 'error' && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
        >
          <p className="font-semibold">We couldn’t read that file</p>
          <p className="mt-1">{state.error}</p>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          No file handy? Try sample data:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_DATASETS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSample(s.id)}
              disabled={isParsing}
              title={s.description}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:border-violet hover:text-violet disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
