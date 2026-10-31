'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Dataset } from '@/types';
import { columnValues } from '@/lib/analysis/analyze';
import { parseDate, parseNumber } from '@/lib/analysis/clean-value';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_GRID } from './palette';

type Granularity = 'day' | 'week' | 'month';
type Aggregation = 'sum' | 'mean' | 'count';

function bucketKey(ts: number, g: Granularity): string {
  const d = new Date(ts);
  if (g === 'day') return d.toISOString().slice(0, 10);
  if (g === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  // week: ISO-ish year-week
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function TimeSeries({ dataset }: { dataset: Dataset }) {
  const dateCols = dataset.columns.filter((c) => c.type === 'date');
  const numericCols = dataset.columns.filter((c) => c.type === 'number' || c.type === 'integer');
  const [dateCol] = useState(dateCols[0]?.name ?? '');
  const [numCol, setNumCol] = useState(numericCols[0]?.name ?? '');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [aggregation, setAggregation] = useState<Aggregation>('sum');

  const data = useMemo(() => {
    const dIdx = dataset.columns.find((c) => c.name === dateCol)?.index;
    const nIdx = dataset.columns.find((c) => c.name === numCol)?.index;
    if (dIdx === undefined) return [];
    const dates = columnValues(dataset.raw, dIdx);
    const nums = nIdx !== undefined ? columnValues(dataset.raw, nIdx) : [];
    const buckets = new Map<string, { sum: number; count: number }>();
    for (let i = 0; i < dates.length; i += 1) {
      const t = parseDate(dates[i]);
      if (t === null) continue;
      const key = bucketKey(t, granularity);
      const existing = buckets.get(key) ?? { sum: 0, count: 0 };
      const n = aggregation === 'count' ? 1 : (parseNumber(nums[i]) ?? 0);
      existing.sum += n;
      existing.count += 1;
      buckets.set(key, existing);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, { sum, count }]) => ({
        key,
        value: aggregation === 'mean' ? sum / count : aggregation === 'count' ? count : sum,
      }));
  }, [dataset, dateCol, numCol, granularity, aggregation]);

  if (dateCols.length === 0) return null;

  const selectClass =
    'rounded-control border border-border bg-surface px-2 py-1 text-xs';

  return (
    <ChartFrame
      id="chart-timeseries"
      title="Over time"
      summary={`${aggregation} of ${aggregation === 'count' ? 'rows' : numCol} by ${granularity} over ${dateCol}, across ${data.length} periods.`}
      controls={
        <div className="flex flex-wrap items-center gap-1">
          {numericCols.length > 0 && aggregation !== 'count' && (
            <select
              value={numCol}
              onChange={(e) => setNumCol(e.target.value)}
              className={selectClass}
              aria-label="Numeric column"
            >
              {numericCols.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          )}
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
            className={selectClass}
            aria-label="Aggregation"
          >
            <option value="sum">sum</option>
            <option value="mean">mean</option>
            <option value="count">count</option>
          </select>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
            className={selectClass}
            aria-label="Granularity"
          >
            <option value="day">day</option>
            <option value="week">week</option>
            <option value="month">month</option>
          </select>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="key" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_ACCENT}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
