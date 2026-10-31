import { describe, expect, it } from 'vitest';
import { duplicatesRule } from '@/lib/insights/rules/duplicates';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('duplicatesRule', () => {
  it('triggers when exact duplicate rows exist', () => {
    const d = analyzeDataset(rawFromCsv('d.csv', 'a,b\n1,2\n1,2\n3,4'));
    expect(duplicatesRule(d)).toHaveLength(1);
  });

  it('does not trigger when all rows are unique', () => {
    const d = analyzeDataset(rawFromCsv('u.csv', 'a,b\n1,2\n3,4\n5,6'));
    expect(duplicatesRule(d)).toHaveLength(0);
  });
});
