'use client';

import { useState } from 'react';
import { Info, Minus } from 'lucide-react';
import type { Dataset, QualityComponent, QualityScore } from '@/types';
import {
  qualityVerdict,
  topQualityReasons,
  type SummarySeverity,
} from '@/lib/overview/summary';

/** Ring stroke color (indicator) by grade: A/B good, C warning, D orange, F error. */
function gradeRing(grade: string): string {
  switch (grade) {
    case 'A':
    case 'B':
      return 'text-success';
    case 'C':
      return 'text-warning';
    case 'D':
      return 'text-orange';
    default:
      return 'text-danger';
  }
}

/** AA-contrast text color by grade for the small grade label. */
function gradeText(grade: string): string {
  switch (grade) {
    case 'A':
    case 'B':
      return 'text-success-text';
    case 'C':
      return 'text-warning-text';
    case 'D':
      return 'text-orange';
    default:
      return 'text-danger-text';
  }
}

const REASON_LABEL: Record<QualityComponent['key'], string> = {
  completeness: 'Missing values',
  uniqueness: 'Duplicate rows',
  consistency: 'Mixed content',
  outliers: 'Outliers',
};

/** Grade-colored ring showing the data quality score, verdict, and top reasons. */
export function QualityGauge({
  quality,
  dataset,
  severity,
}: {
  quality: QualityScore;
  dataset?: Dataset;
  /** Headline severity, so the verdict agrees with the Overview summary. */
  severity?: SummarySeverity;
}) {
  const [open, setOpen] = useState(false);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const score = Math.round(quality.score);
  const dash = (score / 100) * circumference;
  const ringColor = gradeRing(quality.grade);
  const textColor = gradeText(quality.grade);
  const reasons = dataset ? topQualityReasons(dataset, 3) : [];

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        role="img"
        aria-label={`Data quality score ${score} out of 100, grade ${quality.grade}`}
      >
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="10" className="stroke-border" />
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 66 66)"
            className={`${ringColor} stroke-current motion-safe:transition-all motion-safe:duration-150`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-value text-3xl font-semibold tabular">{score}</span>
          <span className={`text-sm font-semibold ${textColor}`}>Grade {quality.grade}</span>
        </div>
      </div>

      {dataset && (
        <p className="mt-2 text-center text-sm text-fg-secondary">{qualityVerdict(score, severity)}</p>
      )}

      {reasons.length > 0 && (
        <ul className="mt-3 w-full space-y-1.5">
          {reasons.map((r) => (
            <li key={r.key} className="flex items-start gap-2 text-xs">
              <Minus size={13} className="mt-0.5 shrink-0 text-danger-text" aria-hidden="true" />
              <span className="min-w-0">
                <span className="font-medium">{REASON_LABEL[r.key]}</span>
                <span className="tabular text-muted"> · −{r.pointsLost} pts</span>
                <span className="block text-muted">{r.label}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Info size={13} aria-hidden="true" />
        How is this calculated?
      </button>

      {open && (
        <div className="animate-scale-in mt-3 w-full max-w-xs rounded-card border border-border bg-surface p-4 text-left text-sm shadow-popover">
          <p className="mb-2 font-medium">Score components</p>
          <ul className="space-y-2">
            {quality.components.map((c) => (
              <li key={c.key}>
                <div className="flex justify-between font-medium">
                  <span>{c.label}</span>
                  <span className="tabular text-muted">
                    {c.score}/100 · {(c.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted">{c.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
