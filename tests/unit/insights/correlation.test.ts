import { describe, expect, it } from 'vitest';
import { correlationRule } from '@/lib/insights/rules/correlation';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('correlationRule', () => {
  it('triggers for strongly correlated numeric columns', () => {
    const d = analyzeDataset(rawFromCsv('c.csv', 'a,b\n1,2\n2,4\n3,6\n4,8\n5,10\n6,12'));
    expect(correlationRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger for uncorrelated columns', () => {
    const d = analyzeDataset(rawFromCsv('u.csv', 'a,b\n1,7\n2,3\n3,9\n4,1\n5,8\n6,2'));
    expect(correlationRule(d)).toHaveLength(0);
  });
});
