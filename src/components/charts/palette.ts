/**
 * Chart color tokens for the green-bar theme.
 *
 * Recharts needs concrete color strings (it cannot consume CSS variables in
 * `fill`/`stroke`), so we resolve the accent from the CSS variable at runtime
 * when possible and fall back to the light-mode accent for SSR. This keeps the
 * single accent in one place (globals.css) while still feeding Recharts a hex.
 */

const ACCENT_FALLBACK = '#0B6B4C'; // --accent light mode (ledger green)

/** Read a CSS variable "R G B" triplet as a hex-ish rgb() string, with fallback. */
export function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  return `rgb(${raw.replace(/\s+/g, ' ')})`;
}

/** The single color for single-series charts (follows the current accent). */
export function chartAccent(): string {
  return cssVar('--accent', ACCENT_FALLBACK);
}

/** Static single-series accent for places that render before hydration. */
export const CHART_ACCENT = ACCENT_FALLBACK;

export const CHART_GRID = 'rgb(140 155 146 / 0.25)';
export const CHART_MUTED = 'rgb(89 102 94)';

/** Color-blind-safe categorical palette (at most 7 series). */
export const CHART_SERIES = [
  '#0B6B4C', // ledger green (accent)
  '#2563EB', // blue
  '#0E7490', // teal-blue
  '#D97706', // amber
  '#7C3AED', // violet
  '#DB2777', // pink
  '#64748B', // slate
];

/**
 * Diverging color for a correlation value in [-1, 1]:
 * blue (negative) -> white (0) -> orange (positive). Color-blind safe and does
 * not rely on red/green.
 */
export function correlationColor(value: number): string {
  const v = Math.max(-1, Math.min(1, value));
  // Endpoints: blue #2563EB (37,99,235), white (255,255,255), orange #EA580C (234,88,12).
  const white: [number, number, number] = [255, 255, 255];
  const blue: [number, number, number] = [37, 99, 235];
  const orange: [number, number, number] = [234, 88, 12];
  const target = v >= 0 ? orange : blue;
  const t = Math.abs(v);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  const r = mix(white[0], target[0]);
  const g = mix(white[1], target[1]);
  const b = mix(white[2], target[2]);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Readable text color for a correlation cell: dark near the white center,
 * white once the background is strong enough that dark text would fail AA.
 */
export function correlationTextColor(value: number): string {
  return Math.abs(value) >= 0.55 ? '#FFFFFF' : '#0F172A';
}
