import type { InsightRule } from '../types';

/** Flags identifier columns that add little analytical value. */
export const identifierRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.type === 'identifier')
    .map((c) => ({
      id: `id-${c.name}`,
      severity: 'Info' as const,
      title: `Column '${c.name}' looks like a unique identifier and is not useful for analysis.`,
      explanation: `${c.uniquePct.toFixed(
        0,
      )}% of its values are unique, which is typical of an ID or key column. Exclude it from statistical analysis.`,
      importance: 35,
      columnName: c.name,
    }));
