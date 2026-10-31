'use client';

import type { Dataset } from '@/types';
import { Card } from '@/components/ui/Card';
import { QualityGauge } from '@/components/QualityGauge';
import { formatBytes, formatNumber } from '@/lib/utils';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="stat-value mt-1 text-2xl font-semibold tabular">{value}</div>
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
        />
        <Stat
          label="Duplicate rows"
          value={formatNumber(overview.duplicateRows)}
          sub={`${overview.duplicatePct.toFixed(1)}% of rows`}
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
