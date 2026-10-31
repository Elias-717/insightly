'use client';

import { useCallback, useRef, useState } from 'react';
import type { RawDataset } from '@/types';
import type { WorkerResponse } from '@/workers/csv.worker';

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

export type ParseStatus = 'idle' | 'parsing' | 'done' | 'error';

export interface ParserState {
  status: ParseStatus;
  progressRows: number;
  error: string | null;
  dataset: RawDataset | null;
}

const VALID_EXTENSIONS = ['.csv', '.tsv', '.txt'];

function validateFile(file: File): string | null {
  const lower = file.name.toLowerCase();
  const hasValidExt = VALID_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasValidExt) {
    return 'That file type is not supported. Please use a .csv or .tsv file.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB, which is over the 20 MB limit. Try a smaller sample.`;
  }
  if (file.size === 0) {
    return 'That file is empty. Please choose a file with data.';
  }
  return null;
}

/**
 * Hook that owns a CSV parsing Web Worker. Exposes parse(file), parseText(...)
 * for sample data, cancel(), and reset(), plus progress/error state.
 */
export function useCsvParser() {
  const [state, setState] = useState<ParserState>({
    status: 'idle',
    progressRows: 0,
    error: null,
    dataset: null,
  });
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const runWorker = useCallback(
    (fileName: string, text: string, byteSize: number) => {
      cleanup();
      setState({ status: 'parsing', progressRows: 0, error: null, dataset: null });

      const worker = new Worker(new URL('../workers/csv.worker.ts', import.meta.url));
      workerRef.current = worker;

      // Parsing timeout guard (30s).
      timeoutRef.current = setTimeout(() => {
        cleanup();
        setState({
          status: 'error',
          progressRows: 0,
          error: 'Parsing timed out. The file may be too large or malformed. Try a smaller file.',
          dataset: null,
        });
      }, 30_000);

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const msg = event.data;
        if (msg.type === 'progress') {
          setState((prev) => ({ ...prev, progressRows: msg.rows }));
        } else if (msg.type === 'done') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (msg.dataset.rows.length === 0) {
            setState({
              status: 'error',
              progressRows: 0,
              error: 'No data rows were found. The file may only contain a header.',
              dataset: null,
            });
          } else {
            setState({
              status: 'done',
              progressRows: msg.dataset.rows.length,
              error: null,
              dataset: msg.dataset,
            });
          }
          cleanup();
        } else if (msg.type === 'error') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setState({ status: 'error', progressRows: 0, error: msg.message, dataset: null });
          cleanup();
        }
      };

      worker.onerror = (err) => {
        setState({
          status: 'error',
          progressRows: 0,
          error: err.message || 'The parser worker crashed.',
          dataset: null,
        });
        cleanup();
      };

      worker.postMessage({ type: 'parse', fileName, text, byteSize });
    },
    [cleanup],
  );

  const parse = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setState({ status: 'error', progressRows: 0, error, dataset: null });
        return;
      }
      const text = await file.text();
      runWorker(file.name, text, file.size);
    },
    [runWorker],
  );

  const parseText = useCallback(
    (fileName: string, text: string) => {
      runWorker(fileName, text, new Blob([text]).size);
    },
    [runWorker],
  );

  const cancel = useCallback(() => {
    cleanup();
    setState({ status: 'idle', progressRows: 0, error: null, dataset: null });
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState({ status: 'idle', progressRows: 0, error: null, dataset: null });
  }, [cleanup]);

  return { state, parse, parseText, cancel, reset };
}
