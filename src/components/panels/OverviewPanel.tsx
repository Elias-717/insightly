'use client';

import { TriangleAlert, CircleAlert, CircleCheck, ArrowRight, ChevronRight } from 'lucide-react';
import type { Dataset, Insight } from '@/types';
import { QualityGauge } from '@/components/QualityGauge';
import { SeverityBadge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/ui/Sparkline';
import { cn, formatBytes, formatNumber } from '@/lib/utils';
import {
  buildOverviewSummary,
  missingBreakdown,
  missingSubline,
  rowsSubline,
  typeSummary,
  type SummarySeverity,
} from '@/lib/overview/summary';

/** How many ranked insights to surface directly on the Overview. */
const TOP_FINDINGS = 4;

type Tone = 'neutral' | 'warning' | 'error';

/** Map a percentage to a tone: neutral <=10%, warning >10%, error >25%. */
function toneForPct(pct: number): Tone {
  if (pct > 25) return 'error';
  if (pct > 10) return 'warning';
  return 'neutral';
}

/** A borderless key figure. Hierarchy comes from type size, not a box. */
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
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd
        className={cn(
          'stat-value mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular tracking-tightish',
          toneClass,
        )}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}
        {value}
      </dd>
      <dd className="tabular mt-0.5 text-xs text-muted">{sub}</dd>
    </div>
  );
}

const summaryStyle: Record<SummarySeverity, { text: string; icon: typeof CircleCheck }> = {
  success: { text: 'text-success-text', icon: CircleCheck },
  warning: { text: 'text-warning-text', icon: TriangleAlert },
  error: { text: 'text-danger-text', icon: CircleAlert },
};

/** The headline band: quality score on the left, verdict + key figures on the right. */
function HealthBand({ dataset, insights }: { dataset: Dataset; insights: Insight[] }) {
  const { overview, quality } = dataset;
  const summary = buildOverviewSummary(dataset, insights);
  const { text, icon: Icon } = summaryStyle[summary.severity];
  const breakdown = missingBreakdown(dataset);

  return (
    <section className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="grid md:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-2/40 p-6 md:border-b-0 md:border-r">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Data quality
          </h3>
          <QualityGauge quality={quality} dataset={dataset} severity={summary.severity} />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-6">
          <div role="status" className="flex items-start gap-3">
            <Icon size={22} className={cn('mt-0.5 shrink-0', text)} aria-hidden="true" />
            <p className="text-lg font-medium leading-snug tracking-tightish text-fg">
              {summary.sentence}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
            <Stat label="Rows" value={formatNumber(overview.rows)} sub={rowsSubline(dataset)} />
            <Stat
              label="Columns"
              value={formatNumber(overview.columns)}
              sub={typeSummary(dataset)}
            />
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
          </dl>

          <p className="tabular mt-6 border-t border-border pt-4 text-xs text-muted">
            {formatBytes(overview.memoryBytes)} on disk
          </p>
        </div>
      </div>
    </section>
  );
}

/** The top-ranked insights, shown inline so the story is on the first screen. */
function TopFindings({
  dataset,
  insights,
  onSelectInsight,
  onViewWhispers,
}: {
  dataset: Dataset;
  insights: Insight[];
  onSelectInsight: (insight: Insight) => void;
  onViewWhispers: () => void;
}) {
  const top = insights.slice(0, TOP_FINDINGS);
  const remaining = insights.length - top.length;

  return (
    <section aria-labelledby="top-findings-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 id="top-findings-heading" className="text-base font-semibold tracking-tightish">
            Top findings
          </h3>
          <p className="text-sm text-muted">The most important things to know about this file.</p>
        </div>
        {insights.length > 0 && (
          <button
            onClick={onViewWhispers}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            {remaining > 0 ? `All ${insights.length} whispers` : 'View whispers'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {top.length === 0 ? (
        <div className="flex items-center gap-2 rounded-card border border-border bg-surface p-4 text-sm text-muted">
          <CircleCheck size={18} className="text-success" aria-hidden="true" />
          No notable issues found. This dataset looks clean.
        </div>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {top.map((insight, i) => {
            const column = insight.columnName
              ? dataset.columns.find((c) => c.name === insight.columnName)
              : undefined;
            const hasShape = column && column.sparkline.some((v) => v > 0);
            return (
              <li
                key={insight.id}
                className="anim-rise"
                style={{ '--d': `${200 + i * 60}ms` } as React.CSSProperties}
              >
                <button
                  onClick={() => onSelectInsight(insight)}
                  className="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-surface-2/60"
                >
                  <div className="hidden w-24 shrink-0 sm:block">
                    <SeverityBadge severity={insight.severity} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 sm:hidden">
                      <SeverityBadge severity={insight.severity} />
                    </div>
                    <p className="font-medium text-fg">{insight.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{insight.explanation}</p>
                  </div>
                  {column && (
                    <div className="hidden w-24 shrink-0 flex-col items-start gap-1 sm:flex">
                      {hasShape && <Sparkline values={column.sparkline} width={96} height={28} />}
                      <span className="max-w-[8rem] truncate font-mono text-xs text-muted">
                        {column.name}
                      </span>
                    </div>
                  )}
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** Column composition by detected type. */
function ColumnTypes({ dataset }: { dataset: Dataset }) {
  const { overview } = dataset;
  const typeEntries = Object.entries(overview.typeCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <section aria-labelledby="column-types-heading">
      <h3 id="column-types-heading" className="mb-3 text-base font-semibold tracking-tightish">
        Columns by type
      </h3>
      <div className="grid gap-x-8 gap-y-3 rounded-card border border-border bg-surface p-4 sm:grid-cols-2">
        {typeEntries.map(([type, count]) => {
          const pct = (count / overview.columns) * 100;
          return (
            <div key={type}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span>
                  <span className="capitalize">{type}</span>
                  <span className="tabular ml-1.5 font-medium text-fg">{count}</span>
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
    </section>
  );
}

export function OverviewPanel({
  dataset,
  insights,
  onViewWhispers,
  onSelectInsight,
}: {
  dataset: Dataset;
  insights: Insight[];
  onViewWhispers: () => void;
  onSelectInsight: (insight: Insight) => void;
}) {
  return (
    <div className="space-y-8">
      <HealthBand dataset={dataset} insights={insights} />
      <TopFindings
        dataset={dataset}
        insights={insights}
        onSelectInsight={onSelectInsight}
        onViewWhispers={onViewWhispers}
      />
      <ColumnTypes dataset={dataset} />
    </div>
  );
}
