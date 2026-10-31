import type { Delimiter } from '@/types';

const CANDIDATES: Delimiter[] = [',', ';', '\t', '|'];

/**
 * Detect the most likely delimiter by sampling the first few lines and
 * choosing the candidate that yields the most consistent, highest column count.
 */
export function detectDelimiter(sample: string): Delimiter {
  const lines = sample
    .split(/\r\n|\r|\n/)
    .filter((l) => l.trim().length > 0)
    .slice(0, 10);

  if (lines.length === 0) return ',';

  let best: Delimiter = ',';
  let bestScore = -1;

  for (const delim of CANDIDATES) {
    const counts = lines.map((line) => countOutsideQuotes(line, delim));
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg === 0) continue;
    // Consistency: penalize variance in column counts across lines.
    const variance =
      counts.reduce((acc, c) => acc + (c - avg) ** 2, 0) / counts.length;
    const score = avg - variance;
    if (score > bestScore) {
      bestScore = score;
      best = delim;
    }
  }
  return best;
}

/** Count delimiter occurrences that are not inside double quotes. */
function countOutsideQuotes(line: string, delim: string): number {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delim && !inQuotes) {
      count += 1;
    }
  }
  return count;
}
