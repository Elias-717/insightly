'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { QualityScore } from '@/types';

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

/** Grade-colored ring showing the data quality score, with a how-it's-calculated popover. */
export function QualityGauge({ quality }: { quality: QualityScore }) {
  const [open, setOpen] = useState(false);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (quality.score / 100) * circumference;
  const ringColor = gradeRing(quality.grade);
  const textColor = gradeText(quality.grade);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative"
        role="img"
        aria-label={`Data quality score ${quality.score} out of 100, grade ${quality.grade}`}
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
          <span className="stat-value text-3xl font-semibold tabular">{quality.score}</span>
          <span className={`text-sm font-semibold ${textColor}`}>Grade {quality.grade}</span>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
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
