import { describe, expect, it } from 'vitest';
import { zeroInflationRule } from '@/lib/insights/rules/zero-inflation';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('zeroInflationRule', () => {
  it('triggers when a numeric column is mostly zeros', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push(i < 6 ? '0' : '5');
    const d = analyzeDataset(rawFromCsv('z.csv', rows.join('\n')));
    expect(zeroInflationRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger when zeros are rare', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push(i < 1 ? '0' : '5');
    const d = analyzeDataset(rawFromCsv('z.csv', rows.join('\n')));
    expect(zeroInflationRule(d)).toHaveLength(0);
  });
});
