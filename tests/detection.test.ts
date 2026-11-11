import { describe, expect, it } from 'vitest';
import { detectColumnType } from '@/lib/analysis/detect-type';
import { detectDelimiter } from '@/lib/analysis/delimiter';
import { parseBoolean, parseDate, parseNumber } from '@/lib/analysis/clean-value';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { getSample } from '@/data/samples';
import { rawFromCsv } from './helpers';

describe('delimiter detection', () => {
  it('detects commas', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
  });
  it('detects semicolons', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
  });
  it('detects tabs', () => {
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
  });
  it('detects pipes', () => {
    expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|');
  });
});

describe('value parsing', () => {
  it('parses currency and thousands separators as numbers', () => {
    expect(parseNumber('$1,234.50')).toBeCloseTo(1234.5);
    expect(parseNumber('1 234,50')).toBeCloseTo(1234.5);
    expect(parseNumber('45%')).toBe(45);
  });
  it('rejects non-numeric text', () => {
    expect(parseNumber('hello')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });
  it('parses ISO, slash, and named dates', () => {
    expect(parseDate('2024-01-05')).not.toBeNull();
    expect(parseDate('05/13/2024')).not.toBeNull(); // 13 > 12 -> MM/DD invalid, DD/MM
    expect(parseDate('Jan 5, 2024')).not.toBeNull();
    expect(parseDate('not a date')).toBeNull();
  });
  it('parses boolean tokens', () => {
    expect(parseBoolean('yes')).toBe(true);
    expect(parseBoolean('no')).toBe(false);
    expect(parseBoolean('1')).toBe(true);
    expect(parseBoolean('maybe')).toBeNull();
  });
});

describe('column type detection', () => {
  it('detects integers and numbers', () => {
    expect(detectColumnType(['1', '2', '3', '4', '5']).type).toBe('integer');
    expect(detectColumnType(['1.5', '2.5', '3.5']).type).toBe('number');
  });
  it('detects booleans', () => {
    expect(detectColumnType(['true', 'false', 'true']).type).toBe('boolean');
    expect(detectColumnType(['yes', 'no', 'yes']).type).toBe('boolean');
  });
  it('detects dates', () => {
    expect(detectColumnType(['2024-01-01', '2024-02-01', '2024-03-01']).type).toBe('date');
  });
  it('detects categories with few unique values', () => {
    const values = Array.from({ length: 50 }, (_, i) => (i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'));
    expect(detectColumnType(values).type).toBe('category');
  });
  it('detects identifiers that are almost fully unique', () => {
    const values = Array.from({ length: 50 }, (_, i) => `user_${i}`);
    expect(detectColumnType(values).type).toBe('identifier');
  });
  it('treats a highly unique integer index as an identifier', () => {
    const values = Array.from({ length: 50 }, (_, i) => String(1000 + i));
    expect(detectColumnType(values).type).toBe('identifier');
  });
  it('keeps a unique but unordered integer measure (like scores) as integer', () => {
    // Every value is distinct, but they are neither consecutive nor increasing.
    const scores = ['92', '84', '71', '95', '48', '88', '91', '61', '83', '74', '98', '39'];
    expect(detectColumnType(scores, 'score').type).toBe('integer');
  });
  it('treats unique integers as an identifier when the name says so', () => {
    const ids = ['8812', '1093', '5520', '7341', '2208', '9977', '3150', '6604', '4419', '1287', '5032', '7765'];
    expect(detectColumnType(ids, 'customer_id').type).toBe('identifier');
    expect(detectColumnType(ids, 'customerId').type).toBe('identifier');
    expect(detectColumnType(ids, 'SKU').type).toBe('identifier');
    expect(detectColumnType(ids, 'amount').type).toBe('integer');
  });
  it('treats strictly increasing integers with gaps as an identifier', () => {
    const orders = Array.from({ length: 15 }, (_, i) => String(5000 + i * 7));
    expect(detectColumnType(orders, 'order').type).toBe('identifier');
  });
  it('does not mistake words ending in "id" for identifier names', () => {
    const amounts = ['120', '75', '310', '42', '99', '260', '18', '150', '88', '205', '61', '133'];
    expect(detectColumnType(amounts, 'paid').type).toBe('integer');
    expect(detectColumnType(amounts, 'valid').type).toBe('integer');
  });
  it('falls back to text for free-form strings', () => {
    const values = Array.from({ length: 50 }, (_, i) => `a rather long sentence number ${i} here`);
    expect(['text', 'identifier']).toContain(detectColumnType(values).type);
  });
});

describe('identifier detection on the bundled samples', () => {
  it('profiles grades.score as a number and student_id as an identifier', () => {
    const sample = getSample('grades');
    const d = analyzeDataset(rawFromCsv(sample.fileName, sample.csv));
    const type = (name: string) => d.columns.find((c) => c.name === name)?.type;
    expect(type('score')).toBe('integer');
    expect(type('student_id')).toBe('identifier');
  });
});
