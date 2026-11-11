import type {
  CellValue,
  ColumnType,
  Dataset,
  DatasetOverview,
  RawDataset,
} from '@/types';
import { parseNumber, isMissing } from './clean-value';
import { buildCorrelationMatrix } from './correlation';
import { countDuplicateRows } from './duplicates';
import { detectColumnType } from './detect-type';
import { profileColumn } from './profile-column';
import { computeQualityScore } from './quality-score';

function emptyTypeCounts(): Record<ColumnType, number> {
  return {
    number: 0,
    integer: 0,
    text: 0,
    category: 0,
    boolean: 0,
    date: 0,
    identifier: 0,
  };
}

/** Extract the values of a single column (by index) across all rows. */
export function columnValues(raw: RawDataset, index: number): CellValue[] {
  return raw.rows.map((row) => row[index] ?? null);
}

/**
 * Full analysis pipeline. Accepts optional per-column type overrides
 * (keyed by column name) so the UI can recompute after a manual override.
 */
export function analyzeDataset(
  raw: RawDataset,
  overrides: Record<string, ColumnType> = {},
): Dataset {
  const totalRows = raw.rows.length;

  const columns = raw.headers.map((name, index) => {
    const values = columnValues(raw, index);
    const detection = detectColumnType(values, name);
    const type = overrides[name] ?? detection.type;
    return profileColumn(name, index, values, type, detection.type);
  });

  // Overview.
  const missingCells = columns.reduce((acc, c) => acc + c.missingCount, 0);
  const totalCells = columns.length * totalRows || 1;
  const duplicateRows = countDuplicateRows(raw.rows);
  const typeCounts = emptyTypeCounts();
  for (const c of columns) typeCounts[c.type] += 1;

  const overview: DatasetOverview = {
    rows: totalRows,
    columns: columns.length,
    missingCells,
    missingPct: (missingCells / totalCells) * 100,
    duplicateRows,
    duplicatePct: totalRows === 0 ? 0 : (duplicateRows / totalRows) * 100,
    memoryBytes: raw.byteSize,
    typeCounts,
  };

  // Quality.
  const quality = computeQualityScore(columns, totalRows, duplicateRows);

  // Correlation across numeric columns.
  const numericColumns = columns
    .filter((c) => c.type === 'number' || c.type === 'integer')
    .map((c) => ({
      name: c.name,
      values: columnValues(raw, c.index).map((v) => (isMissing(v) ? null : parseNumber(v))),
    }));
  const correlation = buildCorrelationMatrix(numericColumns);

  return { raw, columns, overview, quality, correlation };
}
