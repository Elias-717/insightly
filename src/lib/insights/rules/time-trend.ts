import type { InsightRule } from '../types';
import { columnValues } from '@/lib/analysis/analyze';
import { parseDate, parseNumber } from '@/lib/analysis/clean-value';

/**
 * Flags an upward or downward month-over-month trend when a date column and
 * a numeric column co-exist. Uses the first date column and first numeric column.
 */
export const timeTrendRule: InsightRule = (dataset) => {
  const dateCol = dataset.columns.find((c) => c.type === 'date');
  const numCol = dataset.columns.find((c) => c.type === 'number' || c.type === 'integer');
  if (!dateCol || !numCol) return [];

  const dates = columnValues(dataset.raw, dateCol.index);
  const nums = columnValues(dataset.raw, numCol.index);

  // Aggregate sum by year-month.
  const byMonth = new Map<string, number>();
  for (let i = 0; i < dates.length; i += 1) {
    const t = parseDate(dates[i]);
    const n = parseNumber(nums[i]);
    if (t === null || n === null) continue;
    const d = new Date(t);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + n);
  }
  const months = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (months.length < 2) return [];

  const first = months[0][1];
  const last = months[months.length - 1][1];
  if (first === 0) return [];
  const periods = months.length - 1;
  const totalChange = ((last - first) / Math.abs(first)) * 100;
  const avgPerMonth = totalChange / periods;
  if (Math.abs(avgPerMonth) < 3) return [];

  const direction = avgPerMonth > 0 ? 'upward' : 'downward';
  const sign = avgPerMonth > 0 ? '+' : '';
  return [
    {
      id: `trend-${numCol.name}`,
      severity: 'Discovery' as const,
      title: `'${numCol.name}' is trending ${direction} over time (${sign}${avgPerMonth.toFixed(1)}% month over month).`,
      explanation: `Aggregated by month over '${dateCol.name}', '${numCol.name}' moves ${direction} across ${months.length} periods. Review the time-series chart for detail.`,
      importance: 62,
      columnName: numCol.name,
      target: 'chart-timeseries',
    },
  ];
};
