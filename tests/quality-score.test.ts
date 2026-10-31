import { describe, expect, it } from 'vitest';
import { computeQualityScore, letterGrade } from '@/lib/analysis/quality-score';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from './helpers';

describe('quality score', () => {
  it('maps scores to letter grades', () => {
    expect(letterGrade(95)).toBe('A');
    expect(letterGrade(85)).toBe('B');
    expect(letterGrade(72)).toBe('C');
    expect(letterGrade(61)).toBe('D');
    expect(letterGrade(40)).toBe('F');
  });

  it('gives a perfect dataset a high completeness component', () => {
    const clean = analyzeDataset(
      rawFromCsv('clean.csv', 'a,b\n1,2\n3,4\n5,6'),
    );
    const completeness = clean.quality.components.find((c) => c.key === 'completeness');
    expect(completeness?.score).toBe(100);
  });

  it('weights sum to 1', () => {
    const score = computeQualityScore([], 0, 0);
    const totalWeight = score.components.reduce((s, c) => s + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it('penalizes duplicates in the uniqueness component', () => {
    const result = computeQualityScore([], 100, 20);
    const uniqueness = result.components.find((c) => c.key === 'uniqueness');
    expect(uniqueness?.score).toBe(80);
  });
});
