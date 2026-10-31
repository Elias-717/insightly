import type { CellValue, ColumnType } from '@/types';
import { isMissing, parseBoolean, parseDate, parseNumber } from './clean-value';

/** Fraction of non-missing values that must match a format to accept it. */
const MATCH_THRESHOLD = 0.85;

/** Category rules. */
const CATEGORY_MAX_UNIQUE = 20;
const CATEGORY_UNIQUE_PCT = 0.05;
/** Identifier rule: almost everything is unique. */
const IDENTIFIER_UNIQUE_PCT = 0.95;

export interface TypeDetectionResult {
  type: ColumnType;
  nonMissing: number;
  uniqueCount: number;
}

/**
 * Detect the semantic type of a single column.
 * Order of precedence: boolean -> date -> number/integer -> identifier -> category -> text.
 */
export function detectColumnType(values: CellValue[]): TypeDetectionResult {
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
    // A mostly-unique integer column that reads like an index is an identifier.
    if (allIntegers && uniquePct >= IDENTIFIER_UNIQUE_PCT && nonMissing > 10) {
      return { type: 'identifier', nonMissing, uniqueCount };
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
