import { describe, expect, it } from 'vitest';
import { INSIGHT_RULES, runInsights } from '@/lib/insights';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

function messyDataset() {
  const rows = ['id,customer,value,status'];
  for (let i = 1; i <= 20; i += 1) {
    const status = i % 2 === 0 ? 'active' : 'Active';
    const value = i === 20 ? '100000' : String(i * 10);
    const customer = i === 5 ? '' : `Cust${i}`;
    rows.push(`${i},${customer},${value},${status}`);
  }
  rows.push('1,Cust1,10,Active');
  return analyzeDataset(rawFromCsv('messy.csv', rows.join('\n')));
}

describe('runInsights', () => {
  const dataset = messyDataset();
  const insights = runInsights(dataset);

  it('registers all rules', () => {
    expect(INSIGHT_RULES.length).toBeGreaterThanOrEqual(13);
  });

  it('caps the number of insights at the limit', () => {
    expect(insights.length).toBeLessThanOrEqual(12);
    expect(runInsights(dataset, 5).length).toBeLessThanOrEqual(5);
  });

  it('orders warnings before discoveries before info', () => {
    const rank: Record<string, number> = { Warning: 0, Discovery: 1, Info: 2 };
    for (let i = 1; i < insights.length; i += 1) {
      expect(rank[insights[i - 1].severity]).toBeLessThanOrEqual(rank[insights[i].severity]);
    }
  });

  it('produces several insights for a messy dataset', () => {
    expect(insights.length).toBeGreaterThanOrEqual(4);
  });

  it('returns no insights for a tiny clean dataset beyond the quality summary', () => {
    const clean = analyzeDataset(rawFromCsv('c.csv', 'a,b\n1,2\n3,4'));
    const result = runInsights(clean);
    expect(result.some((i) => i.id === 'quality-summary')).toBe(true);
  });
});
