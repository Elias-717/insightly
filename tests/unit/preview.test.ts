import { describe, expect, it } from 'vitest';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import { getSample } from '@/data/samples';
import {
  PREVIEW,
  PREVIEW_COLUMNS,
  PREVIEW_FINDINGS,
  PREVIEW_ROWS,
} from '@/data/preview';
import { rawFromCsv } from '../helpers';

/**
 * The landing page shows a static excerpt of the report for the messy sample.
 * These tests recompute that report with the real engine so the excerpt can
 * never quietly drift from what the app would actually show.
 */
const sample = getSample(PREVIEW.sampleId);
const raw = rawFromCsv(sample.fileName, sample.csv);
const dataset = analyzeDataset(raw);
const insights = runInsights(dataset);

describe('landing preview matches the real analysis of the messy sample', () => {
  it('headline figures', () => {
    expect(PREVIEW.fileName).toBe(sample.fileName);
    expect(PREVIEW.rows).toBe(dataset.overview.rows);
    expect(PREVIEW.columns).toBe(dataset.overview.columns);
    expect(PREVIEW.score).toBe(Math.round(dataset.quality.score));
    expect(PREVIEW.missingPct).toBe(Number(dataset.overview.missingPct.toFixed(1)));
    expect(PREVIEW.duplicateRows).toBe(dataset.overview.duplicateRows);
    expect(PREVIEW.findingCount).toBe(insights.length);
  });

  it('columns, types, and missing percentages', () => {
    expect(PREVIEW_COLUMNS.map((c) => c.name)).toEqual(raw.headers);
    for (const col of PREVIEW_COLUMNS) {
      const profile = dataset.columns.find((c) => c.name === col.name)!;
      expect(col.type).toBe(profile.type);
      expect(col.missingPct).toBe(Math.round(profile.missingPct));
      expect(col.numeric).toBe(profile.type === 'number' || profile.type === 'integer');
    }
  });

  it('top findings, in rank order', () => {
    const top = insights.slice(0, PREVIEW_FINDINGS.length);
    expect(PREVIEW_FINDINGS.map((f) => f.title)).toEqual(top.map((i) => i.title));
    expect(PREVIEW_FINDINGS.map((f) => f.severity)).toEqual(top.map((i) => i.severity));
    expect(PREVIEW_FINDINGS.map((f) => f.column)).toEqual(top.map((i) => i.columnName));
  });

  it('rows are verbatim from the sample', () => {
    for (const row of PREVIEW_ROWS) {
      const source = raw.rows[row.id - 1].map((v) => v ?? '');
      expect(row.cells).toEqual(source);
    }
  });

  it('every marked cell sits in its finding column', () => {
    for (const row of PREVIEW_ROWS) {
      for (const [index, findingId] of Object.entries(row.marks)) {
        const finding = PREVIEW_FINDINGS.find((f) => f.id === findingId)!;
        expect(PREVIEW_COLUMNS[Number(index)].name).toBe(finding.column);
      }
    }
  });
});
