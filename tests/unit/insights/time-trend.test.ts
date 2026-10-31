import { describe, expect, it } from 'vitest';
import { timeTrendRule } from '@/lib/insights/rules/time-trend';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('timeTrendRule', () => {
  it('triggers when a numeric value trends over a date column', () => {
    const rows = ['date,sales'];
    const months = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01'];
    months.forEach((m, i) => rows.push(`${m},${100 + i * 50}`));
    const d = analyzeDataset(rawFromCsv('t.csv', rows.join('\n')));
    expect(timeTrendRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger without a date column', () => {
    const d = analyzeDataset(rawFromCsv('n.csv', 'a,b\n1,2\n3,4\n5,6'));
    expect(timeTrendRule(d)).toHaveLength(0);
  });
});
