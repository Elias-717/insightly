import type { InsightRule } from '../types';

/** Flags numeric columns with IQR outliers, highlighting the extreme value. */
export const outliersRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.numeric && c.numeric.outlierCount > 0)
    .map((c) => {
      const n = c.numeric!;
      const highest = Math.max(...n.outliers);
      const lowest = Math.min(...n.outliers);
      const extreme = Math.abs(highest - n.median) >= Math.abs(lowest - n.median) ? highest : lowest;
      return {
        id: `outlier-${c.name}`,
        severity: 'Warning' as const,
        title: `'${c.name}' has ${n.outlierCount} outlier${n.outlierCount > 1 ? 's' : ''}; the most extreme is ${format(extreme)}, far from the typical range.`,
        explanation: `Using the 1.5×IQR rule, ${n.outlierCount} value(s) fall outside the expected range (Q1=${format(
          n.q1,
        )}, Q3=${format(n.q3)}). Outliers can skew averages and models.`,
        importance: 55 + Math.min(20, n.outlierCount),
        columnName: c.name,
      };
    });

function format(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}
