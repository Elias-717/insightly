import type { InsightRule } from '../types';

/** Flags category columns dominated by a single value. */
export const dominantCategoryRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => (c.type === 'category' || c.type === 'boolean') && c.category)
    .flatMap((c) => {
      const top = c.category!.top[0];
      if (!top || top.percentage < 60) return [];
      return [
        {
          id: `dominant-${c.name}`,
          severity: 'Discovery' as const,
          title: `'${c.name}' is dominated by one value: '${top.value}' makes up ${top.percentage.toFixed(0)}% of rows.`,
          explanation: `When a single category accounts for most rows, the column carries little information and may bias models toward the majority class.`,
          importance: 45 + (top.percentage - 60) / 2,
          columnName: c.name,
        },
      ];
    });
