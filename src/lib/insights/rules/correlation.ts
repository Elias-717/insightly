import type { InsightRule } from '../types';

/** Flags strong Pearson correlations between distinct numeric columns. */
export const correlationRule: InsightRule = (dataset) => {
  const seen = new Set<string>();
  const insights = [];
  for (const cell of dataset.correlation.cells) {
    if (cell.x === cell.y) continue;
    const key = [cell.x, cell.y].sort().join('__');
    if (seen.has(key)) continue;
    if (Math.abs(cell.value) >= 0.7) {
      seen.add(key);
      const direction = cell.value > 0 ? 'strongly correlated' : 'strongly inversely correlated';
      insights.push({
        id: `corr-${key}`,
        severity: 'Discovery' as const,
        title: `'${cell.x}' and '${cell.y}' are ${direction} (r = ${cell.value.toFixed(2)}).`,
        explanation: `A Pearson coefficient of ${cell.value.toFixed(
          2,
        )} suggests these two columns move together. This can indicate redundancy or a real relationship worth exploring.`,
        importance: 60 + Math.abs(cell.value) * 30,
        columnName: cell.x,
        target: 'chart-correlation',
      });
    }
  }
  return insights;
};
