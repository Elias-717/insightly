import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { computeNumericStats, mean } from '@/lib/analysis/stats';
import { pearson } from '@/lib/analysis/correlation';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { toCsv } from '@/lib/analysis/cleaning';
import { rawFromCsv } from '../helpers';

// Reasonable finite numbers to avoid NaN/Infinity noise in invariants.
const finiteNum = fc.double({ min: -1e9, max: 1e9, noNaN: true, noDefaultInfinity: true });

describe('property-based invariants', () => {
  it('min <= median <= max for any non-empty numeric set', () => {
    fc.assert(
      fc.property(fc.array(finiteNum, { minLength: 1, maxLength: 200 }), (values) => {
        const s = computeNumericStats(values);
        expect(s.min).toBeLessThanOrEqual(s.median);
        expect(s.median).toBeLessThanOrEqual(s.max);
      }),
    );
  });

  it('Pearson correlation is always within [-1, 1]', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(finiteNum, finiteNum), { minLength: 2, maxLength: 200 }),
        (pairs) => {
          const xs = pairs.map((p) => p[0]);
          const ys = pairs.map((p) => p[1]);
          const r = pearson(xs, ys);
          expect(r).toBeGreaterThanOrEqual(-1);
          expect(r).toBeLessThanOrEqual(1);
        },
      ),
    );
  });

  it('quality score is always between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            a: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
            b: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
          }),
          { minLength: 1, maxLength: 60 },
        ),
        (records) => {
          const lines = ['a,b'];
          for (const r of records) {
            lines.push(`${r.a ?? ''},${r.b ?? ''}`);
          }
          const d = analyzeDataset(rawFromCsv('p.csv', lines.join('\n')));
          expect(d.quality.score).toBeGreaterThanOrEqual(0);
          expect(d.quality.score).toBeLessThanOrEqual(100);
        },
      ),
    );
  });

  it('mean of a constant column equals that constant', () => {
    fc.assert(
      fc.property(finiteNum, fc.integer({ min: 1, max: 100 }), (value, count) => {
        const arr = new Array(count).fill(value);
        const m = mean(arr);
        // Use a relative tolerance: repeated float summation accumulates tiny
        // error that scales with magnitude, so an absolute epsilon is too strict.
        const tolerance = Math.max(1e-6, Math.abs(value) * 1e-9);
        expect(Math.abs(m - value)).toBeLessThanOrEqual(tolerance);
      }),
    );
  });

  it('parse then re-export keeps the same row and column count', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.integer({ min: 0, max: 9999 }),
            fc.constantFrom('alpha', 'beta', 'gamma', 'delta'),
          ),
          { minLength: 1, maxLength: 80 },
        ),
        (rows) => {
          const lines = ['num,word'];
          for (const [n, w] of rows) lines.push(`${n},${w}`);
          const raw = rawFromCsv('rt.csv', lines.join('\n'));
          const reparsed = rawFromCsv('rt2.csv', toCsv(raw));
          expect(reparsed.rows.length).toBe(raw.rows.length);
          expect(reparsed.headers.length).toBe(raw.headers.length);
        },
      ),
    );
  });
});
