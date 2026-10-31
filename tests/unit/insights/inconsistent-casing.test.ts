import { describe, expect, it } from 'vitest';
import { inconsistentCasingRule } from '@/lib/insights/rules/inconsistent-casing';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('inconsistentCasingRule', () => {
  it('triggers when values differ only by case', () => {
    const rows = ['status'];
    for (let i = 0; i < 10; i += 1) rows.push(i % 2 === 0 ? 'Active' : 'active');
    const d = analyzeDataset(rawFromCsv('s.csv', rows.join('\n')));
    expect(inconsistentCasingRule(d).length).toBeGreaterThan(0);
  });

  it('does not trigger when casing is consistent', () => {
    const rows = ['status'];
    for (let i = 0; i < 10; i += 1) rows.push(i % 2 === 0 ? 'Active' : 'Inactive');
    const d = analyzeDataset(rawFromCsv('s.csv', rows.join('\n')));
    expect(inconsistentCasingRule(d)).toHaveLength(0);
  });
});
