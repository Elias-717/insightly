'use client';

import { useMemo } from 'react';
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
import { columnValues } from '@/lib/analysis/analyze';
import { isMissing } from '@/lib/analysis/clean-value';
import type { RawDataset } from '@/types';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_GRID } from './palette';

export function CategoryBar({ column, raw }: { column: ColumnProfile; raw: RawDataset }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of columnValues(raw, column.index)) {
      if (isMissing(v)) continue;
      const key = (v as string).trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const result = top.map(([value, count]) => ({ value, count }));
    if (rest.length > 0) {
      result.push({ value: 'Other', count: rest.reduce((s, [, c]) => s + c, 0) });
    }
    return result;
  }, [column.index, raw]);

  const top = data[0];

  return (
    <ChartFrame
      id={`chart-cat-${column.name}`}
      title={`Top values in ${column.name}`}
      summary={`Bar chart of the most frequent values in ${column.name}. The most common is "${top?.value}" with ${top?.count} rows. ${column.category?.uniqueCount ?? 0} distinct values in total.`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis dataKey="value" type="category" width={110} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" fill={CHART_ACCENT} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
