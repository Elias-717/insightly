/**
 * Chart color tokens.
 * - CHART_ACCENT: the single color for single-series charts (matches the UI
 *   accent indigo).
 * - CHART_SERIES: an Okabe–Ito color-blind-safe palette for multi-series charts.
 * - heatmap colors use the accent hue for positive and a neutral slate for
 *   negative so the scale reads without relying on red/green.
 */
export const CHART_ACCENT = '#4F46E5';
export const CHART_GRID = 'rgb(203 213 225 / 0.5)';
export const CHART_MUTED = '#94A3B8';

export const CHART_SERIES = [
  '#4F46E5', // indigo (accent)
  '#E69F00', // orange
  '#009E73', // bluish green
  '#56B4E9', // sky blue
  '#CC79A7', // reddish purple
  '#D55E00', // vermillion
];

/** Diverging color for a correlation value in [-1, 1]. */
export function correlationColor(value: number): string {
  const intensity = Math.abs(value);
  // Positive -> accent indigo; negative -> slate. Avoids red/green confusion.
  if (value >= 0) {
    return `rgba(79, 70, 229, ${0.12 + intensity * 0.78})`;
  }
  return `rgba(100, 116, 139, ${0.12 + intensity * 0.78})`;
}
