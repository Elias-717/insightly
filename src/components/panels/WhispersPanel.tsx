'use client';

import { ClipboardCopy, CheckCircle2 } from 'lucide-react';
import type { Dataset, Insight } from '@/types';
import { Card } from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/Badge';
import { insightsToMarkdown } from '@/lib/export/markdown';
import { useToast } from '@/components/providers/ToastProvider';

interface WhispersPanelProps {
  dataset: Dataset;
  insights: Insight[];
  onSelectInsight: (insight: Insight) => void;
}

export function WhispersPanel({ dataset, insights, onSelectInsight }: WhispersPanelProps) {
  const { toast } = useToast();

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(insightsToMarkdown(dataset, insights));
      toast('Insights copied as Markdown', 'success');
    } catch {
      toast('Clipboard access was blocked', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="tabular text-sm text-muted">
          {insights.length} plain-English insights, ranked by importance.
        </p>
        <button
          onClick={copyMarkdown}
          className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
        >
          <ClipboardCopy size={16} aria-hidden="true" />
          Copy as Markdown
        </button>
      </div>

      {insights.length === 0 ? (
        <Card className="flex items-center justify-center gap-2 py-8 text-center text-sm text-muted">
          <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
          No notable issues found. This dataset looks clean.
        </Card>
      ) : (
        insights.map((insight) => (
          <Card key={insight.id} className="p-0 transition-colors hover:border-accent">
            <button
              className="flex w-full items-start gap-3 p-4 text-left"
              onClick={() => onSelectInsight(insight)}
              aria-label={insight.title}
            >
              <SeverityBadge severity={insight.severity} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{insight.title}</p>
                <p className="mt-1 text-sm text-muted">{insight.explanation}</p>
              </div>
            </button>
          </Card>
        ))
      )}
    </div>
  );
}
