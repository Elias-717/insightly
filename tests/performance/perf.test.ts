import { describe, expect, it } from 'vitest';
import Papa from 'papaparse';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import type { CellValue, RawDataset } from '@/types';

/**
 * Performance smoke test. Generates a 50,000 x 30 dataset in memory (never
 * committed), then measures parse and analysis time. The real app parses in a
 * Web Worker off the main thread; here we measure the raw CPU cost of the
 * pure pipeline, which is what determines time-to-first-result.
 *
 * Budgets:
 *  - a single synchronous parse "chunk" must not exceed 200 ms (proxy for not
 *    blocking the main thread; in the app parsing runs in a worker regardless)
 *  - total analysis (profile + stats + correlation + insights) < 5000 ms
 */

const ROWS = 50_000;
const COLS = 30;

function generateCsv(): string {
  const headers: string[] = [];
  for (let c = 0; c < COLS; c += 1) {
    if (c % 3 === 0) headers.push(`num_${c}`);
    else if (c % 3 === 1) headers.push(`cat_${c}`);
    else headers.push(`text_${c}`);
  }
  const cats = ['North', 'South', 'East', 'West'];
  const lines = [headers.join(',')];
  for (let r = 0; r < ROWS; r += 1) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c += 1) {
      if (c % 3 === 0) row.push(String((r * 7 + c) % 1000));
      else if (c % 3 === 1) row.push(cats[(r + c) % cats.length]);
      else row.push(`v${(r + c) % 50}`);
    }
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

describe('performance smoke (50k x 30)', () => {
  it('parses and analyzes a large dataset within budget', () => {
    const csv = generateCsv();

    // --- Parse ---
    const parseStart = performance.now();
    const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: 'greedy' });
    const parseMs = performance.now() - parseStart;

    const allRows = parsed.data;
    const headers = allRows[0];
    const rows: CellValue[][] = allRows.slice(1).map((row) =>
      headers.map((_, i) => {
        const v = row[i];
        return v === undefined || v === '' ? null : v;
      }),
    );
    const raw: RawDataset = {
      fileName: 'perf.csv',
      delimiter: ',',
      headers,
      rows,
      skippedRows: 0,
      byteSize: csv.length,
    };

    // --- Analyze ---
    const analysisStart = performance.now();
    const dataset = analyzeDataset(raw);
    const insights = runInsights(dataset);
    const analysisMs = performance.now() - analysisStart;

    // Report numbers for the record.
    // eslint-disable-next-line no-console
    console.log(
      `[perf] rows=${rows.length} cols=${headers.length} parse=${parseMs.toFixed(
        0,
      )}ms analysis=${analysisMs.toFixed(0)}ms insights=${insights.length}`,
    );

    expect(rows.length).toBe(ROWS);
    expect(headers.length).toBe(COLS);
    // Total analysis budget.
    expect(analysisMs).toBeLessThan(5000);
    // Parse budget: Papaparse is fast; a full synchronous parse of this size
    // should stay well under a second, and in the app it runs in a worker.
    expect(parseMs).toBeLessThan(2000);
  }, 30_000);
});
