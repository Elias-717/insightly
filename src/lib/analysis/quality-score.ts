import type { ColumnProfile, QualityComponent, QualityScore } from '@/types';

/** Transparent weights for each quality component (sum to 1). */
export const QUALITY_WEIGHTS = {
  completeness: 0.4,
  uniqueness: 0.2,
  consistency: 0.2,
  outliers: 0.2,
} as const;

export function letterGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Compute a 0-100 data quality score from four transparent components.
 * Each sub-score is 0-100; the final score is their weighted sum.
 */
export function computeQualityScore(
  columns: ColumnProfile[],
  totalRows: number,
  duplicateRows: number,
): QualityScore {
  // Completeness: 100 - overall missing percentage.
  const totalCells = columns.length * totalRows || 1;
  const missingCells = columns.reduce((acc, c) => acc + c.missingCount, 0);
  const completeness = Math.max(0, 100 - (missingCells / totalCells) * 100);

  // Uniqueness: penalize duplicate rows.
  const dupPct = totalRows === 0 ? 0 : (duplicateRows / totalRows) * 100;
  const uniqueness = Math.max(0, 100 - dupPct);

  // Consistency: fraction of columns whose detected type was unambiguous.
  // We treat "text" columns that are mostly numeric-looking as inconsistent;
  // approximated here by columns where detectedType differs from a clean type.
  const inconsistentColumns = columns.filter((c) => c.type === 'text' && c.uniquePct < 95).length;
  const consistency =
    columns.length === 0 ? 100 : Math.max(0, 100 - (inconsistentColumns / columns.length) * 60);

  // Outliers: average outlier rate across numeric columns.
  const numericCols = columns.filter((c) => c.numeric && c.numeric.count > 0);
  let outlierScore = 100;
  if (numericCols.length > 0) {
    const avgRate =
      numericCols.reduce(
        (acc, c) => acc + (c.numeric ? c.numeric.outlierCount / c.numeric.count : 0),
        0,
      ) / numericCols.length;
    outlierScore = Math.max(0, 100 - avgRate * 200);
  }

  const components: QualityComponent[] = [
    {
      key: 'completeness',
      label: 'Completeness',
      weight: QUALITY_WEIGHTS.completeness,
      score: round(completeness),
      detail: `${((missingCells / totalCells) * 100).toFixed(1)}% of cells are missing`,
    },
    {
      key: 'uniqueness',
      label: 'Uniqueness',
      weight: QUALITY_WEIGHTS.uniqueness,
      score: round(uniqueness),
      detail: `${dupPct.toFixed(1)}% of rows are exact duplicates`,
    },
    {
      key: 'consistency',
      label: 'Consistency',
      weight: QUALITY_WEIGHTS.consistency,
      score: round(consistency),
      detail: `${inconsistentColumns} column(s) have mixed or ambiguous content`,
    },
    {
      key: 'outliers',
      label: 'Outlier control',
      weight: QUALITY_WEIGHTS.outliers,
      score: round(outlierScore),
      detail:
        numericCols.length === 0
          ? 'No numeric columns to assess'
          : 'Based on IQR outlier rate across numeric columns',
    },
  ];

  const score = round(components.reduce((acc, c) => acc + c.score * c.weight, 0));

  return { score, grade: letterGrade(score), components };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
