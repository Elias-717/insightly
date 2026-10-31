'use client';

import { UploadZone } from './UploadZone';
import { Logo } from './ui/Logo';
import type { ParserState } from '@/hooks/useCsvParser';

interface HeroProps {
  state: ParserState;
  onFile: (file: File) => void;
  onSample: (id: 'grades' | 'sales' | 'messy') => void;
  onCancel: () => void;
}

export function Hero({ state, onFile, onSample, onCancel }: HeroProps) {
  return (
    <section className="animate-fade-in mx-auto max-w-2xl px-4 py-12 text-center sm:py-20">
      <div className="mb-6 flex justify-center">
        <Logo size={64} className="text-slate-800 dark:text-slate-100" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Drop a CSV.{' '}
        <span className="bg-brand-gradient bg-clip-text text-transparent">Get the story.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400">
        Insightlet profiles your data in seconds: column types, a quality score, charts, a
        correlation heatmap, and plain-English insights.
      </p>

      <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/5 px-4 py-1.5 text-sm font-medium text-teal">
        <span aria-hidden>🔒</span>
        100% in your browser. Your data never leaves your device.
      </div>

      <div className="mt-10">
        <UploadZone state={state} onFile={onFile} onSample={onSample} onCancel={onCancel} />
      </div>
    </section>
  );
}
