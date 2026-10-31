import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/analysis/cleaning';
import { rawFromCsv } from '../helpers';

describe('CSV export (toCsv)', () => {
  it('round-trips a simple dataset preserving header and row count', () => {
    const raw = rawFromCsv('t.csv', 'a,b,c\n1,2,3\n4,5,6');
    const csv = toCsv(raw);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('a,b,c');
    expect(lines).toHaveLength(3);
  });

  it('quotes fields containing the delimiter', () => {
    const raw = rawFromCsv('q.csv', 'a,b\n"x,y",z');
    expect(toCsv(raw)).toContain('"x,y"');
  });

  it('quotes and escapes embedded double quotes', () => {
    const raw = rawFromCsv('q.csv', 'a\n"he said ""hi"""');
    expect(toCsv(raw)).toContain('"he said ""hi"""');
  });

  it('quotes fields containing newlines', () => {
    // Build the dataset directly: the naive CSV test helper cannot represent a
    // newline inside a quoted field, but toCsv must still quote it on output.
    const raw = {
      fileName: 'q.csv',
      delimiter: ',' as const,
      headers: ['a'],
      rows: [['line1\nline2']],
      skippedRows: 0,
      byteSize: 0,
    };
    expect(toCsv(raw)).toContain('"line1\nline2"');
  });

  it('renders missing cells as empty strings', () => {
    const raw = rawFromCsv('m.csv', 'a,b\n1,\n,2');
    const csv = toCsv(raw);
    expect(csv).toContain('1,');
    expect(csv).toContain(',2');
  });

  describe('formula-injection protection', () => {
    it.each(['=cmd', '+1+2', '-5+6', '@SUM(A1)'])(
      'prefixes a quote to a cell starting with a formula trigger: %s',
      (value) => {
        const raw = rawFromCsv('f.csv', `a\n"${value}"`);
        const csv = toCsv(raw);
        const dataLine = csv.split('\n')[1];
        expect(dataLine.startsWith("'") || dataLine.startsWith('"\'')).toBe(true);
        expect(csv).toContain(`'${value}`);
      },
    );

    it('does not alter safe values', () => {
      const raw = rawFromCsv('s.csv', 'a\nhello\n123');
      const csv = toCsv(raw);
      expect(csv).toContain('hello');
      expect(csv).not.toContain("'hello");
    });
  });
});
