import { describe, expect, it } from 'vitest';
import { missingValuesRule } from '@/lib/insights/rules/missing-values';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../../helpers';

describe('missingValuesRule', () => {
  it('triggers for a column with >= 5% missing', () => {
    const d = analyzeDataset(rawFromCsv('m.csv', 'a,b\n1,\n2,\n3,\n4,5\n6,7'));
    expect(missingValuesRule(d).some((i) => i.columnName === 'b')).toBe(true);
  });

  it('does not trigger for a fully complete dataset', () => {
    const d = analyzeDataset(rawFromCsv('c.csv', 'a,b\n1,2\n3,4\n5,6'));
    expect(missingValuesRule(d)).toHaveLength(0);
  });
});
