import type { CorrelationMatrix } from '@/types';
import { mean } from './stats';

/**
 * Pearson correlation between two equal-length numeric arrays.
 * Returns 0 when either series has zero variance.
 */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return 0;
  const r = num / denom;
  // Guard against tiny floating point overshoot past ±1.
  return Math.max(-1, Math.min(1, r));
}

/**
 * Build a correlation matrix across the provided numeric columns.
 * `series` maps column name -> aligned numeric values (pairwise rows only).
 */
export function buildCorrelationMatrix(
  columns: { name: string; values: (number | null)[] }[],
): CorrelationMatrix {
  const names = columns.map((c) => c.name);
  const cells: CorrelationMatrix['cells'] = [];
  // Null prototype: keys are built from column names in the file, so lookups
  // must never hit inherited members such as `constructor`.
  const lookup = Object.create(null) as Record<string, number>;

  for (let i = 0; i < columns.length; i += 1) {
    for (let j = 0; j < columns.length; j += 1) {
      const a = columns[i];
      const b = columns[j];
      let value: number;
      if (i === j) {
        value = 1;
      } else {
        // Pairwise-complete: only rows where both are present.
        const xs: number[] = [];
        const ys: number[] = [];
        const len = Math.min(a.values.length, b.values.length);
        for (let k = 0; k < len; k += 1) {
          const av = a.values[k];
          const bv = b.values[k];
          if (av !== null && bv !== null) {
            xs.push(av);
            ys.push(bv);
          }
        }
        value = pearson(xs, ys);
      }
      cells.push({ x: a.name, y: b.name, value });
      lookup[`${a.name}__${b.name}`] = value;
    }
  }

  return { columns: names, cells, lookup };
}
