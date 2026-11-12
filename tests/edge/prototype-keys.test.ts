import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { buildCorrelationMatrix } from '@/lib/analysis/correlation';
import { runInsights } from '@/lib/insights';
import type { RawDataset } from '@/types';

/**
 * Headers and values come from untrusted files. Names that match
 * Object.prototype members must be treated like any other column.
 */
const RISKY = ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf'];

function raw(headers: string[], rows: string[][]): RawDataset {
  return { fileName: 'risky.csv', delimiter: ',', headers, rows, skippedRows: 0, byteSize: 100 };
}

describe('column names that match Object.prototype members', () => {
  const rows = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '10'],
    ['11', '12', '13', '14', '16'],
    ['17', '19', '20', '25', '22'],
  ];

  it('detects real types for every column', () => {
    const dataset = analyzeDataset(raw(RISKY, rows));
    for (const column of dataset.columns) {
      expect(typeof column.type).toBe('string');
      expect(column.numeric).toBeDefined();
    }
    const total = Object.values(dataset.overview.typeCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(RISKY.length);
    expect(Object.keys(dataset.overview.typeCounts)).toHaveLength(7);
  });

  it('still applies a genuine override for such a column', () => {
    const overrides: Record<string, 'text'> = {};
    Object.defineProperty(overrides, 'constructor', { value: 'text', enumerable: true });
    const dataset = analyzeDataset(raw(RISKY, rows), overrides);
    expect(dataset.columns[0].type).toBe('text');
    expect(dataset.columns[1].type).not.toBe('text');
  });

  it('produces insights without crashing', () => {
    expect(() => runInsights(analyzeDataset(raw(RISKY, rows)))).not.toThrow();
  });

  it('keeps correlation lookups to real column pairs', () => {
    const matrix = buildCorrelationMatrix([
      { name: '', values: [1, 2, 3] },
      { name: 'proto__', values: [3, 2, 1] },
    ]);
    // '' + '__' + 'proto__' === '__proto__'
    expect(matrix.lookup['__proto__']).toBeCloseTo(-1);
    expect(matrix.lookup['constructor']).toBeUndefined();
  });
});
