import { describe, expect, it } from 'vitest';
import { insightsToMarkdown } from '@/lib/export/markdown';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import { rawFromCsv } from '../helpers';

const dataset = analyzeDataset(rawFromCsv('grades.csv', 'a,b\n1,2\n3,4\n5,6'));
const insights = runInsights(dataset);

describe('Markdown export', () => {
  const md = insightsToMarkdown(dataset, insights);

  it('includes a title with the file name', () => {
    expect(md).toContain('# Insightlet report — grades.csv');
  });

  it('includes an overview section with row and column counts', () => {
    expect(md).toContain('## Overview');
    expect(md).toContain('Rows:');
    expect(md).toContain('Columns:');
  });

  it('includes the quality score', () => {
    expect(md).toContain(`${dataset.quality.score}/100`);
  });

  it('renders each insight as a bullet with its severity', () => {
    for (const insight of insights) {
      expect(md).toContain(`**[${insight.severity}]**`);
    }
  });

  it('is deterministic for the same input', () => {
    expect(insightsToMarkdown(dataset, insights)).toBe(md);
  });
});
