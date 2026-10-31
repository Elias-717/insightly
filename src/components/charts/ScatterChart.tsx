'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { Dataset } from '@/types';
import { columnValues } from '@/lib/analysis/analyze';
import { parseNumber } from '@/lib/analysis/clean-value';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_GRID } from './palette';

export function ScatterPlot({ dataset }: { dataset: Dataset }) {
  const numericCols = dataset.columns.filter((c) => c.type === 'number' || c.type === 'integer');
  const [xCol, setXCol] = useState(numericCols[0]?.name ?? '');
  const [yCol, setYCol] = useState(numericCols[1]?.name ?? numericCols[0]?.name ?? '');

  const data = useMemo(() => {
    const xIndex = dataset.columns.find((c) => c.name === xCol)?.index;
    const yIndex = dataset.columns.find((c) => c.name === yCol)?.index;
    if (xIndex === undefined || yIndex === undefined) return [];
    const xs = columnValues(dataset.raw, xIndex);
    const ys = columnValues(dataset.raw, yIndex);
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < xs.length; i += 1) {
      const x = parseNumber(xs[i]);
      const y = parseNumber(ys[i]);
      if (x !== null && y !== null) out.push({ x, y });
    }
    return out;
  }, [dataset, xCol, yCol]);

  const r = dataset.correlation.lookup[`${xCol}__${yCol}`];

  if (numericCols.length < 2) {
    return null;
  }

  const selectClass =
    'rounded-control border border-border bg-surface px-2 py-1 text-xs';

  return (
    <ChartFrame
      id="chart-scatter"
      title="Scatter plot"
      summary={`Scatter of ${yCol} against ${xCol} over ${data.length} complete rows.${
        r !== undefined ? ` Pearson correlation r = ${r.toFixed(2)}.` : ''
      }`}
      controls={
        <div className="flex items-center gap-1">
          <select
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
            className={selectClass}
            aria-label="X axis column"
          >
            {numericCols.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
          <span className="text-xs">vs</span>
          <select
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
            className={selectClass}
            aria-label="Y axis column"
          >
            {numericCols.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <RScatterChart margin={{ bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis type="number" dataKey="x" name={xCol} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name={yCol} tick={{ fontSize: 11 }} />
          <ZAxis range={[40, 40]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Scatter data={data} fill={CHART_ACCENT} fillOpacity={0.6} />
        </RScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
