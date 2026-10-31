import type { RawDataset } from '@/types';
import { toCsv } from '@/lib/analysis/cleaning';

/** Trigger a browser download of a RawDataset as CSV. */
export function downloadCsv(raw: RawDataset, fileName = 'cleaned.csv'): void {
  const csv = toCsv(raw);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, fileName);
}

/** Generic blob download helper used across export modules. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Download arbitrary text as a file. */
export function downloadText(text: string, fileName: string, mime = 'text/plain'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8;` });
  triggerDownload(blob, fileName);
}
