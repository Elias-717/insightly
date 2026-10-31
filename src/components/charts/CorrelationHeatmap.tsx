'use client';

import type { Dataset } from '@/types';
import { ChartFrame } from './ChartFrame';

/** Map a correlation value in [-1, 1] to a diverging violet↔teal color. */
function colorFor(value: number): string {
  // Negative -> violet, positive -> teal, 0 -> light gray.
  const intensity = Math.abs(value);
  if (value >= 0) {
    return `rgba(20, 184, 166, ${0.15 + intensity * 0.75})`;
  }
  return `rgba(124, 58, 237, ${0.15 + intensity * 0.75})`;
}

export function CorrelationHeatmap({ dataset }: { dataset: Dataset }) {
  const { columns, lookup } = dataset.correlation;
  if (columns.length < 2) return null;

  // Find the strongest off-diagonal pair for the summary.
  let strongest = { a: '', b: '', v: 0 };
  for (const a of columns) {
    for (const b of columns) {
      if (a === b) continue;
      const v = lookup[`${a}__${b}`] ?? 0;
      if (Math.abs(v) > Math.abs(strongest.v)) strongest = { a, b, v };
    }
  }

  return (
    <ChartFrame
      id="chart-correlation"
      title="Correlation heatmap"
      summary={`Pearson correlation across ${columns.length} numeric columns. Strongest relationship: ${strongest.a} and ${strongest.b} at r = ${strongest.v.toFixed(2)}. Teal is positive, violet is negative.`}
    >
      <div className="overflow-x-auto scroll-thin">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-1" />
              {columns.map((c) => (
                <th key={c} className="max-w-[60px] truncate p-1 text-left font-medium" title={c}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowName) => (
              <tr key={rowName}>
                <th className="max-w-[80px] truncate p-1 text-right font-medium" title={rowName}>
                  {rowName}
                </th>
                {columns.map((colName) => {
                  const v = lookup[`${rowName}__${colName}`] ?? 0;
                  return (
                    <td
                      key={colName}
                      className="h-10 w-10 min-w-[40px] text-center font-mono text-[10px] text-slate-700 dark:text-slate-200"
                      style={{ backgroundColor: colorFor(v) }}
                      title={`${rowName} × ${colName}: r = ${v.toFixed(2)}`}
                    >
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: colorFor(-1) }} /> −1
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: colorFor(0) }} /> 0
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: colorFor(1) }} /> +1
        </span>
      </div>
    </ChartFrame>
  );
}
