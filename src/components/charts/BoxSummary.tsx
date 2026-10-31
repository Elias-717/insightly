'use client';

import type { ColumnProfile } from '@/types';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_MUTED } from './palette';
import { formatNumber } from '@/lib/utils';

/** A compact box-plot style summary rendered with SVG. */
export function BoxSummary({ column }: { column: ColumnProfile }) {
  const n = column.numeric;
  if (!n || n.count === 0) return null;

  const range = n.max - n.min || 1;
  const scale = (v: number) => ((v - n.min) / range) * 100;

  return (
    <ChartFrame
      id={`chart-box-${column.name}`}
      title={`Spread of ${column.name}`}
      summary={`Box summary for ${column.name}: min ${formatNumber(n.min)}, Q1 ${formatNumber(n.q1)}, median ${formatNumber(n.median)}, Q3 ${formatNumber(n.q3)}, max ${formatNumber(n.max)}. ${n.outlierCount} outlier(s) by the IQR rule.`}
    >
      <div className="px-2 py-6">
        <svg width="100%" height="80" viewBox="0 0 100 40" preserveAspectRatio="none">
          {/* whisker line */}
          <line x1={scale(n.min)} y1="20" x2={scale(n.max)} y2="20" stroke={CHART_MUTED} strokeWidth="0.5" />
          {/* box */}
          <rect
            x={scale(n.q1)}
            y="10"
            width={Math.max(0.5, scale(n.q3) - scale(n.q1))}
            height="20"
            fill="rgba(79, 70, 229, 0.2)"
            stroke={CHART_ACCENT}
            strokeWidth="0.5"
          />
          {/* median */}
          <line x1={scale(n.median)} y1="10" x2={scale(n.median)} y2="30" stroke={CHART_ACCENT} strokeWidth="1.2" />
          {/* caps */}
          <line x1={scale(n.min)} y1="14" x2={scale(n.min)} y2="26" stroke={CHART_MUTED} strokeWidth="0.5" />
          <line x1={scale(n.max)} y1="14" x2={scale(n.max)} y2="26" stroke={CHART_MUTED} strokeWidth="0.5" />
        </svg>
        <div className="tabular mt-2 grid grid-cols-5 gap-2 text-center text-xs text-muted">
          <div>Min<br /><span className="font-mono font-semibold text-fg">{formatNumber(n.min)}</span></div>
          <div>Q1<br /><span className="font-mono font-semibold text-fg">{formatNumber(n.q1)}</span></div>
          <div>Median<br /><span className="font-mono font-semibold text-fg">{formatNumber(n.median)}</span></div>
          <div>Q3<br /><span className="font-mono font-semibold text-fg">{formatNumber(n.q3)}</span></div>
          <div>Max<br /><span className="font-mono font-semibold text-fg">{formatNumber(n.max)}</span></div>
        </div>
      </div>
    </ChartFrame>
  );
}
