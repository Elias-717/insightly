import type { InsightRule } from '../types';

/** Flags columns with only one unique value (no information). */
export const constantColumnRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.uniqueCount === 1 && c.totalCount > 0)
    .map((c) => ({
      id: `constant-${c.name}`,
      severity: 'Info' as const,
      title: `Column '${c.name}' has a single constant value and carries no information.`,
      explanation:
        'Every row shares the same value. This column can safely be dropped from analysis and modeling.',
      importance: 38,
      columnName: c.name,
    }));
