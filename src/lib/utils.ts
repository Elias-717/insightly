/** Tiny className combiner (avoids a clsx dependency). */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Pluralize a noun based on a count. Returns just the noun (singular/plural);
 * pass `plural` when it is not formed by appending "s".
 *
 *   pluralize(1, 'row') -> 'row'
 *   pluralize(2, 'row') -> 'rows'
 *   pluralize(2, 'entry', 'entries') -> 'entries'
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return Math.abs(count) === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Format a count with its (pluralized) noun and thousands separators.
 *
 *   countNoun(1, 'malformed row') -> '1 malformed row'
 *   countNoun(2, 'malformed row') -> '2 malformed rows'
 *   countNoun(3, 'entry', 'entries') -> '3 entries'
 */
export function countNoun(count: number, singular: string, plural?: string): string {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
}

/** Format a byte count as a human-readable size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

/** Format a number compactly with thousands separators. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
