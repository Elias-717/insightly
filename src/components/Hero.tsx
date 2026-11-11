'use client';

import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { SamplePreview } from './SamplePreview';
import type { ParserState } from '@/hooks/useCsvParser';

interface HeroProps {
  state: ParserState;
  onFile: (file: File) => void;
  onSample: (id: 'grades' | 'sales' | 'messy') => void;
  onCancel: () => void;
}

/**
 * Accept a file dropped anywhere on the landing page, like a desktop app.
 * Drops on the upload zone itself are handled there (it calls preventDefault),
 * so this only picks up the rest of the window.
 */
function usePageDrop(onFile: (file: File) => void, enabled: boolean) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current += 1;
      setOver(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(false);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      depth.current = 0;
      setOver(false);
      if (e.defaultPrevented) return; // already handled by the upload zone
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      e.preventDefault();
      onFile(file);
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [onFile, enabled]);

  return over;
}

export function Hero({ state, onFile, onSample, onCancel }: HeroProps) {
  const dragging = usePageDrop(onFile, state.status !== 'parsing');

  return (
    <div className="lg:grid lg:min-h-[calc(100vh-61px)] lg:grid-cols-[23rem_minmax(0,1fr)]">
      <div className="flex flex-col border-b border-border bg-surface px-6 py-8 lg:border-b-0 lg:border-r">
        <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
          Drop a CSV.
          <br />
          Get the story.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-secondary">
          Column types, gaps, outliers, and odd spellings, in plain English.
        </p>

        <div className="mt-6">
          <UploadZone state={state} onFile={onFile} onSample={onSample} onCancel={onCancel} />
        </div>

        <div className="mt-8 space-y-3 text-[13px] leading-relaxed text-muted lg:mt-auto lg:pt-8">
          <p className="flex gap-2 text-fg-secondary">
            <Lock size={14} className="mt-[3px] shrink-0" aria-hidden="true" />
            Your file never leaves your device. Parsing and analysis run in this browser tab.
          </p>
          <p>
            <a
              href="https://github.com/Elias-717/insightly"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fg-secondary underline decoration-border underline-offset-4 hover:text-accent"
            >
              Source on GitHub
            </a>
            <span className="mx-1.5" aria-hidden="true">·</span>
            MIT license
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="tabular">v1.0.0</span>
          </p>
        </div>
      </div>

      <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <SamplePreview onOpen={() => onSample('messy')} />
        </div>
      </div>

      {dragging && (
        <div
          className="pointer-events-none fixed inset-3 z-50 flex items-center justify-center rounded-card border-2 border-dashed border-accent bg-bg/90"
          aria-hidden="true"
        >
          <p className="text-lg font-semibold text-fg">Drop to analyze</p>
        </div>
      )}
    </div>
  );
}
