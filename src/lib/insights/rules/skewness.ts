import type { InsightRule } from '../types';

/** Flags highly skewed numeric distributions. */
export const skewnessRule: InsightRule = (dataset) =>
  dataset.columns
    .filter((c) => c.numeric && Math.abs(c.numeric.skewness) >= 1 && c.numeric.count >= 10)
    .map((c) => {
      const skew = c.numeric!.skewness;
      const direction = skew > 0 ? 'right' : 'left';
      return {
        id: `skew-${c.name}`,
        severity: 'Info' as const,
        title: `'${c.name}' is ${direction}-skewed (skewness = ${skew.toFixed(2)}).`,
        explanation: `The distribution leans to the ${direction}. The mean (${c.numeric!.mean.toFixed(
          1,
        )}) differs from the median (${c.numeric!.median.toFixed(
          1,
        )}); consider a log transform for modeling.`,
        importance: 42,
        columnName: c.name,
      };
    });
