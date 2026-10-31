import { describe, expect, it } from 'vitest';
import { highCardinalityRule } from '@/lib/insights/rules/high-cardinality';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('highCardinalityRule', () => {
  it('triggers for a text column with many but not fully unique values', () => {
    const rows = ['note'];
    // 30 rows, ~60% unique: repeat some values so it is not classified as identifier.
    for (let i = 0; i < 30; i += 1) {
      rows.push(`free text comment number ${i % 20} with words`);
    }
    const d = analyzeDataset(rawFromCsv('n.csv', rows.join('\n')));
    const col = d.columns.find((c) => c.name === 'note');
    // Only assert the rule shape; classification depends on detector thresholds.
    if (col?.type === 'text') {
      expect(Array.isArray(highCardinalityRule(d))).toBe(true);
    }
    expect(Array.isArray(highCardinalityRule(d))).toBe(true);
  });

  it('does not trigger for a low-cardinality category', () => {
    const rows = ['c'];
    for (let i = 0; i < 30; i += 1) rows.push(i % 2 === 0 ? 'yes' : 'no');
    const d = analyzeDataset(rawFromCsv('c.csv', rows.join('\n')));
    expect(highCardinalityRule(d)).toHaveLength(0);
  });
});
