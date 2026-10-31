'use client';

import { useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/providers/ToastProvider';

interface ChartFrameProps {
  id?: string;
  title: string;
  summary: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
}

/** Wraps a chart with a title, accessible text summary, and a Download PNG button. */
export function ChartFrame({ id, title, summary, children, controls }: ChartFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadPng = useCallback(async () => {
    if (!ref.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('Chart saved as PNG', 'success');
    } catch {
      toast('Could not export this chart', 'error');
    }
  }, [title, toast]);

  return (
    <Card id={id}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {controls}
          <button
            onClick={downloadPng}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Download PNG
          </button>
        </div>
      </div>
      <div ref={ref} className="bg-white dark:bg-slate-900">
        {children}
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{summary}</p>
    </Card>
  );
}
