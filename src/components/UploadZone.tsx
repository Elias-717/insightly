'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, Loader2, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_DATASETS } from '@/data/samples';
import type { ParserState } from '@/hooks/useCsvParser';

interface UploadZoneProps {
  state: ParserState;
  onFile: (file: File) => void;
  onSample: (id: 'grades' | 'sales' | 'messy') => void;
  onCancel: () => void;
}

/** Presentation-only: rough rows x columns for a sample's CSV string. */
function dimensions(csv: string): { rows: number; cols: number } {
  const lines = csv.trim().split('\n');
  const cols = lines[0]?.split(',').length ?? 0;
  return { rows: Math.max(0, lines.length - 1), cols };
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
    <div className="w-full text-left">
      {/* Kept outside the role="button" drop area: interactive elements must not
          nest, and the drop area already handles keyboard activation. */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt,text/csv"
        aria-label="Choose a CSV or TSV file"
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
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
          'group cursor-pointer rounded-card border-2 border-dashed p-5 transition-colors',
          dragging
            ? 'border-accent bg-accent-soft'
            : 'border-border bg-bg hover:border-accent',
          isParsing && 'pointer-events-none opacity-80',
        )}
      >

        {isParsing ? (
          <div className="flex flex-col items-center gap-3 text-center" aria-live="polite">
            <Loader2 size={28} className="animate-spin text-accent" aria-hidden="true" />
            <p className="text-sm font-medium">
              Parsing… {state.progressRows > 0 && `${state.progressRows.toLocaleString()} rows`}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="rounded-control border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[15px] font-semibold text-fg">
              {dragging ? 'Release to analyze' : 'Drop a .csv or .tsv file'}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Anywhere on this page works. Up to 20 MB.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-control bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition-colors group-hover:bg-accent-hover">
              <Upload size={15} aria-hidden="true" />
              Choose file
            </span>
          </div>
        )}
      </div>

      {state.status === 'error' && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-card border border-border bg-danger-soft p-3 text-sm text-danger-text"
        >
          <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">We couldn’t read that file</p>
            <p className="mt-1">{state.error}</p>
          </div>
        </div>
      )}

      <div className="mt-7">
        <p className="text-[13px] text-muted">Or open a sample</p>
        <ul className="mt-1.5 divide-y divide-border border-y border-border">
          {SAMPLE_DATASETS.map((s) => {
            const { rows, cols } = dimensions(s.csv);
            return (
              <li key={s.id}>
                <button
                  onClick={() => onSample(s.id)}
                  disabled={isParsing}
                  title={s.description}
                  className="group flex w-full items-baseline gap-4 py-2.5 text-left disabled:opacity-50"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium text-fg group-hover:text-accent">
                    {s.name}
                  </span>
                  <span className="tabular shrink-0 font-mono text-xs text-muted">
                    {rows}&thinsp;×&thinsp;{cols}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
