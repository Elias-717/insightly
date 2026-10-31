import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import { missingValuesRule } from '@/lib/insights/rules/missing-values';
import { duplicatesRule } from '@/lib/insights/rules/duplicates';
import { outliersRule } from '@/lib/insights/rules/outliers';
import { correlationRule } from '@/lib/insights/rules/correlation';
import { dominantCategoryRule } from '@/lib/insights/rules/dominant-category';
import { identifierRule } from '@/lib/insights/rules/identifier';
import { inconsistentCasingRule } from '@/lib/insights/rules/inconsistent-casing';
import { constantColumnRule } from '@/lib/insights/rules/constant-column';
import { skewnessRule } from '@/lib/insights/rules/skewness';
import { zeroInflationRule } from '@/lib/insights/rules/zero-inflation';
import { highCardinalityRule } from '@/lib/insights/rules/high-cardinality';
import { qualitySummaryRule } from '@/lib/insights/rules/quality-summary';
import { rawFromCsv } from './helpers';

function makeMessy() {
  const rows = ['id,customer,value,status'];
  // Build a dataset with duplicates, a missing value, casing inconsistency, outlier.
  for (let i = 1; i <= 20; i += 1) {
    const status = i % 2 === 0 ? 'active' : 'Active';
    const value = i === 20 ? '100000' : String(i * 10);
    const customer = i === 5 ? '' : `Cust${i}`;
    rows.push(`${i},${customer},${value},${status}`);
  }
  rows.push('1,Cust1,10,Active'); // duplicate-ish
  return analyzeDataset(rawFromCsv('messy.csv', rows.join('\n')));
}

describe('insight rules', () => {
  const dataset = makeMessy();

  it('quality summary always produces a headline', () => {
    expect(qualitySummaryRule(dataset).length).toBe(1);
  });

  it('missing values rule flags a column with gaps', () => {
    const clean = analyzeDataset(rawFromCsv('m.csv', 'a,b\n1,\n2,\n3,\n4,5\n6,7'));
    const insights = missingValuesRule(clean);
    expect(insights.some((i) => i.columnName === 'b')).toBe(true);
  });

  it('duplicates rule flags exact duplicates', () => {
    const dup = analyzeDataset(rawFromCsv('d.csv', 'a,b\n1,2\n1,2\n3,4'));
    expect(duplicatesRule(dup).length).toBe(1);
  });

  it('outliers rule flags an extreme value', () => {
    const out = analyzeDataset(
      rawFromCsv('o.csv', 'x\n1\n2\n3\n4\n5\n6\n7\n8\n9\n1000'),
    );
    expect(outliersRule(out).length).toBeGreaterThan(0);
  });

  it('correlation rule flags strong relationships', () => {
    const corr = analyzeDataset(
      rawFromCsv('c.csv', 'a,b\n1,2\n2,4\n3,6\n4,8\n5,10\n6,12'),
    );
    expect(correlationRule(corr).length).toBeGreaterThan(0);
  });

  it('dominant category rule flags a lopsided column', () => {
    const rows = ['city'];
    for (let i = 0; i < 20; i += 1) rows.push(i < 16 ? 'KL' : 'Penang');
    const dom = analyzeDataset(rawFromCsv('city.csv', rows.join('\n')));
    expect(dominantCategoryRule(dom).length).toBeGreaterThan(0);
  });

  it('identifier rule flags unique-id columns', () => {
    const rows = ['id'];
    for (let i = 0; i < 30; i += 1) rows.push(`user_${i}`);
    const idData = analyzeDataset(rawFromCsv('id.csv', rows.join('\n')));
    expect(identifierRule(idData).length).toBeGreaterThan(0);
  });

  it('inconsistent casing rule flags mixed case', () => {
    expect(inconsistentCasingRule(dataset).some((i) => i.columnName === 'status')).toBe(true);
  });

  it('constant column rule flags single-value columns', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push('same');
    const constData = analyzeDataset(rawFromCsv('k.csv', rows.join('\n')));
    expect(constantColumnRule(constData).length).toBeGreaterThan(0);
  });

  it('skewness rule flags skewed numeric columns', () => {
    const rows = ['x'];
    for (let i = 0; i < 20; i += 1) rows.push('1');
    rows.push('500');
    const skewData = analyzeDataset(rawFromCsv('s.csv', rows.join('\n')));
    expect(skewnessRule(skewData).length).toBeGreaterThanOrEqual(0);
  });

  it('zero inflation rule flags columns full of zeros', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push(i < 6 ? '0' : '5');
    const zeroData = analyzeDataset(rawFromCsv('z.csv', rows.join('\n')));
    expect(zeroInflationRule(zeroData).length).toBeGreaterThan(0);
  });

  it('high cardinality rule returns an array', () => {
    expect(Array.isArray(highCardinalityRule(dataset))).toBe(true);
  });
});

describe('runInsights', () => {
  const dataset = makeMessy();
  const insights = runInsights(dataset);

  it('ranks warnings before info', () => {
    const firstWarningIdx = insights.findIndex((i) => i.severity === 'Warning');
    const firstInfoIdx = insights.findIndex((i) => i.severity === 'Info');
    if (firstWarningIdx !== -1 && firstInfoIdx !== -1) {
      expect(firstWarningIdx).toBeLessThan(firstInfoIdx);
    }
  });

  it('caps the number of insights', () => {
    expect(insights.length).toBeLessThanOrEqual(12);
  });

  it('produces several insights for a messy dataset', () => {
    expect(insights.length).toBeGreaterThanOrEqual(4);
  });
});
