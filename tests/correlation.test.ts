import { describe, expect, it } from 'vitest';
import { buildCorrelationMatrix, pearson } from '@/lib/analysis/correlation';

describe('pearson correlation', () => {
  it('is 1 for a perfect positive linear relationship', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 5);
  });
  it('is -1 for a perfect negative linear relationship', () => {
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1, 5);
  });
  it('is 0 for zero-variance input', () => {
    expect(pearson([1, 1, 1], [2, 4, 6])).toBe(0);
  });

  it('builds a symmetric matrix with 1 on the diagonal', () => {
    const matrix = buildCorrelationMatrix([
      { name: 'a', values: [1, 2, 3, 4] },
      { name: 'b', values: [2, 4, 6, 8] },
    ]);
    expect(matrix.lookup['a__a']).toBe(1);
    expect(matrix.lookup['a__b']).toBeCloseTo(1, 5);
    expect(matrix.lookup['a__b']).toBeCloseTo(matrix.lookup['b__a'], 5);
  });

  it('handles missing values pairwise', () => {
    const matrix = buildCorrelationMatrix([
      { name: 'a', values: [1, 2, null, 4] },
      { name: 'b', values: [2, 4, 6, 8] },
    ]);
    expect(matrix.lookup['a__b']).toBeCloseTo(1, 5);
  });
});
