import type { CellValue } from '@/types';

/** Serialize a row to a stable key for exact-duplicate comparison. */
export function rowKey(row: CellValue[]): string {
  return row.map((c) => (c === null ? '\u0000' : c)).join('\u0001');
}

/** Count exact duplicate rows (every occurrence after the first counts). */
export function countDuplicateRows(rows: CellValue[][]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  for (const row of rows) {
    const key = rowKey(row);
    if (seen.has(key)) {
      duplicates += 1;
    } else {
      seen.add(key);
    }
  }
  return duplicates;
}

/** Return a new row array with exact duplicates removed (keeps first seen). */
export function dedupeRows(rows: CellValue[][]): CellValue[][] {
  const seen = new Set<string>();
  const out: CellValue[][] = [];
  for (const row of rows) {
    const key = rowKey(row);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(row);
    }
  }
  return out;
}
