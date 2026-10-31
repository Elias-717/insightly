'use client';

import { useMemo, useRef, useState } from 'react';
import type { ColumnType, Dataset, Insight, RawDataset } from '@/types';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import { OverviewPanel } from './panels/OverviewPanel';
import { ColumnsPanel } from './panels/ColumnsPanel';
import { ChartsPanel } from './panels/ChartsPanel';
import { WhispersPanel } from './panels/WhispersPanel';
import { CleaningPanel } from './panels/CleaningPanel';
import { DataTablePanel, type DataTableHandle } from './panels/DataTablePanel';
import { ExportBar } from './ExportBar';
import { cn } from '@/lib/utils';

const TABS = ['Overview', 'Columns', 'Charts', 'Whispers', 'Clean', 'Data'] as const;
type Tab = (typeof TABS)[number];

interface DashboardProps {
  raw: RawDataset;
  tableRef: React.RefObject<DataTableHandle>;
}

export function Dashboard({ raw, tableRef }: DashboardProps) {
  const [overrides, setOverrides] = useState<Record<string, ColumnType>>({});
  const [tab, setTab] = useState<Tab>('Overview');
  const [highlightColumn, setHighlightColumn] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const dataset: Dataset = useMemo(
    () => analyzeDataset(raw, overrides),
    [raw, overrides],
  );
  const insights: Insight[] = useMemo(() => runInsights(dataset), [dataset]);

  const onOverride = (columnName: string, type: ColumnType) => {
    setOverrides((prev) => ({ ...prev, [columnName]: type }));
  };

  const onSelectInsight = (insight: Insight) => {
    if (insight.target) {
      setTab('Charts');
      setTimeout(() => document.getElementById(insight.target!)?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else if (insight.columnName) {
      setTab('Columns');
      setHighlightColumn(insight.columnName);
      setTimeout(() => {
        document.getElementById(`column-${insight.columnName}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      setTimeout(() => setHighlightColumn(null), 2500);
    }
  };

  return (
    <div ref={topRef} className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{raw.fileName}</h2>
          <p className="text-sm text-slate-500">
            {dataset.overview.rows.toLocaleString()} rows · {dataset.overview.columns} columns
            {raw.skippedRows > 0 && (
              <span className="ml-2 text-amber-600">({raw.skippedRows} malformed rows skipped)</span>
            )}
          </p>
        </div>
        <ExportBar dataset={dataset} insights={insights} />
      </div>

      <div
        role="tablist"
        aria-label="Analysis sections"
        className="no-print mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition',
              tab === t
                ? 'border-violet text-violet'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t}
            {t === 'Whispers' && insights.length > 0 && (
              <span className="ml-1.5 rounded-full bg-violet px-1.5 text-xs text-white">
                {insights.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'Overview' && <OverviewPanel dataset={dataset} />}
        {tab === 'Columns' && (
          <ColumnsPanel dataset={dataset} onOverride={onOverride} highlightColumn={highlightColumn} />
        )}
        {tab === 'Charts' && <ChartsPanel dataset={dataset} />}
        {tab === 'Whispers' && (
          <WhispersPanel dataset={dataset} insights={insights} onSelectInsight={onSelectInsight} />
        )}
        {tab === 'Clean' && <CleaningPanel dataset={dataset} />}
        {tab === 'Data' && <DataTablePanel ref={tableRef} dataset={dataset} />}
      </div>
    </div>
  );
}
