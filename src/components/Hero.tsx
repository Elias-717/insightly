'use client';

import Image from 'next/image';
import { Shield, FileDown, Cpu, BookOpen } from 'lucide-react';
import { UploadZone } from './UploadZone';
import type { ParserState } from '@/hooks/useCsvParser';

interface HeroProps {
  state: ParserState;
  onFile: (file: File) => void;
  onSample: (id: 'grades' | 'sales' | 'messy') => void;
  onCancel: () => void;
}

const STEPS = [
  { icon: FileDown, title: 'Drop a file', body: 'CSV or TSV, up to 20 MB.' },
  { icon: Cpu, title: 'We analyze it locally', body: 'Parsed in your browser, never uploaded.' },
  { icon: BookOpen, title: 'Read the story', body: 'Types, quality, charts, and insights.' },
];

export function Hero({ state, onFile, onSample, onCancel }: HeroProps) {
  return (
    <section className="animate-fade-in mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-4xl font-semibold tracking-tightish text-fg sm:text-5xl">
        Drop a CSV. Get the story.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted">
        Column types, a data quality score, outliers, correlations, and plain-English insights. No
        upload, no account.
      </p>

      <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm text-muted">
        <Shield size={14} aria-hidden="true" />
        Runs entirely in your browser. Your file never leaves your device.
      </p>

      <div className="mt-8">
        <UploadZone state={state} onFile={onFile} onSample={onSample} onCancel={onCancel} />
      </div>

      {/* How it works */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-card border border-border bg-surface p-4 text-left">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-control bg-accent-soft text-accent">
                <step.icon size={16} aria-hidden="true" />
              </span>
              <span className="tabular text-xs font-medium text-muted">Step {i + 1}</span>
            </div>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="mt-0.5 text-sm text-muted">{step.body}</p>
          </div>
        ))}
      </div>

      {/* Static preview of the results screen */}
      <figure className="mt-8">
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <Image
            src="/preview.svg"
            alt="Preview of the Insightlet results screen showing overview cards, a quality score, and insights."
            width={1200}
            height={720}
            className="h-auto w-full"
            priority
          />
        </div>
        <figcaption className="mt-2 text-xs text-muted">A peek at the results screen.</figcaption>
      </figure>
    </section>
  );
}
