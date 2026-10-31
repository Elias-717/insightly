import type { CellValue, RawDataset } from '@/types';
import { isMissing } from './clean-value';
import { dedupeRows } from './duplicates';

/** Remove exact duplicate rows, returning a new RawDataset. */
export function removeDuplicateRows(raw: RawDataset): RawDataset {
  return { ...raw, rows: dedupeRows(raw.rows) };
}

/** Drop columns whose missing percentage exceeds the threshold (default 50%). */
export function dropEmptyColumns(raw: RawDataset, threshold = 0.5): RawDataset {
  const keepIndices: number[] = [];
  const totalRows = raw.rows.length || 1;
  raw.headers.forEach((_, index) => {
    const missing = raw.rows.filter((row) => isMissing(row[index] ?? null)).length;
    if (missing / totalRows <= threshold) {
      keepIndices.push(index);
    }
  });
  return {
    ...raw,
    headers: keepIndices.map((i) => raw.headers[i]),
    rows: raw.rows.map((row) => keepIndices.map((i) => row[i] ?? null)),
  };
}

/** Trim leading/trailing whitespace from every cell. */
export function trimWhitespace(raw: RawDataset): RawDataset {
  return {
    ...raw,
    rows: raw.rows.map((row) => row.map((cell) => (cell === null ? null : cell.trim()))),
  };
}

export type CasingMode = 'lower' | 'upper' | 'title';

function applyCasing(value: string, mode: CasingMode): string {
  switch (mode) {
    case 'lower':
      return value.toLowerCase();
    case 'upper':
      return value.toUpperCase();
    case 'title':
      return value
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return value;
  }
}

/** Standardize the casing of a single column (by index). */
export function standardizeCasing(
  raw: RawDataset,
  columnIndex: number,
  mode: CasingMode,
): RawDataset {
  return {
    ...raw,
    rows: raw.rows.map((row) =>
      row.map((cell, i) => (i === columnIndex && cell !== null ? applyCasing(cell, mode) : cell)),
    ),
  };
}

/**
 * Neutralize CSV formula injection: a cell beginning with =, +, -, or @ can be
 * interpreted as a formula by spreadsheet software. Prefixing a single quote
 * makes the cell render as literal text instead of executing.
 */
function neutralizeFormula(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

/** Serialize a RawDataset back to CSV text. */
export function toCsv(raw: RawDataset, delimiter = ','): string {
  const escape = (value: CellValue): string => {
    if (value === null) return '';
    const safe = neutralizeFormula(value);
    if (safe.includes(delimiter) || safe.includes('"') || safe.includes('\n')) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };
  const lines = [raw.headers.map((h) => escape(h)).join(delimiter)];
  for (const row of raw.rows) {
    lines.push(row.map(escape).join(delimiter));
  }
  return lines.join('\n');
}
