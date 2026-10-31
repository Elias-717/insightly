import { describe, expect, it } from 'vitest';
import { dominantCategoryRule } from '@/lib/insights/rules/dominant-category';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

function cityData(majority: number, total: number) {
  const rows = ['city'];
  for (let i = 0; i < total; i += 1) rows.push(i < majority ? 'KL' : 'Penang');
  return analyzeDataset(rawFromCsv('city.csv', rows.join('\n')));
}

describe('dominantCategoryRule', () => {
  it('triggers when one value dominates (>= 60%)', () => {
    expect(dominantCategoryRule(cityData(16, 20)).length).toBeGreaterThan(0);
  });

  it('does not trigger for a balanced category', () => {
    expect(dominantCategoryRule(cityData(10, 20))).toHaveLength(0);
  });
});
