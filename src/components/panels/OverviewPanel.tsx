'use client';

import {
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  ArrowRight,
  CircleDot,
} from 'lucide-react';
import type { Dataset, Insight } from '@/types';
import { Card } from '@/components/ui/Card';
import { QualityGauge } from '@/components/QualityGauge';
import { cn, formatBytes, formatNumber } from '@/lib/utils';
import {
  buildOverviewSummary,
  missingBreakdown,
  missingSubline,
  rowsSubline,
  typeSummary,
  type SummarySeverity,
} from '@/lib/overview/summary';

type Tone = 'neutral' | 'warning' | 'error';

/** Map a percentage to a tone: neutral <=10%, warning >10%, error >25%. */
function toneForPct(pct: number): Tone {
  if (pct > 25) return 'error';
  if (pct > 10) return 'warning';
  return 'neutral';
}

function Stat({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sub: string;
  tone?: Tone;
}) {
  const toneClass =
    tone === 'error' ? 'text-danger-text' : tone === 'warning' ? 'text-warning-text' : 'text-fg';
  const Icon = tone === 'error' ? CircleAlert : tone === 'warning' ? TriangleAlert : null;
  return (
    <Card className="flex h-full flex-col">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div
        className={cn(
          'stat-value mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular',
          toneClass,
        )}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}
        {value}
      </div>
      <div className="tabular mt-auto pt-1 text-xs text-muted">{sub}</div>
    </Card>
  );
}

const bannerStyle: Record<SummarySeverity, { wrap: string; icon: typeof CircleCheck }> = {
  success: { wrap: 'border-success/40 bg-success-soft text-success-text', icon: CircleCheck },
  warning: { wrap: 'border-warning/40 bg-warning-soft text-warning-text', icon: TriangleAlert },
  error: { wrap: 'border-danger/40 bg-danger-soft text-danger-text', icon: CircleAlert },
};

function SummaryBanner({
  dataset,
  insights,
  onViewWhispers,
}: {
  dataset: Dataset;
  insights: Insight[];
  onViewWhispers: () => void;
}) {
  const summary = buildOverviewSummary(dataset, insights);
  const { wrap, icon: Icon } = bannerStyle[summary.severity];
  return (
    <div
      className={cn('flex flex-wrap items-center gap-3 rounded-card border p-3', wrap)}
      role="status"
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-medium">{summary.sentence}</p>
      <button
        onClick={onViewWhispers}
        className="inline-flex shrink-0 items-center gap-1 rounded-control border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg hover:border-accent hover:text-accent"
      >
        View whispers
        <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function OverviewPanel({
  dataset,
  insights,
  onViewWhispers,
}: {
  dataset: Dataset;
  insights: Insight[];
  onViewWhispers: () => void;
}) {
  const { overview, quality } = dataset;
  const typeEntries = Object.entries(overview.typeCounts).filter(([, n]) => n > 0);
  const breakdown = missingBreakdown(dataset);

  return (
    <div className="space-y-6">
      <SummaryBanner dataset={dataset} insights={insights} onViewWhispers={onViewWhispers} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Stat label="Rows" value={formatNumber(overview.rows)} sub={rowsSubline(dataset)} />
        <Stat label="Columns" value={formatNumber(overview.columns)} sub={typeSummary(dataset)} />
        <Stat
          label="Missing cells"
          value={`${overview.missingPct.toFixed(1)}%`}
          sub={missingSubline(breakdown)}
          tone={toneForPct(overview.missingPct)}
        />
        <Stat
          label="Duplicate rows"
          value={formatNumber(overview.duplicateRows)}
          sub={`${overview.duplicatePct.toFixed(1)}% of rows`}
          tone={toneForPct(overview.duplicatePct)}
        />
        <Stat label="Size" value={formatBytes(overview.memoryBytes)} sub="file size on disk" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <h3 className="mb-3 text-sm font-medium">Data quality</h3>
          <QualityGauge quality={quality} dataset={dataset} />
        </Card>

        <Card className="md:col-span-2">
          <h3 className="mb-4 text-sm font-medium">Columns by type</h3>
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => {
              const pct = (count / overview.columns) * 100;
              return (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <CircleDot size={13} className="text-accent" aria-hidden="true" />
                      <span className="capitalize">{type}</span>
                      <span className="tabular font-medium text-fg">{count}</span>
                    </span>
                    <span className="tabular text-xs text-muted">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
