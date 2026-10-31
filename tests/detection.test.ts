import { describe, expect, it } from 'vitest';
import { detectColumnType } from '@/lib/analysis/detect-type';
import { detectDelimiter } from '@/lib/analysis/delimiter';
import { parseBoolean, parseDate, parseNumber } from '@/lib/analysis/clean-value';

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
  it('falls back to text for free-form strings', () => {
    const values = Array.from({ length: 50 }, (_, i) => `a rather long sentence number ${i} here`);
    expect(['text', 'identifier']).toContain(detectColumnType(values).type);
  });
});
