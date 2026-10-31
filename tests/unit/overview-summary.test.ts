import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import {
  buildOverviewSummary,
  emptyColumnCount,
  joinList,
  missingBreakdown,
  qualityVerdict,
  rowsSubline,
  topQualityReasons,
  typeSummary,
} from '@/lib/overview/summary';
import { rawFromCsv } from '../helpers';

const clean = analyzeDataset(
  rawFromCsv('clean.csv', 'name,score\nAlice,90\nBob,80\nCarol,70\nDan,85\nEve,95'),
);

function messy() {
  const rows = ['id,customer,value,status,empty'];
  for (let i = 1; i <= 20; i += 1) {
    const status = i % 2 === 0 ? 'active' : 'Active';
    const value = i === 20 ? '100000' : i % 5 === 0 ? '' : String(i * 10);
    const customer = i % 4 === 0 ? 'NA' : `Cust${i}`;
    rows.push(`${i},${customer},${value},${status},`);
  }
  rows.push('1,Cust1,10,Active,');
  rows.push('1,Cust1,10,Active,');
  return analyzeDataset(rawFromCsv('messy.csv', rows.join('\n')));
}

describe('joinList', () => {
  it('handles zero, one, two, and three items', () => {
    expect(joinList([])).toBe('');
    expect(joinList(['a'])).toBe('a');
    expect(joinList(['a', 'b'])).toBe('a and b');
    expect(joinList(['a', 'b', 'c'])).toBe('a, b, and c');
  });
});

describe('missingBreakdown', () => {
  it('splits empty strings from placeholder tokens', () => {
    const d = messy();
    const b = missingBreakdown(d);
    expect(b.total).toBe(b.empty + b.placeholders);
    expect(b.empty).toBeGreaterThan(0); // the all-empty column + blank values
    expect(b.placeholders).toBeGreaterThan(0); // the "NA" values
  });

  it('reports zero for a complete dataset', () => {
    expect(missingBreakdown(clean).total).toBe(0);
  });
});

describe('emptyColumnCount', () => {
  it('counts fully empty columns', () => {
    expect(emptyColumnCount(messy())).toBeGreaterThanOrEqual(1);
  });
  it('is zero for a clean dataset', () => {
    expect(emptyColumnCount(clean)).toBe(0);
  });
});

describe('buildOverviewSummary', () => {
  it('reports a healthy dataset as success', () => {
    const summary = buildOverviewSummary(clean, runInsights(clean));
    expect(summary.severity).toBe('success');
    expect(summary.sentence).toMatch(/healthy/i);
  });

  it('flags a messy dataset as error and mentions problems', () => {
    const d = messy();
    const summary = buildOverviewSummary(d, runInsights(d));
    expect(summary.severity).toBe('error');
    expect(summary.sentence).toMatch(/serious quality issues/i);
    expect(summary.sentence).toMatch(/Open Whispers/);
  });

  it('pluralizes correctly in the sentence', () => {
    // One duplicate row only -> "1 duplicate row" (singular).
    const d = analyzeDataset(rawFromCsv('d.csv', 'a,b\n1,2\n1,2\n3,4\n5,6\n7,8'));
    const summary = buildOverviewSummary(d, runInsights(d));
    expect(summary.sentence).toMatch(/1 duplicate row\b/);
    expect(summary.sentence).not.toMatch(/1 duplicate rows/);
  });
});

describe('topQualityReasons', () => {
  it('returns at most the requested number, worst first', () => {
    const reasons = topQualityReasons(messy(), 3);
    expect(reasons.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < reasons.length; i += 1) {
      expect(reasons[i - 1].pointsLost).toBeGreaterThanOrEqual(reasons[i].pointsLost);
    }
  });

  it('returns nothing for a perfect dataset', () => {
    expect(topQualityReasons(clean)).toHaveLength(0);
  });
});

describe('qualityVerdict', () => {
  it('maps score ranges to verdicts', () => {
    expect(qualityVerdict(95)).toMatch(/Excellent/);
    expect(qualityVerdict(85)).toMatch(/Good/);
    expect(qualityVerdict(72)).toMatch(/Fair/);
    expect(qualityVerdict(62)).toMatch(/Needs work/);
    expect(qualityVerdict(40)).toMatch(/Poor/);
  });
});

describe('typeSummary and rowsSubline', () => {
  it('summarizes types present and hides zero types', () => {
    const s = typeSummary(clean);
    expect(s).toMatch(/\d+ \w+/);
    expect(s).not.toMatch(/0 /);
  });

  it('says all rows parsed when nothing was skipped', () => {
    expect(rowsSubline(clean)).toBe('all rows parsed');
  });
});
