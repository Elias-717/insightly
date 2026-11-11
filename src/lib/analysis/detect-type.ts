import type { CellValue, ColumnType } from '@/types';
import { isMissing, parseBoolean, parseDate, parseNumber } from './clean-value';

/** Fraction of non-missing values that must match a format to accept it. */
const MATCH_THRESHOLD = 0.85;

/** Category rules. */
const CATEGORY_MAX_UNIQUE = 20;
const CATEGORY_UNIQUE_PCT = 0.05;
/** Identifier rule: almost everything is unique. */
const IDENTIFIER_UNIQUE_PCT = 0.95;

/**
 * Column names that read like an identifier: a trailing token such as `id`,
 * `customer_id`, `order no`, `sku` (case-insensitive, token-separated so
 * "paid" or "valid" do not match), or camelCase like `userId`.
 */
const ID_NAME = /(?:^|[^a-z0-9])(?:id|uuid|guid|key|code|sku|ref|no|num|number)$/i;
const CAMEL_ID = /[a-z0-9]Id$/;

export function looksLikeIdName(name: string): boolean {
  const trimmed = name.trim();
  return ID_NAME.test(trimmed) || CAMEL_ID.test(trimmed);
}

/**
 * Integer values that behave like a row index: either a consecutive run
 * (1..20, 1001..1050, in any order) or strictly increasing down the file
 * (order numbers with gaps). Scores, prices, and ages are neither.
 */
export function looksLikeIndex(nums: number[]): boolean {
  if (nums.length < 2) return false;
  let increasing = true;
  let min = nums[0];
  let max = nums[0];
  for (let i = 1; i < nums.length; i += 1) {
    if (nums[i] <= nums[i - 1]) increasing = false;
    if (nums[i] < min) min = nums[i];
    if (nums[i] > max) max = nums[i];
  }
  const distinct = new Set(nums).size;
  return increasing || max - min === distinct - 1;
}

export interface TypeDetectionResult {
  type: ColumnType;
  nonMissing: number;
  uniqueCount: number;
}

/**
 * Detect the semantic type of a single column.
 * Order of precedence: boolean -> date -> number/integer -> identifier -> category -> text.
 *
 * `name` is optional and only used to recognise integer identifiers by name.
 */
export function detectColumnType(values: CellValue[], name = ''): TypeDetectionResult {
  const nonMissingValues = values.filter((v): v is string => !isMissing(v));
  const nonMissing = nonMissingValues.length;
  const uniqueSet = new Set(nonMissingValues.map((v) => v.trim()));
  const uniqueCount = uniqueSet.size;

  if (nonMissing === 0) {
    return { type: 'text', nonMissing, uniqueCount };
  }

  const uniquePct = uniqueCount / nonMissing;

  // Boolean: only distinct boolean-ish tokens and few unique values.
  const boolMatches = nonMissingValues.filter((v) => parseBoolean(v) !== null).length;
  if (boolMatches / nonMissing >= MATCH_THRESHOLD && uniqueCount <= 3) {
    return { type: 'boolean', nonMissing, uniqueCount };
  }

  // Date.
  const dateMatches = nonMissingValues.filter((v) => parseDate(v) !== null).length;
  if (dateMatches / nonMissing >= MATCH_THRESHOLD) {
    return { type: 'date', nonMissing, uniqueCount };
  }

  // Numeric.
  const numMatches = nonMissingValues.filter((v) => parseNumber(v) !== null).length;
  if (numMatches / nonMissing >= MATCH_THRESHOLD) {
    const allIntegers = nonMissingValues.every((v) => {
      const n = parseNumber(v);
      return n === null || Number.isInteger(n);
    });
    // A mostly-unique integer column is an identifier only if it is named like
    // one or its values run like an index. Uniqueness alone is not enough: in
    // small files, scores, prices, and ages are often all distinct too.
    if (allIntegers && uniquePct >= IDENTIFIER_UNIQUE_PCT && nonMissing > 10) {
      const nums = nonMissingValues
        .map((v) => parseNumber(v))
        .filter((n): n is number => n !== null);
      if (looksLikeIdName(name) || looksLikeIndex(nums)) {
        return { type: 'identifier', nonMissing, uniqueCount };
      }
    }
    return { type: allIntegers ? 'integer' : 'number', nonMissing, uniqueCount };
  }

  // Identifier: text that is almost entirely unique.
  if (uniquePct >= IDENTIFIER_UNIQUE_PCT && nonMissing > 10) {
    return { type: 'identifier', nonMissing, uniqueCount };
  }

  // Category: few unique values, either by absolute count or percentage.
  if (uniqueCount <= CATEGORY_MAX_UNIQUE || uniquePct <= CATEGORY_UNIQUE_PCT) {
    return { type: 'category', nonMissing, uniqueCount };
  }

  return { type: 'text', nonMissing, uniqueCount };
}
