'use client';

import { useCallback, useRef } from 'react';
import { ImageDown } from 'lucide-react';
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
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {controls}
          <button
            onClick={downloadPng}
            className="inline-flex items-center gap-1.5 rounded-control border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-2"
          >
            <ImageDown size={14} aria-hidden="true" />
            Download PNG
          </button>
        </div>
      </div>
      <div ref={ref} className="bg-surface">
        {children}
      </div>
      <p className="mt-3 text-sm text-muted">{summary}</p>
    </Card>
  );
}
