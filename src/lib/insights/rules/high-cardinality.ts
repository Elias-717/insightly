import type { InsightRule } from '../types';

/** Flags text columns with very high cardinality that are hard to analyze. */
export const highCardinalityRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.type === 'text' && c.uniquePct > 50 && c.uniquePct < 95 && c.totalCount > 20)
    .map((c) => ({
      id: `cardinality-${c.name}`,
      severity: 'Info' as const,
      title: `'${c.name}' has high cardinality (${c.uniquePct.toFixed(0)}% unique values).`,
      explanation:
        'Free-text columns with many distinct values are hard to summarize. Consider grouping or extracting features before analysis.',
      importance: 30,
      columnName: c.name,
    }));
