import type { CellValue, Delimiter, RawDataset } from '@/types';
import { detectDelimiter } from '@/lib/analysis/delimiter';

/**
 * Minimal CSV -> RawDataset builder for tests (no worker). Handles basic
 * quoting; sufficient for the fixtures used in the suite.
 */
export function rawFromCsv(fileName: string, text: string): RawDataset {
  const delimiter = detectDelimiter(text.slice(0, 2000)) as Delimiter;
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.length > 0);
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };

  const headers = lines.length > 0 ? parseLine(lines[0]).map((h) => h.trim()) : [];
  const rows: CellValue[][] = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    return headers.map((_, i) => {
      const v = cells[i];
      return v === undefined || v === '' ? null : v;
    });
  });

  return {
    fileName,
    delimiter,
    headers,
    rows,
    skippedRows: 0,
    byteSize: new Blob([text]).size,
  };
}
