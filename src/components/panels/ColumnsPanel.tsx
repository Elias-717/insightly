'use client';

import { useState } from 'react';
import type { ColumnProfile, ColumnType, Dataset } from '@/types';
import { Card } from '@/components/ui/Card';
import { TypeBadge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/ui/Sparkline';
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

export function ColumnsPanel({ dataset, onOverride, highlightColumn }: ColumnsPanelProps) {
  const [selected, setSelected] = useState<ColumnProfile | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-3">
        {dataset.columns.map((col) => {
          const isHighlighted = highlightColumn === col.name;
          return (
            <Card
              key={col.name}
              id={`column-${col.name}`}
              className={cn(
                'flex cursor-pointer items-center gap-4 py-3 transition hover:border-violet',
                isHighlighted && 'ring-2 ring-violet',
                selected?.name === col.name && 'border-violet',
              )}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
                onClick={() => setSelected(col)}
                aria-label={`Open details for ${col.name}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{col.name}</div>
                  <div className="text-xs text-slate-500">
                    {col.uniqueCount} unique · {col.missingPct.toFixed(1)}% missing
                  </div>
                </div>
                <Sparkline values={col.sparkline} />
              </button>
              <select
                value={col.type}
                onChange={(e) => onOverride(col.name, e.target.value as ColumnType)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Override type for ${col.name}`}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <TypeBadge type={col.type} />
            </Card>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24">
          {selected ? (
            <ColumnDetail column={dataset.columns.find((c) => c.name === selected.name) ?? selected} />
          ) : (
            <Card className="text-center text-sm text-slate-500">
              Select a column to see its full profile.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
