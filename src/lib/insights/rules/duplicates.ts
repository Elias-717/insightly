import type { InsightRule } from '../types';

/** Flags exact duplicate rows in the dataset. */
export const duplicatesRule: InsightRule = (dataset) => {
  const { duplicateRows, duplicatePct } = dataset.overview;
  if (duplicateRows === 0) return [];
  return [
    {
      id: 'duplicates',
      severity: duplicatePct >= 5 ? 'Warning' : 'Info',
      title: `${duplicateRows} row${duplicateRows > 1 ? 's' : ''} (${duplicatePct.toFixed(1)}%) are exact duplicates.`,
      explanation:
        'Duplicate rows inflate counts and bias summary statistics. Use the cleaning tools to remove them.',
      importance: 50 + Math.min(20, duplicatePct),
    },
  ];
};
