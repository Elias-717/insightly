'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ColumnProfile } from '@/types';
import { histogram } from '@/lib/analysis/stats';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_GRID } from './palette';

export function Histogram({ column }: { column: ColumnProfile }) {
  const [bins, setBins] = useState(10);
  const data = useMemo(
    () => histogram(column.numeric?.values ?? [], bins),
    [column.numeric, bins],
  );
  const peak = data.reduce((m, d) => (d.count > m.count ? d : m), data[0]);

  return (
    <ChartFrame
      id={`chart-hist-${column.name}`}
      title={`Distribution of ${column.name}`}
      summary={`A histogram of ${column.name} across ${bins} bins. The busiest range is ${peak?.label ?? 'n/a'} with ${peak?.count ?? 0} values. Mean ${column.numeric?.mean.toFixed(2)}, median ${column.numeric?.median.toFixed(2)}.`}
      controls={
        <label className="flex items-center gap-1 text-xs">
          Bins
          <input
            type="range"
            min={4}
            max={30}
            value={bins}
            onChange={(e) => setBins(Number(e.target.value))}
            className="accent-accent"
            aria-label="Adjust histogram bin count"
          />
          <span className="w-6 text-right">{bins}</span>
        </label>
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            labelFormatter={(l) => `Range ${l}`}
          />
          <Bar dataKey="count" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
