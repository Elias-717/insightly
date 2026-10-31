import { describe, expect, it } from 'vitest';
import { skewnessRule } from '@/lib/insights/rules/skewness';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('skewnessRule', () => {
  it('triggers for a heavily right-skewed numeric column', () => {
    // Many small distinct values plus a long right tail -> strong positive skew,
    // while keeping enough unique values to be detected as numeric.
    const rows = ['x'];
    // Repeat small values so uniqueness stays below the identifier threshold,
    // then add a long right tail for strong positive skew.
    const small = [1, 2, 3, 4, 5];
    for (let r = 0; r < 4; r += 1) for (const v of small) rows.push(String(v));
    for (const v of [200, 350, 500, 800, 1500]) rows.push(String(v));
    const d = analyzeDataset(rawFromCsv('s.csv', rows.join('\n')));
    const col = d.columns.find((c) => c.name === 'x');
    expect(col?.type === 'number' || col?.type === 'integer').toBe(true);
    expect(Math.abs(col!.numeric!.skewness)).toBeGreaterThanOrEqual(1);
    expect(skewnessRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger for a symmetric distribution', () => {
    const d = analyzeDataset(
      rawFromCsv('sym.csv', 'x\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12'),
    );
    expect(skewnessRule(d)).toHaveLength(0);
  });
});
