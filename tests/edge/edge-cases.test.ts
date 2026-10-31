import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { detectColumnType } from '@/lib/analysis/detect-type';
import { computeNumericStats } from '@/lib/analysis/stats';
import { parseNumber } from '@/lib/analysis/clean-value';
import { runInsights } from '@/lib/insights';
import { toCsv } from '@/lib/analysis/cleaning';
import { rawFromCsv, rawFromFixture } from '../helpers';

describe('edge cases', () => {
  it('handles an empty dataset (header only)', () => {
    const d = analyzeDataset(rawFromCsv('e.csv', 'a,b,c'));
    expect(d.overview.rows).toBe(0);
    expect(d.overview.columns).toBe(3);
    expect(() => runInsights(d)).not.toThrow();
    expect(d.quality.score).toBeGreaterThanOrEqual(0);
  });

  it('handles a single row', () => {
    const d = analyzeDataset(rawFromCsv('s.csv', 'a,b\n1,2'));
    expect(d.overview.rows).toBe(1);
    expect(() => runInsights(d)).not.toThrow();
  });

  it('handles a single column', () => {
    const d = analyzeDataset(rawFromFixture('one-column.csv'));
    expect(d.overview.columns).toBe(1);
    expect(d.correlation.columns.length).toBeLessThanOrEqual(1);
  });

  it('handles all values missing in a column', () => {
    const d = analyzeDataset(rawFromCsv('m.csv', 'a,b\n1,\n2,\n3,'));
    const b = d.columns.find((c) => c.name === 'b');
    expect(b?.missingPct).toBe(100);
    expect(() => runInsights(d)).not.toThrow();
  });

  it('handles all values identical', () => {
    const rows = ['x'];
    for (let i = 0; i < 10; i += 1) rows.push('7');
    const d = analyzeDataset(rawFromCsv('c.csv', rows.join('\n')));
    const x = d.columns.find((c) => c.name === 'x');
    expect(x?.uniqueCount).toBe(1);
  });

  it('handles very large and negative numbers', () => {
    const stats = computeNumericStats([-1e12, -500, 0, 500, 1e12]);
    expect(stats.min).toBe(-1e12);
    expect(stats.max).toBe(1e12);
    expect(stats.negatives).toBe(2);
    expect(Number.isFinite(stats.mean)).toBe(true);
    expect(Number.isFinite(stats.std)).toBe(true);
  });

  it('handles unicode and emoji text', () => {
    const d = analyzeDataset(rawFromFixture('unicode.csv'));
    expect(d.overview.rows).toBeGreaterThan(0);
    const emojiCol = d.columns.find((c) => c.name === 'emoji');
    expect(emojiCol).toBeDefined();
    expect(() => runInsights(d)).not.toThrow();
  });

  it('handles mixed-type columns by falling back gracefully', () => {
    const d = analyzeDataset(rawFromCsv('mix.csv', 'x\n1\nhello\n2\nworld\n3'));
    const x = d.columns.find((c) => c.name === 'x');
    // Mixed numbers and words: should not crash; type is text or category.
    expect(['text', 'category', 'number', 'integer']).toContain(x?.type);
  });

  it('handles very long strings', () => {
    const long = 'x'.repeat(10000);
    const d = analyzeDataset(rawFromCsv('l.csv', `v\n${long}\nshort`));
    expect(() => runInsights(d)).not.toThrow();
    expect(d.overview.rows).toBe(2);
  });

  it('handles quoted fields containing commas', () => {
    const d = analyzeDataset(rawFromCsv('q.csv', 'name,note\n"Smith, John","a, b, c"'));
    expect(d.overview.columns).toBe(2);
    expect(d.raw.rows[0][0]).toBe('Smith, John');
  });

  it('strips a leading BOM so the first header is clean', () => {
    const d = analyzeDataset(rawFromFixture('bom.csv'));
    expect(d.columns[0].name).toBe('id');
    expect(d.columns[0].name.charCodeAt(0)).not.toBe(0xfeff);
  });

  it('round-trips row and column counts through CSV export', () => {
    const d = analyzeDataset(rawFromFixture('clean.csv'));
    const reparsed = rawFromCsv('re.csv', toCsv(d.raw));
    expect(reparsed.headers.length).toBe(d.raw.headers.length);
    expect(reparsed.rows.length).toBe(d.raw.rows.length);
  });

  it('parses an empty string as a missing number, not zero', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(null)).toBeNull();
  });

  it('detects type on an all-empty column without throwing', () => {
    expect(() => detectColumnType([null, null, null])).not.toThrow();
    expect(detectColumnType([null, null]).type).toBe('text');
  });
});

describe('inconsistent row lengths', () => {
  it('tolerates rows with missing trailing cells by padding with null', () => {
    // The naive helper pads to header width; analysis must not crash.
    const d = analyzeDataset(rawFromCsv('j.csv', 'a,b,c\n1,2,3\n4,5\n6'));
    expect(d.overview.columns).toBe(3);
    expect(d.raw.rows).toHaveLength(3);
    // Short rows get null in the missing positions.
    expect(d.raw.rows[1][2]).toBeNull();
  });
});
