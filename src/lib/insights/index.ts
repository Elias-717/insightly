import type { Dataset, Insight } from '@/types';
import type { InsightRule } from './types';
import { constantColumnRule } from './rules/constant-column';
import { correlationRule } from './rules/correlation';
import { dominantCategoryRule } from './rules/dominant-category';
import { duplicatesRule } from './rules/duplicates';
import { highCardinalityRule } from './rules/high-cardinality';
import { identifierRule } from './rules/identifier';
import { inconsistentCasingRule } from './rules/inconsistent-casing';
import { missingValuesRule } from './rules/missing-values';
import { outliersRule } from './rules/outliers';
import { qualitySummaryRule } from './rules/quality-summary';
import { skewnessRule } from './rules/skewness';
import { timeTrendRule } from './rules/time-trend';
import { zeroInflationRule } from './rules/zero-inflation';

export type { InsightRule } from './types';

/** All registered insight rules. Add new rules here. */
export const INSIGHT_RULES: InsightRule[] = [
  qualitySummaryRule,
  missingValuesRule,
  duplicatesRule,
  outliersRule,
  correlationRule,
  dominantCategoryRule,
  timeTrendRule,
  inconsistentCasingRule,
  identifierRule,
  constantColumnRule,
  skewnessRule,
  highCardinalityRule,
  zeroInflationRule,
];

/**
 * Run every rule, flatten the results, and rank by severity then importance.
 * Caps the output to a reasonable range for display.
 */
export function runInsights(dataset: Dataset, limit = 12): Insight[] {
  const all = INSIGHT_RULES.flatMap((rule) => rule(dataset));
  const severityRank: Record<Insight['severity'], number> = {
    Warning: 0,
    Discovery: 1,
    Info: 2,
  };
  return all
    .sort((a, b) => {
      if (severityRank[a.severity] !== severityRank[b.severity]) {
        return severityRank[a.severity] - severityRank[b.severity];
      }
      return b.importance - a.importance;
    })
    .slice(0, limit);
}
