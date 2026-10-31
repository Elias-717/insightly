import { describe, expect, it } from 'vitest';
import { identifierRule } from '@/lib/insights/rules/identifier';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('identifierRule', () => {
  it('triggers for a mostly-unique id column', () => {
    const rows = ['id'];
    for (let i = 0; i < 30; i += 1) rows.push(`user_${i}`);
    const d = analyzeDataset(rawFromCsv('id.csv', rows.join('\n')));
    expect(identifierRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger for a low-cardinality category', () => {
    const rows = ['status'];
    for (let i = 0; i < 30; i += 1) rows.push(i % 2 === 0 ? 'A' : 'B');
    const d = analyzeDataset(rawFromCsv('s.csv', rows.join('\n')));
    expect(identifierRule(d)).toHaveLength(0);
  });
});
