'use client';

import { useState } from 'react';
import type { QualityScore } from '@/types';

/** Circular gauge showing the data quality score with a how-it's-calculated popover. */
export function QualityGauge({ quality }: { quality: QualityScore }) {
  const [open, setOpen] = useState(false);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (quality.score / 100) * circumference;

  const color =
    quality.score >= 80 ? '#14B8A6' : quality.score >= 60 ? '#F59E0B' : '#F43F5E';

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" role="img" aria-label={`Data quality score ${quality.score} out of 100, grade ${quality.grade}`}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            strokeWidth="12"
            className="stroke-slate-200 dark:stroke-slate-700"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            strokeWidth="12"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold">{quality.score}</span>
          <span className="text-sm font-semibold" style={{ color }}>
            Grade {quality.grade}
          </span>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-2 text-xs font-medium text-violet underline-offset-2 hover:underline"
      >
        How is this calculated?
      </button>

      {open && (
        <div className="animate-scale-in mt-3 w-full max-w-xs rounded-xl border border-slate-200 bg-white p-4 text-left text-sm shadow-soft dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-2 font-semibold">Score components</p>
          <ul className="space-y-2">
            {quality.components.map((c) => (
              <li key={c.key}>
                <div className="flex justify-between font-medium">
                  <span>{c.label}</span>
                  <span>
                    {c.score}/100 · {(c.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
