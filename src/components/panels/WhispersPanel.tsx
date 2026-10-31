'use client';

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {insights.length} plain-English insights, ranked by importance.
        </p>
        <button
          onClick={copyMarkdown}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Copy as Markdown
        </button>
      </div>

      {insights.length === 0 ? (
        <Card className="text-center text-slate-500">
          No notable issues found. This dataset looks clean.
        </Card>
      ) : (
        insights.map((insight) => (
          <Card
            key={insight.id}
            className="cursor-pointer transition hover:border-violet"
          >
            <button
              className="w-full text-left"
              onClick={() => onSelectInsight(insight)}
              aria-label={insight.title}
            >
              <div className="flex items-start gap-3">
                <SeverityBadge severity={insight.severity} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{insight.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {insight.explanation}
                  </p>
                </div>
              </div>
            </button>
          </Card>
        ))
      )}
    </div>
  );
}
