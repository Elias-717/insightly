'use client';

import type { Dataset } from '@/types';
import { ChartFrame } from './ChartFrame';
import { correlationColor, correlationTextColor } from './palette';

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
      summary={`Pearson correlation across ${columns.length} numeric columns. Strongest relationship: ${strongest.a} and ${strongest.b} at r = ${strongest.v.toFixed(2)}. Orange is positive, blue is negative; stronger color means stronger correlation.`}
    >
      <div className="overflow-x-auto scroll-thin">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-1" />
              {columns.map((c) => (
                <th
                  key={c}
                  className="max-w-[60px] truncate p-1 text-left font-mono font-medium"
                  title={c}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowName) => (
              <tr key={rowName}>
                <th
                  className="max-w-[80px] truncate p-1 text-right font-mono font-medium"
                  title={rowName}
                >
                  {rowName}
                </th>
                {columns.map((colName) => {
                  const v = lookup[`${rowName}__${colName}`] ?? 0;
                  return (
                    <td
                      key={colName}
                      className="tabular h-10 w-10 min-w-[40px] border border-border text-center font-mono text-[10px]"
                      style={{ backgroundColor: correlationColor(v), color: correlationTextColor(v) }}
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
      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: correlationColor(-1) }} />{' '}
          −1
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-border" style={{ background: correlationColor(0) }} />{' '}
          0
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: correlationColor(1) }} />{' '}
          +1
        </span>
      </div>
    </ChartFrame>
  );
}
