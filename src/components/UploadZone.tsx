'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, Loader2, CircleAlert, Table2 } from 'lucide-react';
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
          'flex flex-col items-center justify-center rounded-card border border-dashed p-8 text-center transition-colors',
          dragging
            ? 'border-accent bg-accent-soft'
            : 'border-border bg-surface hover:border-accent hover:bg-accent-soft/50',
          isParsing && 'pointer-events-none opacity-80',
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
          <div className="flex flex-col items-center gap-3" aria-live="polite">
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
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-control bg-surface-2 text-muted">
              <UploadCloud size={22} aria-hidden="true" />
            </div>
            <p className="text-base font-medium">Drop your CSV here</p>
            <p className="mt-1 text-sm text-muted">or click to browse · .csv / .tsv · up to 20 MB</p>
          </>
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

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Try a sample dataset
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {SAMPLE_DATASETS.map((s) => {
            const { rows, cols } = dimensions(s.csv);
            return (
              <button
                key={s.id}
                onClick={() => onSample(s.id)}
                disabled={isParsing}
                className="group flex flex-col gap-1 rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-accent disabled:opacity-50"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Table2 size={16} className="text-muted group-hover:text-accent" aria-hidden="true" />
                  {s.name}
                </span>
                <span className="tabular text-xs text-muted">
                  {rows} rows × {cols} cols · {s.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
