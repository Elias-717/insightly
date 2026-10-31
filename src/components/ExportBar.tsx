'use client';

import { useState } from 'react';
import { FileText, FileCode2, FileType2 } from 'lucide-react';
import type { Dataset, Insight } from '@/types';
import { exportPdfReport } from '@/lib/export/pdf';
import { buildHtmlReport } from '@/lib/export/html';
import { insightsToMarkdown } from '@/lib/export/markdown';
import { downloadText } from '@/lib/export/csv';
import { useToast } from '@/components/providers/ToastProvider';

export function ExportBar({ dataset, insights }: { dataset: Dataset; insights: Insight[] }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const exportPdf = async () => {
    setBusy(true);
    toast('Building PDF…', 'info');
    try {
      await exportPdfReport(dataset, insights, [
        'chart-timeseries',
        'chart-correlation',
      ]);
      toast('PDF report downloaded', 'success');
    } catch {
      toast('PDF export failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportHtml = () => {
    const html = buildHtmlReport(dataset, insights);
    downloadText(html, `insightlet-${dataset.raw.fileName}.html`, 'text/html');
    toast('HTML report downloaded', 'success');
  };

  const exportMd = () => {
    const md = insightsToMarkdown(dataset, insights);
    downloadText(md, `insightlet-${dataset.raw.fileName}.md`, 'text/markdown');
    toast('Markdown downloaded', 'success');
  };

  const btn =
    'inline-flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={exportPdf} disabled={busy} className={btn}>
        <FileText size={16} aria-hidden="true" />
        Export PDF
      </button>
      <button onClick={exportHtml} className={btn}>
        <FileCode2 size={16} aria-hidden="true" />
        Export HTML
      </button>
      <button onClick={exportMd} className={btn}>
        <FileType2 size={16} aria-hidden="true" />
        Export Markdown
      </button>
    </div>
  );
}
