/**
 * Shared domain types for Insightlet.
 * These are the single source of truth across the analysis engine, insights,
 * UI, and export layers. No React imports allowed here.
 */

export type ColumnType =
  | 'number'
  | 'integer'
  | 'text'
  | 'category'
  | 'boolean'
  | 'date'
  | 'identifier';

export type Delimiter = ',' | ';' | '\t' | '|';

/** A single parsed value. Strings preserve the raw text; null means missing. */
export type CellValue = string | null;

/** Raw parsed dataset: a header row plus string rows (missing = null). */
export interface RawDataset {
  fileName: string;
  delimiter: Delimiter;
  headers: string[];
  rows: CellValue[][];
  /** Number of malformed rows that Papaparse skipped. */
  skippedRows: number;
  /** Approximate size in bytes of the source file. */
  byteSize: number;
}

export interface NumericStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number | null;
  std: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outlierCount: number;
  outliers: number[];
  zeros: number;
  negatives: number;
  /** Histogram-ready raw numeric values (nulls excluded). */
  values: number[];
}

export interface CategoryValueCount {
  value: string;
  count: number;
  percentage: number;
}

export interface CategoryStats {
  uniqueCount: number;
  top: CategoryValueCount[];
  rareCount: number;
}

export interface DateStats {
  earliest: string;
  latest: string;
  /** Span in days between earliest and latest. */
  spanDays: number;
  mostCommonWeekday: string;
  mostCommonMonth: string;
  /** Epoch-ms timestamps for time-series building. */
  timestamps: number[];
}

export interface TextStats {
  avgLength: number;
  longest: string;
  shortest: string;
  emptyCount: number;
}

export interface ColumnProfile {
  name: string;
  index: number;
  type: ColumnType;
  /** The automatically detected type, before any manual override. */
  detectedType: ColumnType;
  totalCount: number;
  missingCount: number;
  missingPct: number;
  uniqueCount: number;
  uniquePct: number;
  numeric?: NumericStats;
  category?: CategoryStats;
  date?: DateStats;
  text?: TextStats;
  /** Mini-histogram buckets for the column list sparkline. */
  sparkline: number[];
}

export interface QualityComponent {
  key: 'completeness' | 'uniqueness' | 'consistency' | 'outliers';
  label: string;
  weight: number;
  /** 0-100 sub-score. */
  score: number;
  detail: string;
}

export interface QualityScore {
  score: number;
  grade: string;
  components: QualityComponent[];
}

export interface DatasetOverview {
  rows: number;
  columns: number;
  missingCells: number;
  missingPct: number;
  duplicateRows: number;
  duplicatePct: number;
  memoryBytes: number;
  typeCounts: Record<ColumnType, number>;
}

export interface Dataset {
  raw: RawDataset;
  columns: ColumnProfile[];
  overview: DatasetOverview;
  quality: QualityScore;
  /** Pearson correlation matrix across numeric columns. */
  correlation: CorrelationMatrix;
}

export interface CorrelationCell {
  x: string;
  y: string;
  value: number;
}

export interface CorrelationMatrix {
  columns: string[];
  cells: CorrelationCell[];
  /** Map keyed by `${a}__${b}` for fast lookup. */
  lookup: Record<string, number>;
}

export type InsightSeverity = 'Info' | 'Warning' | 'Discovery';

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  explanation: string;
  /** Importance score used for ranking (higher = more important). */
  importance: number;
  /** Optional column this insight relates to (for click-to-highlight). */
  columnName?: string;
  /** Optional chart target id (for click-to-scroll). */
  target?: string;
}
