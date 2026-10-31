'use client';

import { useMemo, useState } from 'react';
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
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:border-violet hover:text-violet dark:border-slate-700 dark:bg-slate-800"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 font-semibold">Quality score: before → after</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-400">{before}</div>
            <div className="text-xs text-slate-500">Original</div>
          </div>
          <div className="text-2xl text-slate-400">→</div>
          <div className="text-center">
            <div
              className="text-3xl font-extrabold"
              style={{ color: after >= before ? '#14B8A6' : '#F43F5E' }}
            >
              {after}
            </div>
            <div className="text-xs text-slate-500">After cleaning</div>
          </div>
          <div className="ml-auto text-sm text-slate-500">
            {afterDataset.overview.rows.toLocaleString()} rows ·{' '}
            {afterDataset.overview.columns} columns
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">One-click cleaning</h3>
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
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
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
                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs hover:bg-violet hover:text-white dark:bg-slate-700"
                >
                  {c.name}
                </button>
              ))}
              {categoryColumns.length === 0 && (
                <span className="text-xs text-slate-400">No category columns</span>
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
          className="rounded-xl bg-brand-gradient px-5 py-2.5 font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Download cleaned CSV
        </button>
        <button
          onClick={() => {
            setWorking(dataset.raw);
            toast('Cleaning reset', 'info');
          }}
          className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
