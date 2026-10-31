import type { InsightRule } from '../types';

/** A headline insight summarizing the overall data quality score. */
export const qualitySummaryRule: InsightRule = (dataset) => {
  const { score, grade } = dataset.quality;
  const severity = score >= 80 ? 'Info' : score >= 60 ? 'Warning' : 'Warning';
  const verdict =
    score >= 80 ? 'in good shape' : score >= 60 ? 'usable but needs cleaning' : 'needs significant cleaning';
  return [
    {
      id: 'quality-summary',
      severity,
      title: `Overall data quality is ${score.toFixed(0)}/100 (grade ${grade}) — ${verdict}.`,
      explanation:
        'This headline score blends completeness, uniqueness, consistency, and outlier control. Open the gauge for a full breakdown.',
      importance: 70,
    },
  ];
};
