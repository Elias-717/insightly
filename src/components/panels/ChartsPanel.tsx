'use client';

import { useState } from 'react';
import type { Dataset } from '@/types';
import { Histogram } from '@/components/charts/Histogram';
import { CategoryBar } from '@/components/charts/CategoryBar';
import { ScatterPlot } from '@/components/charts/ScatterChart';
import { TimeSeries } from '@/components/charts/TimeSeries';
import { CorrelationHeatmap } from '@/components/charts/CorrelationHeatmap';
import { BoxSummary } from '@/components/charts/BoxSummary';
import { Card } from '@/components/ui/Card';

export function ChartsPanel({ dataset }: { dataset: Dataset }) {
  const numericCols = dataset.columns.filter((c) => c.type === 'number' || c.type === 'integer');
  const categoryCols = dataset.columns.filter((c) => c.type === 'category' || c.type === 'boolean');
  const hasDate = dataset.columns.some((c) => c.type === 'date');

  // Limit which numeric columns show heavy per-column charts by default.
  const [showAllNumeric, setShowAllNumeric] = useState(false);
  const visibleNumeric = showAllNumeric ? numericCols : numericCols.slice(0, 4);

  const nothingToShow =
    numericCols.length === 0 && categoryCols.length === 0 && !hasDate;

  if (nothingToShow) {
    return (
      <Card className="text-center text-slate-500">
        No chartable columns were detected. Charts appear for numeric, category, and date columns.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hasDate && <TimeSeries dataset={dataset} />}

      {numericCols.length >= 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CorrelationHeatmap dataset={dataset} />
          <ScatterPlot dataset={dataset} />
        </div>
      )}

      {visibleNumeric.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleNumeric.map((c) => (
            <Histogram key={c.name} column={c} />
          ))}
        </div>
      )}

      {numericCols.length > 4 && !showAllNumeric && (
        <button
          onClick={() => setShowAllNumeric(true)}
          className="mx-auto block rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Show all {numericCols.length} numeric charts
        </button>
      )}

      {visibleNumeric.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleNumeric.map((c) => (
            <BoxSummary key={c.name} column={c} />
          ))}
        </div>
      )}

      {categoryCols.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {categoryCols.slice(0, 6).map((c) => (
            <CategoryBar key={c.name} column={c} raw={dataset.raw} />
          ))}
        </div>
      )}
    </div>
  );
}
