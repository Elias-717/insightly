/// <reference lib="webworker" />
import Papa from 'papaparse';
import { detectDelimiter } from '@/lib/analysis/delimiter';
import type { CellValue, Delimiter, RawDataset } from '@/types';

export interface ParseRequest {
  type: 'parse';
  fileName: string;
  text: string;
  byteSize: number;
}

export interface ProgressMessage {
  type: 'progress';
  rows: number;
}

export interface DoneMessage {
  type: 'done';
  dataset: RawDataset;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type WorkerResponse = ProgressMessage | DoneMessage | ErrorMessage;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', (event: MessageEvent<ParseRequest>) => {
  const data = event.data;
  if (data.type !== 'parse') return;

  try {
    const sample = data.text.slice(0, 8192);
    const delimiter = detectDelimiter(sample) as Delimiter;

    const headers: string[] = [];
    const rows: CellValue[][] = [];
    let skippedRows = 0;
    let expectedCols = 0;
    let rowCount = 0;

    Papa.parse<string[]>(data.text, {
      delimiter,
      skipEmptyLines: 'greedy',
      step: (result) => {
        const row = result.data as string[];
        if (headers.length === 0) {
          for (const h of row) headers.push(h.trim());
          expectedCols = headers.length;
          return;
        }
        // Treat badly-shaped rows as skipped (but tolerate one extra/missing).
        if (Math.abs(row.length - expectedCols) > 1 && row.length !== 1) {
          skippedRows += 1;
          return;
        }
        const normalized: CellValue[] = [];
        for (let i = 0; i < expectedCols; i += 1) {
          const v = row[i];
          normalized.push(v === undefined || v === '' ? null : v);
        }
        rows.push(normalized);
        rowCount += 1;
        if (rowCount % 5000 === 0) {
          const msg: ProgressMessage = { type: 'progress', rows: rowCount };
          ctx.postMessage(msg);
        }
      },
      error: (err: Error) => {
        const msg: ErrorMessage = { type: 'error', message: err.message };
        ctx.postMessage(msg);
      },
    });

    if (headers.length === 0) {
      const msg: ErrorMessage = {
        type: 'error',
        message: 'The file appears to be empty or has no header row.',
      };
      ctx.postMessage(msg);
      return;
    }

    const dataset: RawDataset = {
      fileName: data.fileName,
      delimiter,
      headers,
      rows,
      skippedRows,
      byteSize: data.byteSize,
    };
    const done: DoneMessage = { type: 'done', dataset };
    ctx.postMessage(done);
  } catch (err) {
    const msg: ErrorMessage = {
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown parsing error',
    };
    ctx.postMessage(msg);
  }
});
