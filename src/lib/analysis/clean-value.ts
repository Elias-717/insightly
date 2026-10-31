/**
 * Value cleaning / coercion helpers shared by type detection and stats.
 * All pure functions, no side effects.
 */

const MISSING_TOKENS = new Set(['', 'na', 'n/a', 'null', 'nan', 'none', '-', 'undefined']);

/** Returns true when a raw cell should be treated as a missing value. */
export function isMissing(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  return MISSING_TOKENS.has(value.trim().toLowerCase());
}

/**
 * Strip currency symbols, thousands separators, and percent signs so that
 * "$1,234.50" or "1 234,50" style values can be parsed as numbers.
 * Returns the cleaned string (not yet parsed).
 */
export function cleanNumericString(raw: string): string {
  let s = raw.trim();
  // Remove common currency symbols and spaces used as thousands separators.
  s = s.replace(/[$€£¥₹]/g, '').replace(/\s/g, '');
  // Percent sign — keep the number, drop the symbol.
  s = s.replace(/%$/, '');
  // Handle European decimal comma when there is no dot: "1234,50" -> "1234.50".
  if (s.includes(',') && !s.includes('.')) {
    // If the comma looks like a decimal separator (one comma, <=2 trailing digits)
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      s = `${parts[0]}.${parts[1]}`;
    } else {
      s = s.replace(/,/g, '');
    }
  } else {
    // Treat commas as thousands separators.
    s = s.replace(/,/g, '');
  }
  return s;
}

/** Parse a raw cell into a finite number, or null if not numeric. */
export function parseNumber(raw: string | null): number | null {
  if (raw === null) return null;
  if (isMissing(raw)) return null;
  const cleaned = cleanNumericString(raw);
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  // Reject strings with letters (after cleaning) to avoid "1e" style noise.
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const TRUE_TOKENS = new Set(['true', 'yes', 'y', '1', 't']);
const FALSE_TOKENS = new Set(['false', 'no', 'n', '0', 'f']);

/** Parse a raw cell into a boolean, or null. */
export function parseBoolean(raw: string | null): boolean | null {
  if (raw === null || isMissing(raw)) return null;
  const s = raw.trim().toLowerCase();
  if (TRUE_TOKENS.has(s)) return true;
  if (FALSE_TOKENS.has(s)) return false;
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Parse a raw cell into an epoch-ms timestamp, recognizing:
 *  - ISO (YYYY-MM-DD, with optional time)
 *  - DD/MM/YYYY and MM/DD/YYYY (disambiguated when a part > 12)
 *  - "Jan 5, 2024" / "5 Jan 2024"
 * Returns null when it is not a recognizable date.
 */
export function parseDate(raw: string | null): number | null {
  if (raw === null || isMissing(raw)) return null;
  const s = raw.trim();

  // ISO: 2024-01-05 or 2024-01-05T10:30:00
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if (iso) {
    const [, y, mo, d, h, mi, se] = iso;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h ?? 0),
      Number(mi ?? 0),
      Number(se ?? 0),
    );
    return isValidDate(date, Number(y), Number(mo) - 1, Number(d)) ? date.getTime() : null;
  }

  // Slash or dash separated: DD/MM/YYYY or MM/DD/YYYY
  const slash = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(s);
  if (slash) {
    let [, a, b, y] = slash;
    let year = Number(y);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    const na = Number(a);
    const nb = Number(b);
    let day: number;
    let month: number;
    if (na > 12) {
      // Must be DD/MM
      day = na;
      month = nb - 1;
    } else if (nb > 12) {
      // Must be MM/DD
      month = na - 1;
      day = nb;
    } else {
      // Ambiguous — default to DD/MM (international), common outside the US.
      day = na;
      month = nb - 1;
    }
    const date = new Date(year, month, day);
    return isValidDate(date, year, month, day) ? date.getTime() : null;
  }

  // "Jan 5, 2024" or "5 Jan 2024" or "January 5 2024"
  const named = /^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(s);
  if (named) {
    const month = MONTHS[named[1].slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const day = Number(named[2]);
      const year = Number(named[3]);
      const date = new Date(year, month, day);
      return isValidDate(date, year, month, day) ? date.getTime() : null;
    }
  }
  const namedAlt = /^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/.exec(s);
  if (namedAlt) {
    const month = MONTHS[namedAlt[2].slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const day = Number(namedAlt[1]);
      const year = Number(namedAlt[3]);
      const date = new Date(year, month, day);
      return isValidDate(date, year, month, day) ? date.getTime() : null;
    }
  }

  return null;
}

function isValidDate(date: Date, year: number, month: number, day: number): boolean {
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}
