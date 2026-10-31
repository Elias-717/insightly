import type {
  CategoryStats,
  CellValue,
  ColumnProfile,
  ColumnType,
  DateStats,
  NumericStats,
  TextStats,
} from '@/types';
import { isMissing, parseDate, parseNumber } from './clean-value';
import { computeNumericStats } from './stats';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function nonMissing(values: CellValue[]): string[] {
  return values.filter((v): v is string => !isMissing(v)).map((v) => v.trim());
}

export function numericStatsFor(values: CellValue[]): NumericStats {
  const nums: number[] = [];
  for (const v of values) {
    const n = parseNumber(v);
    if (n !== null) nums.push(n);
  }
  return computeNumericStats(nums);
}

export function categoryStatsFor(values: CellValue[]): CategoryStats {
  const present = nonMissing(values);
  const counts = new Map<string, number>();
  for (const v of present) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = present.length || 1;
  const top = sorted.slice(0, 5).map(([value, count]) => ({
    value,
    count,
    percentage: (count / total) * 100,
  }));
  const rareCount = sorted.filter(([, count]) => count / total < 0.01).length;
  return { uniqueCount: counts.size, top, rareCount };
}

export function dateStatsFor(values: CellValue[]): DateStats {
  const timestamps: number[] = [];
  for (const v of values) {
    const t = parseDate(v);
    if (t !== null) timestamps.push(t);
  }
  if (timestamps.length === 0) {
    return {
      earliest: '',
      latest: '',
      spanDays: 0,
      mostCommonWeekday: '',
      mostCommonMonth: '',
      timestamps: [],
    };
  }
  const sorted = [...timestamps].sort((a, b) => a - b);
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];
  const weekdayCounts = new Array(7).fill(0);
  const monthCounts = new Array(12).fill(0);
  for (const t of timestamps) {
    const d = new Date(t);
    weekdayCounts[d.getDay()] += 1;
    monthCounts[d.getMonth()] += 1;
  }
  const topWeekday = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const topMonth = monthCounts.indexOf(Math.max(...monthCounts));
  return {
    earliest: new Date(earliest).toISOString().slice(0, 10),
    latest: new Date(latest).toISOString().slice(0, 10),
    spanDays: Math.round((latest - earliest) / 86_400_000),
    mostCommonWeekday: WEEKDAYS[topWeekday],
    mostCommonMonth: MONTH_NAMES[topMonth],
    timestamps,
  };
}

export function textStatsFor(values: CellValue[]): TextStats {
  const present = values.filter((v): v is string => v !== null);
  const emptyCount = present.filter((v) => v.trim() === '').length;
  const nonEmpty = present.filter((v) => v.trim() !== '');
  if (nonEmpty.length === 0) {
    return { avgLength: 0, longest: '', shortest: '', emptyCount };
  }
  let longest = nonEmpty[0];
  let shortest = nonEmpty[0];
  let totalLen = 0;
  for (const v of nonEmpty) {
    totalLen += v.length;
    if (v.length > longest.length) longest = v;
    if (v.length < shortest.length) shortest = v;
  }
  return {
    avgLength: totalLen / nonEmpty.length,
    longest,
    shortest,
    emptyCount,
  };
}

/** Build a small sparkline (bucket counts) suitable for the column list. */
function buildSparkline(values: CellValue[], type: ColumnType): number[] {
  const BUCKETS = 12;
  if (type === 'number' || type === 'integer') {
    const nums: number[] = [];
    for (const v of values) {
      const n = parseNumber(v);
      if (n !== null) nums.push(n);
    }
    if (nums.length === 0) return new Array(BUCKETS).fill(0);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const out = new Array(BUCKETS).fill(0);
    if (min === max) {
      out[Math.floor(BUCKETS / 2)] = nums.length;
      return out;
    }
    const width = (max - min) / BUCKETS;
    for (const n of nums) {
      let idx = Math.floor((n - min) / width);
      if (idx >= BUCKETS) idx = BUCKETS - 1;
      out[idx] += 1;
    }
    return out;
  }
  // Category/boolean/text: top-bucket frequencies.
  const counts = new Map<string, number>();
  for (const v of nonMissing(values)) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.values()]
    .sort((a, b) => b - a)
    .slice(0, BUCKETS)
    .concat(new Array(BUCKETS).fill(0))
    .slice(0, BUCKETS);
}

/** Build the full profile for a column given its values and (possibly overridden) type. */
export function profileColumn(
  name: string,
  index: number,
  values: CellValue[],
  type: ColumnType,
  detectedType: ColumnType,
): ColumnProfile {
  const totalCount = values.length;
  const missingCount = values.filter((v) => isMissing(v)).length;
  const present = nonMissing(values);
  const uniqueCount = new Set(present).size;

  const profile: ColumnProfile = {
    name,
    index,
    type,
    detectedType,
    totalCount,
    missingCount,
    missingPct: totalCount === 0 ? 0 : (missingCount / totalCount) * 100,
    uniqueCount,
    uniquePct: present.length === 0 ? 0 : (uniqueCount / present.length) * 100,
    sparkline: buildSparkline(values, type),
  };

  if (type === 'number' || type === 'integer') {
    profile.numeric = numericStatsFor(values);
  } else if (type === 'category' || type === 'boolean') {
    profile.category = categoryStatsFor(values);
  } else if (type === 'date') {
    profile.date = dateStatsFor(values);
  } else {
    profile.text = textStatsFor(values);
  }

  return profile;
}
