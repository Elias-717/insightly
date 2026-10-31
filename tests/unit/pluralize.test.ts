import { describe, expect, it } from 'vitest';
import { pluralize, countNoun } from '@/lib/utils';

describe('pluralize', () => {
  it('returns the singular for exactly 1', () => {
    expect(pluralize(1, 'row')).toBe('row');
  });

  it('returns the plural for 0 and for n > 1', () => {
    expect(pluralize(0, 'row')).toBe('rows');
    expect(pluralize(2, 'row')).toBe('rows');
    expect(pluralize(25, 'row')).toBe('rows');
  });

  it('uses the singular for -1 (absolute value)', () => {
    expect(pluralize(-1, 'row')).toBe('row');
  });

  it('honors an irregular plural', () => {
    expect(pluralize(1, 'entry', 'entries')).toBe('entry');
    expect(pluralize(3, 'entry', 'entries')).toBe('entries');
  });
});

describe('countNoun', () => {
  it('formats singular and plural counts', () => {
    expect(countNoun(1, 'malformed row')).toBe('1 malformed row');
    expect(countNoun(2, 'malformed row')).toBe('2 malformed rows');
  });

  it('adds thousands separators', () => {
    expect(countNoun(1500, 'cell')).toBe('1,500 cells');
  });

  it('supports irregular plurals', () => {
    expect(countNoun(3, 'entry', 'entries')).toBe('3 entries');
  });
});
