import type { Dataset, Insight, QualityComponent } from '@/types';
import { columnValues } from '@/lib/analysis/analyze';
import { isMissing } from '@/lib/analysis/clean-value';
import { countNoun, pluralize } from '@/lib/utils';

/**
 * Pure presentation helpers for the Overview screen. No analysis logic lives
 * here — these only reshape an already-computed Dataset into display strings.
 */

export type SummarySeverity = 'success' | 'warning' | 'error';

export interface OverviewSummary {
  severity: SummarySeverity;
  sentence: string;
}

/** Count empty-string vs placeholder-token missing cells across the dataset. */
export interface MissingBreakdown {
  total: number;
  empty: number;
  placeholders: number;
}

export function missingBreakdown(dataset: Dataset): MissingBreakdown {
  let empty = 0;
  let placeholders = 0;
  for (const col of dataset.columns) {
    for (const value of columnValues(dataset.raw, col.index)) {
      if (!isMissing(value)) continue;
      // null or empty/whitespace string counts as "empty"; a recognized token
      // like "NA"/"null"/"-" counts as a "placeholder".
      if (value === null || value.trim() === '') empty += 1;
      else placeholders += 1;
    }
  }
  return { total: empty + placeholders, empty, placeholders };
}

/** Columns that are entirely empty (100% missing). */
export function emptyColumnCount(dataset: Dataset): number {
  return dataset.columns.filter((c) => c.totalCount > 0 && c.missingPct >= 100).length;
}

/**
 * Build the one-sentence Overview banner from the analysis. Severity is driven
 * by thresholds; the sentence lists the biggest problems or confirms health.
 */
export function buildOverviewSummary(dataset: Dataset, insights: Insight[]): OverviewSummary {
  const { overview } = dataset;
  const emptyCols = emptyColumnCount(dataset);
  const warnings = insights.filter((i) => i.severity === 'Warning').length;

  const problems: string[] = [];
  if (emptyCols > 0) problems.push(countNoun(emptyCols, 'empty column'));
  if (overview.missingPct >= 5) {
    problems.push(`${Math.round(overview.missingPct)}% missing cells`);
  }
  if (overview.duplicateRows > 0) {
    problems.push(countNoun(overview.duplicateRows, 'duplicate row'));
  }

  // Severity: error when quality is poor or there are empty columns / heavy
  // missingness; warning when there are lesser issues; success otherwise.
  const serious =
    dataset.quality.score < 60 ||
    emptyCols > 0 ||
    overview.missingPct >= 20 ||
    overview.duplicatePct >= 10;

  if (serious && problems.length > 0) {
    return {
      severity: 'error',
      sentence: `This dataset has serious quality issues: ${joinList(problems)}. Open Whispers for details.`,
    };
  }

  if (problems.length > 0 || warnings > 0) {
    const detail =
      problems.length > 0
        ? `${joinList(problems)}.`
        : `${countNoun(warnings, 'minor warning')} found.`;
    return {
      severity: 'warning',
      sentence: `This dataset is usable but needs some cleaning: ${detail}`,
    };
  }

  return {
    severity: 'success',
    sentence:
      warnings > 0
        ? `This dataset looks healthy. ${countNoun(warnings, 'minor warning')} found.`
        : 'This dataset looks healthy. No notable issues found.',
  };
}

/** Grammatical list join: "a", "a and b", "a, b, and c". */
export function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export interface QualityReason {
  key: QualityComponent['key'];
  label: string;
  /** Points lost on this component's weighted contribution (0-100 scale). */
  pointsLost: number;
}

/**
 * The top reasons points were lost, worst first. Each component can lose up to
 * `weight * 100` points; we rank by weighted shortfall and keep non-trivial ones.
 */
export function topQualityReasons(dataset: Dataset, limit = 3): QualityReason[] {
  return dataset.quality.components
    .map((c) => ({
      key: c.key,
      label: c.detail,
      pointsLost: Math.round((100 - c.score) * c.weight),
    }))
    .filter((r) => r.pointsLost > 0)
    .sort((a, b) => b.pointsLost - a.pointsLost)
    .slice(0, limit);
}

/** One-line verdict for the data quality card. */
export function qualityVerdict(score: number): string {
  if (score >= 90) return 'Excellent — ready to analyze.';
  if (score >= 80) return 'Good — minor cleanup optional.';
  if (score >= 70) return 'Fair — some cleaning recommended.';
  if (score >= 60) return 'Needs work — clean before relying on it.';
  return 'Poor — significant cleaning required.';
}

/** Compact "columns by type" summary, e.g. "1 number, 2 integer, 5 text". */
export function typeSummary(dataset: Dataset): string {
  const entries = Object.entries(dataset.overview.typeCounts).filter(([, n]) => n > 0);
  if (entries.length === 0) return 'no columns';
  return entries.map(([type, n]) => `${n} ${type}`).join(', ');
}

/** Sub-line for the Rows card. */
export function rowsSubline(dataset: Dataset): string {
  const skipped = dataset.raw.skippedRows;
  if (skipped === 0) return 'all rows parsed';
  return `${countNoun(skipped, 'row')} skipped as malformed`;
}

/** Sub-line for the Missing cells card. */
export function missingSubline(breakdown: MissingBreakdown): string {
  return `${countNoun(breakdown.total, 'cell')} (${breakdown.empty} empty, ${breakdown.placeholders} ${pluralize(
    breakdown.placeholders,
    'placeholder',
  )})`;
}
