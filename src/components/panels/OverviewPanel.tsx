'use client';

import { TriangleAlert, CircleAlert } from 'lucide-react';
import type { Dataset } from '@/types';
import { Card } from '@/components/ui/Card';
import { QualityGauge } from '@/components/QualityGauge';
import { cn, formatBytes, formatNumber } from '@/lib/utils';

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
  sub?: string;
  tone?: Tone;
}) {
  const toneClass =
    tone === 'error' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-fg';
  const Icon = tone === 'error' ? CircleAlert : tone === 'warning' ? TriangleAlert : null;
  return (
    <Card>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={cn('stat-value mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular', toneClass)}>
        {Icon && <Icon size={18} aria-hidden="true" />}
        {value}
      </div>
      {sub && <div className="tabular mt-0.5 text-xs text-muted">{sub}</div>}
    </Card>
  );
}

export function OverviewPanel({ dataset }: { dataset: Dataset }) {
  const { overview, quality } = dataset;
  const typeEntries = Object.entries(overview.typeCounts).filter(([, n]) => n > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Stat label="Rows" value={formatNumber(overview.rows)} />
        <Stat label="Columns" value={formatNumber(overview.columns)} />
        <Stat
          label="Missing cells"
          value={`${overview.missingPct.toFixed(1)}%`}
          sub={`${formatNumber(overview.missingCells)} cells`}
          tone={toneForPct(overview.missingPct)}
        />
        <Stat
          label="Duplicate rows"
          value={formatNumber(overview.duplicateRows)}
          sub={`${overview.duplicatePct.toFixed(1)}% of rows`}
          tone={toneForPct(overview.duplicatePct)}
        />
        <Stat label="Size" value={formatBytes(overview.memoryBytes)} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center md:col-span-1">
          <h3 className="mb-3 text-sm font-medium">Data quality</h3>
          <QualityGauge quality={quality} />
        </Card>

        <Card className="md:col-span-2">
          <h3 className="mb-4 text-sm font-medium">Columns by type</h3>
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => {
              const pct = (count / overview.columns) * 100;
              return (
                <div key={type}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span className="tabular text-muted">{count}</span>
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
