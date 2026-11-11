import type { ColumnType, InsightSeverity } from '@/types';

/**
 * A static excerpt of the Insightly report for the bundled "messy customers"
 * sample, shown on the landing page before anything is uploaded.
 *
 * It is static (not computed on load) because parsing only happens in the
 * Worker, and spinning one up just to decorate the landing page would be
 * wasteful. `tests/unit/preview.test.ts` re-runs the real analysis on the
 * sample and fails if any figure, type, row, or finding here drifts from it.
 */

export interface PreviewColumn {
  name: string;
  type: ColumnType;
  missingPct: number;
  numeric: boolean;
}

export interface PreviewFinding {
  id: string;
  column: string;
  severity: InsightSeverity;
  title: string;
}

export interface PreviewRow {
  /** The row's `id` value, which is also its 1-based data row number. */
  id: number;
  cells: string[];
  /**
   * Column index -> finding id, for individual cells a finding points at.
   * Column-wide findings (like a mostly-empty column) mark the header instead.
   */
  marks: Record<number, string>;
}

export const PREVIEW = {
  sampleId: 'messy' as const,
  fileName: 'messy-customers.csv',
  rows: 20,
  columns: 8,
  score: 92,
  missingPct: 15.0,
  duplicateRows: 0,
  findingCount: 12,
};

export const PREVIEW_COLUMNS: PreviewColumn[] = [
  { name: 'id', type: 'identifier', missingPct: 0, numeric: false },
  { name: 'customer', type: 'category', missingPct: 5, numeric: false },
  { name: 'city', type: 'category', missingPct: 0, numeric: false },
  { name: 'age', type: 'integer', missingPct: 10, numeric: true },
  { name: 'income', type: 'integer', missingPct: 25, numeric: true },
  { name: 'status', type: 'category', missingPct: 0, numeric: false },
  { name: 'signup', type: 'date', missingPct: 0, numeric: false },
  { name: 'notes', type: 'category', missingPct: 80, numeric: false },
];

/** The top four findings, in the order the app ranks them. */
export const PREVIEW_FINDINGS: PreviewFinding[] = [
  {
    id: 'notes-missing',
    column: 'notes',
    severity: 'Warning',
    title: "Column 'notes' has 80.0% missing values.",
  },
  {
    id: 'age-outlier',
    column: 'age',
    severity: 'Warning',
    title: "'age' has 1 outlier; the most extreme is 999, far from the typical range.",
  },
  {
    id: 'income-outlier',
    column: 'income',
    severity: 'Warning',
    title: "'income' has 1 outlier; the most extreme is 95000, far from the typical range.",
  },
  {
    id: 'status-casing',
    column: 'status',
    severity: 'Warning',
    title: "'status' has inconsistent casing ('Active' vs 'active').",
  },
];

/** Rows that show each cell-level finding, plus ordinary rows for contrast. */
export const PREVIEW_ROWS: PreviewRow[] = [
  {
    id: 1,
    cells: ['1', 'John Smith', 'Kuala Lumpur', '34', '55000', 'Active', '2023-03-01', ''],
    marks: {},
  },
  {
    id: 2,
    cells: ['2', 'jane doe', 'Kuala Lumpur', '28', '48000', 'active', '2023-03-05', 'good customer'],
    marks: { 5: 'status-casing' },
  },
  {
    id: 3,
    cells: ['3', 'Bob Lee', 'Penang', '', '62000', 'Active', '03/08/2023', ''],
    marks: {},
  },
  {
    id: 4,
    cells: ['4', 'Alice Tan', 'Kuala Lumpur', '45', '', 'ACTIVE', '2023-03-12', 'vip'],
    marks: { 5: 'status-casing' },
  },
  {
    id: 11,
    cells: ['11', 'Henry Foo', 'Penang', '999', '72000', 'active', '2023-04-05', 'age looks wrong'],
    marks: { 3: 'age-outlier', 5: 'status-casing' },
  },
  {
    id: 17,
    cells: ['17', 'Mona Goh', 'Kuala Lumpur', '55', '95000', 'Inactive', '2023-04-25', ''],
    marks: { 4: 'income-outlier' },
  },
];
