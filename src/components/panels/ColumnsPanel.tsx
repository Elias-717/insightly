'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ColumnType, Dataset } from '@/types';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';
import { COLUMN_TYPE_ICON } from '@/components/ui/icons';
import { ColumnDetail } from './ColumnDetail';
import { cn } from '@/lib/utils';

const ALL_TYPES: ColumnType[] = [
  'number',
  'integer',
  'text',
  'category',
  'boolean',
  'date',
  'identifier',
];

interface ColumnsPanelProps {
  dataset: Dataset;
  onOverride: (columnName: string, type: ColumnType) => void;
  highlightColumn?: string | null;
}

/**
 * The column's type, shown once: a badge-styled select that both displays the
 * detected type (with its icon) and lets the user override it.
 */
function TypeSelect({
  columnName,
  type,
  onChange,
}: {
  columnName: string;
  type: ColumnType;
  onChange: (type: ColumnType) => void;
}) {
  const Icon = COLUMN_TYPE_ICON[type];
  return (
    <div className="relative shrink-0">
      <Icon
        size={13}
        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <select
        value={type}
        onChange={(e) => onChange(e.target.value as ColumnType)}
        aria-label={`Override type for ${columnName}`}
        title="Detected type. Change it to override."
        className="cursor-pointer appearance-none rounded-control border border-border bg-surface-2 py-1 pl-6 pr-6 text-xs font-medium text-fg-secondary transition-colors hover:border-accent focus-visible:border-accent"
      >
        {ALL_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

export function ColumnsPanel({ dataset, onOverride, highlightColumn }: ColumnsPanelProps) {
  // Track by name (not the profile object) so the detail stays in sync after a
  // type override recomputes the dataset. Default to the first column so the
  // detail pane is never empty.
  const [selectedName, setSelectedName] = useState<string | null>(
    dataset.columns[0]?.name ?? null,
  );

  // Arriving from an insight: open that column's detail as well as highlighting it.
  useEffect(() => {
    if (highlightColumn) setSelectedName(highlightColumn);
  }, [highlightColumn]);

  const selected =
    dataset.columns.find((c) => c.name === selectedName) ?? dataset.columns[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-3">
        {dataset.columns.map((col) => {
          const isHighlighted = highlightColumn === col.name;
          const isSelected = selected?.name === col.name;
          const missingTone =
            col.missingPct > 25
              ? 'text-danger-text'
              : col.missingPct > 10
                ? 'text-warning-text'
                : 'text-muted';
          return (
            <Card
              key={col.name}
              id={`column-${col.name}`}
              className={cn(
                'flex items-center gap-4 py-3 transition-colors hover:border-accent',
                isHighlighted && 'ring-2 ring-accent',
                // `!` because Card's own border/bg utilities come later in the
                // generated CSS and would otherwise win (cn does not merge).
                isSelected && '!border-accent !bg-accent-soft',
              )}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
                onClick={() => setSelectedName(col.name)}
                aria-label={`Open details for ${col.name}`}
                aria-pressed={isSelected}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-sm font-medium">{col.name}</div>
                  <div className="tabular text-xs text-muted">
                    {col.uniqueCount} unique ·{' '}
                    <span className={missingTone}>{col.missingPct.toFixed(1)}% missing</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Sparkline values={col.sparkline} />
                </div>
              </button>
              <TypeSelect
                columnName={col.name}
                type={col.type}
                onChange={(t) => onOverride(col.name, t)}
              />
            </Card>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24">
          {selected ? (
            <ColumnDetail column={selected} />
          ) : (
            <Card className="text-center text-sm text-muted">
              Select a column to see its full profile.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
