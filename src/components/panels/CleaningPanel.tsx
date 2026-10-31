'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Download, RotateCcw } from 'lucide-react';
import type { Dataset, RawDataset } from '@/types';
import { Card } from '@/components/ui/Card';
import {
  dropEmptyColumns,
  removeDuplicateRows,
  standardizeCasing,
  trimWhitespace,
} from '@/lib/analysis/cleaning';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { downloadCsv } from '@/lib/export/csv';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

interface CleaningPanelProps {
  dataset: Dataset;
}

export function CleaningPanel({ dataset }: CleaningPanelProps) {
  const [working, setWorking] = useState<RawDataset>(dataset.raw);
  const { toast } = useToast();

  const before = dataset.quality.score;
  const afterDataset = useMemo(() => analyzeDataset(working), [working]);
  const after = afterDataset.quality.score;

  const categoryColumns = dataset.columns.filter(
    (c) => c.type === 'category' || c.type === 'text',
  );

  const apply = (fn: (raw: RawDataset) => RawDataset, message: string) => {
    setWorking((prev) => fn(prev));
    toast(message, 'success');
  };

  const Action = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="rounded-control border border-border bg-surface px-4 py-3 text-left text-sm font-medium transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium">Quality score: before → after</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="stat-value text-3xl font-semibold tabular text-muted">{before}</div>
            <div className="text-xs text-muted">Original</div>
          </div>
          <ArrowRight size={20} className="text-muted" aria-hidden="true" />
          <div className="text-center">
            <div
              className={cn(
                'stat-value text-3xl font-semibold tabular',
                after >= before ? 'text-success' : 'text-danger',
              )}
            >
              {after}
            </div>
            <div className="text-xs text-muted">After cleaning</div>
          </div>
          <div className="tabular ml-auto text-sm text-muted">
            {afterDataset.overview.rows.toLocaleString()} rows ·{' '}
            {afterDataset.overview.columns} columns
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-medium">One-click cleaning</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Action
            label="Remove duplicate rows"
            onClick={() => apply(removeDuplicateRows, 'Duplicate rows removed')}
          />
          <Action
            label="Drop columns > 50% empty"
            onClick={() => apply((r) => dropEmptyColumns(r, 0.5), 'Sparse columns dropped')}
          />
          <Action
            label="Trim whitespace"
            onClick={() => apply(trimWhitespace, 'Whitespace trimmed')}
          />
          <div className="rounded-control border border-border bg-surface p-3">
            <p className="mb-2 text-sm font-medium">Standardize casing</p>
            <div className="flex flex-wrap gap-1">
              {categoryColumns.slice(0, 6).map((c) => (
                <button
                  key={c.name}
                  onClick={() =>
                    apply(
                      (r) => standardizeCasing(r, c.index, 'title'),
                      `Casing standardized for ${c.name}`,
                    )
                  }
                  className="rounded-control bg-surface-2 px-2 py-1 font-mono text-xs transition-colors hover:bg-accent hover:text-accent-fg"
                >
                  {c.name}
                </button>
              ))}
              {categoryColumns.length === 0 && (
                <span className="text-xs text-muted">No category columns</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <button
          onClick={() => {
            downloadCsv(working, `cleaned-${dataset.raw.fileName}`);
            toast('Cleaned CSV downloaded', 'success');
          }}
          className="inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Download size={18} aria-hidden="true" />
          Download cleaned CSV
        </button>
        <button
          onClick={() => {
            setWorking(dataset.raw);
            toast('Cleaning reset', 'info');
          }}
          className="inline-flex items-center gap-2 rounded-control border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
        >
          <RotateCcw size={18} aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}
