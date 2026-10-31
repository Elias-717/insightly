import type { InsightRule } from '../types';
import { columnValues } from '@/lib/analysis/analyze';
import { isMissing } from '@/lib/analysis/clean-value';

/** Flags category columns where values differ only by casing (e.g. "Active" vs "active"). */
export const inconsistentCasingRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.type === 'category' || c.type === 'text')
    .flatMap((c) => {
      const values = columnValues(dataset.raw, c.index).filter(
        (v): v is string => !isMissing(v),
      );
      const byLower = new Map<string, Set<string>>();
      for (const v of values) {
        const key = v.trim().toLowerCase();
        if (!byLower.has(key)) byLower.set(key, new Set());
        byLower.get(key)!.add(v.trim());
      }
      const conflicts = [...byLower.entries()].filter(([, variants]) => variants.size > 1);
      if (conflicts.length === 0) return [];
      const example = conflicts[0][1];
      const [a, b] = [...example];
      return [
        {
          id: `casing-${c.name}`,
          severity: 'Warning' as const,
          title: `'${c.name}' has inconsistent casing ('${a}' vs '${b}').`,
          explanation: `${conflicts.length} value group(s) differ only by letter case. Standardize the casing so these are treated as the same category.`,
          importance: 48,
          columnName: c.name,
        },
      ];
    });
