import { describe, expect, it } from 'vitest';
import { outliersRule } from '@/lib/insights/rules/outliers';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('outliersRule', () => {
  it('triggers when a numeric column has an extreme value', () => {
    const d = analyzeDataset(rawFromCsv('o.csv', 'x\n1\n2\n3\n4\n5\n6\n7\n8\n9\n1000'));
    expect(outliersRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger for a tight numeric column', () => {
    const d = analyzeDataset(rawFromCsv('t.csv', 'x\n10\n11\n12\n13\n14\n15'));
    expect(outliersRule(d)).toHaveLength(0);
  });
});
