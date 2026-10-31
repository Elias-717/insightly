import type { InsightRule } from '../types';

/** Flags columns with a meaningful share of missing values. */
export const missingValuesRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.missingPct >= 5)
    .map((c) => {
      const severity = c.missingPct >= 30 ? 'Warning' : 'Info';
      return {
        id: `missing-${c.name}`,
        severity,
        title: `Column '${c.name}' has ${c.missingPct.toFixed(1)}% missing values.`,
        explanation: `${c.missingCount} of ${c.totalCount} cells are empty. Consider imputing or dropping this column before analysis.`,
        importance: Math.min(100, 40 + c.missingPct),
        columnName: c.name,
      };
    });
