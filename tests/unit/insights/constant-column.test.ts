import { describe, expect, it } from 'vitest';
import { constantColumnRule } from '@/lib/insights/rules/constant-column';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('constantColumnRule', () => {
  it('triggers for a single-value column', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push('same');
    const d = analyzeDataset(rawFromCsv('k.csv', rows.join('\n')));
    expect(constantColumnRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger for a varied column', () => {
    const d = analyzeDataset(rawFromCsv('v.csv', 'x\na\nb\nc\nd'));
    expect(constantColumnRule(d)).toHaveLength(0);
  });
});
