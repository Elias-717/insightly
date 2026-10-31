import { describe, expect, it } from 'vitest';
import {
  dropEmptyColumns,
  removeDuplicateRows,
  standardizeCasing,
  toCsv,
  trimWhitespace,
} from '@/lib/analysis/cleaning';
import { rawFromCsv } from './helpers';

describe('cleaning actions', () => {
  const raw = rawFromCsv(
    'messy.csv',
    `id,customer,value,status
1,Alice,100,Active
2,bob,,active
3,Alice,100,Active
1,Alice,100,Active`,
  );

  it('removes duplicate rows', () => {
    const cleaned = removeDuplicateRows(raw);
    expect(cleaned.rows.length).toBe(3);
  });

  it('drops columns over the empty threshold', () => {
    const sparse = rawFromCsv('sparse.csv', 'a,b\n1,\n2,\n3,');
    const cleaned = dropEmptyColumns(sparse, 0.5);
    expect(cleaned.headers).toEqual(['a']);
  });

  it('trims whitespace from cells', () => {
    const padded = rawFromCsv('pad.csv', 'a\n"  hi  "');
    const cleaned = trimWhitespace(padded);
    expect(cleaned.rows[0][0]).toBe('hi');
  });

  it('standardizes casing to title case', () => {
    const idx = raw.headers.indexOf('status');
    const cleaned = standardizeCasing(raw, idx, 'title');
    const values = cleaned.rows.map((r) => r[idx]);
    expect(values).toContain('Active');
    expect(values).not.toContain('active');
  });

  it('serializes back to CSV with quoting', () => {
    const csv = toCsv(rawFromCsv('q.csv', 'a,b\n"x,y",z'));
    expect(csv).toContain('"x,y"');
  });
});
