import { describe, expect, it } from 'vitest';
import {
  computeNumericStats,
  histogram,
  mean,
  median,
  mode,
  percentile,
  skewness,
  standardDeviation,
  variance,
} from '@/lib/analysis/stats';

describe('stats', () => {
  const values = [1, 2, 2, 3, 4, 7, 9];

  it('computes the mean', () => {
    expect(mean([2, 4, 6])).toBe(4);
  });

  it('computes the median for odd and even counts', () => {
    expect(median([1, 3, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('computes the mode and returns null when all unique', () => {
    expect(mode(values)).toBe(2);
    expect(mode([1, 2, 3])).toBeNull();
  });

  it('computes sample variance and std deviation', () => {
    expect(variance([2, 4, 6])).toBeCloseTo(4, 5);
    expect(standardDeviation([2, 4, 6])).toBeCloseTo(2, 5);
  });

  it('computes percentiles with interpolation', () => {
    const sorted = [1, 2, 3, 4, 5];
    expect(percentile(sorted, 0.5)).toBe(3);
    expect(percentile(sorted, 0.25)).toBe(2);
  });

  it('computes quartiles and IQR outliers in the full profile', () => {
    const stats = computeNumericStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
    expect(stats.outlierCount).toBe(1);
    expect(stats.outliers).toContain(100);
    expect(stats.max).toBe(100);
    expect(stats.min).toBe(1);
  });

  it('reports skewness sign for a right-skewed set', () => {
    expect(skewness([1, 1, 1, 2, 10])).toBeGreaterThan(0);
  });

  it('counts zeros and negatives', () => {
    const stats = computeNumericStats([0, 0, -1, 5]);
    expect(stats.zeros).toBe(2);
    expect(stats.negatives).toBe(1);
  });

  it('builds histogram bins that sum to the input length', () => {
    const bins = histogram([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    const total = bins.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(10);
    expect(bins).toHaveLength(5);
  });
});
