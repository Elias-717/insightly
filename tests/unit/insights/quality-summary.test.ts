import { describe, expect, it } from 'vitest';
import { qualitySummaryRule } from '@/lib/insights/rules/quality-summary';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('qualitySummaryRule', () => {
  it('always produces exactly one headline insight', () => {
    const clean = analyzeDataset(rawFromCsv('c.csv', 'a,b\n1,2\n3,4'));
    expect(qualitySummaryRule(clean)).toHaveLength(1);
  });

  it('marks a poor dataset as a Warning', () => {
    // Lots of missing values should lower the score.
    const rows = ['a,b,c'];
    for (let i = 0; i < 20; i += 1) rows.push(',,');
    rows.push('1,2,3');
    const poor = analyzeDataset(rawFromCsv('p.csv', rows.join('\n')));
    const [insight] = qualitySummaryRule(poor);
    expect(insight.severity).toBe('Warning');
  });
});
