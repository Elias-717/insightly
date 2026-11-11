'use client';

import { useMemo, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
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
import { cn, countNoun } from '@/lib/utils';

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
          <h2 className="font-mono text-lg font-semibold tracking-tightish">{raw.fileName}</h2>
          <p className="tabular text-sm text-muted">
            {countNoun(dataset.overview.rows, 'row')} · {countNoun(dataset.overview.columns, 'column')}
            {raw.skippedRows > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-warning-text">
                <TriangleAlert size={14} aria-hidden="true" />
                {countNoun(raw.skippedRows, 'malformed row')} skipped
              </span>
            )}
          </p>
        </div>
        <ExportBar dataset={dataset} insights={insights} />
      </div>

      <div
        role="tablist"
        aria-label="Analysis sections"
        className="no-print mb-6 flex gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg',
            )}
          >
            {t}
            {t === 'Whispers' && insights.length > 0 && (
              <span className="tabular ml-1.5 rounded-full bg-accent px-1.5 text-xs font-medium text-accent-fg">
                {insights.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Re-keyed per tab so each switch gets a short fade-in. */}
      <div role="tabpanel" key={tab} className="animate-fade-in">
        {tab === 'Overview' && (
          <OverviewPanel
            dataset={dataset}
            insights={insights}
            onViewWhispers={() => setTab('Whispers')}
            onSelectInsight={onSelectInsight}
          />
        )}
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
