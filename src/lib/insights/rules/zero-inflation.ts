import type { InsightRule } from '../types';

/** Flags numeric columns that are mostly zeros. */
export const zeroInflationRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.numeric && c.numeric.count > 0 && c.numeric.zeros / c.numeric.count >= 0.4)
    .map((c) => {
      const pct = (c.numeric!.zeros / c.numeric!.count) * 100;
      return {
        id: `zeros-${c.name}`,
        severity: 'Info' as const,
        title: `'${c.name}' is ${pct.toFixed(0)}% zeros.`,
        explanation:
          'A high share of zeros can indicate a sparse feature or a missing-value placeholder. Verify whether zeros are meaningful.',
        importance: 34,
        columnName: c.name,
      };
    });
