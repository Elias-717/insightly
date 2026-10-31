'use client';

import type { ColumnProfile } from '@/types';
import { Card } from '@/components/ui/Card';
import { TypeBadge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="tabular font-medium">
        {typeof value === 'number' ? formatNumber(value) : value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{children}</h4>
  );
}

export function ColumnDetail({ column }: { column: ColumnProfile }) {
  const { numeric, category, date, text } = column;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="truncate font-mono text-base font-semibold">{column.name}</h3>
        <TypeBadge type={column.type} />
      </div>

      <Row label="Total" value={column.totalCount} />
      <Row label="Missing" value={`${column.missingCount} (${column.missingPct.toFixed(1)}%)`} />
      <Row label="Unique" value={`${column.uniqueCount} (${column.uniquePct.toFixed(1)}%)`} />

      {numeric && (
        <div className="mt-4">
          <SectionTitle>Numeric statistics</SectionTitle>
          <Row label="Min / Max" value={`${formatNumber(numeric.min)} / ${formatNumber(numeric.max)}`} />
          <Row label="Mean" value={numeric.mean} />
          <Row label="Median" value={numeric.median} />
          <Row label="Mode" value={numeric.mode ?? '—'} />
          <Row label="Std dev" value={numeric.std} />
          <Row label="Variance" value={numeric.variance} />
          <Row label="Q1 / Q3" value={`${formatNumber(numeric.q1)} / ${formatNumber(numeric.q3)}`} />
          <Row label="IQR" value={numeric.iqr} />
          <Row label="Skewness" value={numeric.skewness} />
          <Row label="Outliers (IQR)" value={numeric.outlierCount} />
          <Row label="Zeros" value={numeric.zeros} />
          <Row label="Negatives" value={numeric.negatives} />
        </div>
      )}

      {category && (
        <div className="mt-4">
          <SectionTitle>Top values</SectionTitle>
          {category.top.map((t) => (
            <div key={t.value} className="mb-1.5">
              <div className="flex justify-between text-sm">
                <span className="truncate font-mono">{t.value}</span>
                <span className="tabular text-muted">
                  {t.count} ({t.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-accent" style={{ width: `${t.percentage}%` }} />
              </div>
            </div>
          ))}
          {category.rareCount > 0 && (
            <p className="tabular mt-2 text-xs text-muted">
              {category.rareCount} rare value(s) appear in under 1% of rows.
            </p>
          )}
        </div>
      )}

      {date && date.earliest && (
        <div className="mt-4">
          <SectionTitle>Date range</SectionTitle>
          <Row label="Earliest" value={date.earliest} />
          <Row label="Latest" value={date.latest} />
          <Row label="Span" value={`${date.spanDays} days`} />
          <Row label="Top weekday" value={date.mostCommonWeekday} />
          <Row label="Top month" value={date.mostCommonMonth} />
        </div>
      )}

      {text && (
        <div className="mt-4">
          <SectionTitle>Text</SectionTitle>
          <Row label="Avg length" value={text.avgLength.toFixed(1)} />
          <Row label="Longest" value={text.longest.slice(0, 40)} />
          <Row label="Shortest" value={text.shortest.slice(0, 40)} />
          <Row label="Empty strings" value={text.emptyCount} />
        </div>
      )}
    </Card>
  );
}
