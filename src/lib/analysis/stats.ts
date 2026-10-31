import type { NumericStats } from '@/types';

/** Numerically sort a copy of the array ascending. */
export function sortNumbers(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Linear-interpolation percentile on a *sorted* array.
 * p is a fraction in [0, 1].
 */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

export function median(values: number[]): number {
  return percentile(sortNumbers(values), 0.5);
}

/** Most frequent value. Returns null when every value is unique. */
export function mode(values: number[]): number | null {
  if (values.length === 0) return null;
  const counts = new Map<number, number>();
  let best: number | null = null;
  let bestCount = 0;
  for (const v of values) {
    const next = (counts.get(v) ?? 0) + 1;
    counts.set(v, next);
    if (next > bestCount) {
      bestCount = next;
      best = v;
    }
  }
  // If nothing repeats, there is no meaningful mode.
  return bestCount > 1 ? best : null;
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const sumSq = values.reduce((acc, v) => acc + (v - m) ** 2, 0);
  // Sample variance (n - 1).
  return sumSq / (values.length - 1);
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** Sample skewness (Fisher-Pearson). Returns 0 when undefined. */
export function skewness(values: number[]): number {
  const n = values.length;
  if (n < 3) return 0;
  const m = mean(values);
  const sd = standardDeviation(values);
  if (sd === 0) return 0;
  const sumCubed = values.reduce((acc, v) => acc + ((v - m) / sd) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sumCubed;
}

/**
 * Outliers using the 1.5 * IQR fence method.
 * Returns the fence bounds and the list of outlier values.
 */
export function iqrOutliers(
  sorted: number[],
  q1: number,
  q3: number,
): { lower: number; upper: number; outliers: number[] } {
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lower || v > upper);
  return { lower, upper, outliers };
}

/** Compute the full numeric profile for a list of numbers. */
export function computeNumericStats(values: number[]): NumericStats {
  const sorted = sortNumbers(values);
  const count = values.length;
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const { outliers } = iqrOutliers(sorted, q1, q3);
  const varc = variance(values);
  return {
    count,
    min: sorted[0] ?? NaN,
    max: sorted[sorted.length - 1] ?? NaN,
    mean: mean(values),
    median: percentile(sorted, 0.5),
    mode: mode(values),
    std: Math.sqrt(varc),
    variance: varc,
    q1,
    q3,
    iqr: q3 - q1,
    skewness: skewness(values),
    outlierCount: outliers.length,
    outliers,
    zeros: values.filter((v) => v === 0).length,
    negatives: values.filter((v) => v < 0).length,
    values,
  };
}

/** Build histogram bins from numeric values. */
export function histogram(
  values: number[],
  binCount: number,
): { binStart: number; binEnd: number; count: number; label: string }[] {
  if (values.length === 0 || binCount < 1) return [];
  const sorted = sortNumbers(values);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) {
    return [{ binStart: min, binEnd: max, count: values.length, label: formatNum(min) }];
  }
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * width,
    binEnd: min + (i + 1) * width,
    count: 0,
    label: '',
  }));
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  }
  for (const b of bins) {
    b.label = `${formatNum(b.binStart)}–${formatNum(b.binEnd)}`;
  }
  return bins;
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}
