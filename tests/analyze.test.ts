import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { countDuplicateRows, dedupeRows } from '@/lib/analysis/duplicates';
import { rawFromCsv } from './helpers';

const messy = `id,customer,value,status
1,Alice,100,Active
2,bob,,active
3,Alice,100,Active
4,,300,Inactive
1,Alice,100,Active`;

describe('duplicate detection', () => {
  it('counts exact duplicate rows', () => {
    const raw = rawFromCsv('messy.csv', messy);
    // Rows 1 and 5 are identical -> 1 duplicate.
    expect(countDuplicateRows(raw.rows)).toBe(1);
  });
  it('removes duplicates keeping first occurrence', () => {
    const raw = rawFromCsv('messy.csv', messy);
    const deduped = dedupeRows(raw.rows);
    expect(deduped.length).toBe(raw.rows.length - 1);
  });
});

describe('analyzeDataset', () => {
  const dataset = analyzeDataset(rawFromCsv('messy.csv', messy));

  it('counts rows and columns', () => {
    expect(dataset.overview.rows).toBe(5);
    expect(dataset.overview.columns).toBe(4);
  });

  it('counts missing cells', () => {
    // one missing value + one missing customer = 2
    expect(dataset.overview.missingCells).toBe(2);
  });

  it('reports duplicate rows in the overview', () => {
    expect(dataset.overview.duplicateRows).toBe(1);
  });

  it('produces a quality score between 0 and 100 with a grade', () => {
    expect(dataset.quality.score).toBeGreaterThanOrEqual(0);
    expect(dataset.quality.score).toBeLessThanOrEqual(100);
    expect(dataset.quality.grade).toMatch(/[A-F]/);
  });

  it('applies type overrides', () => {
    const overridden = analyzeDataset(rawFromCsv('messy.csv', messy), { value: 'text' });
    const col = overridden.columns.find((c) => c.name === 'value');
    expect(col?.type).toBe('text');
  });
});
