import { describe, expect, it } from 'vitest';
import { buildHtmlReport } from '@/lib/export/html';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { runInsights } from '@/lib/insights';
import { rawFromCsv } from '../helpers';

const dataset = analyzeDataset(
  rawFromCsv('report.csv', 'name,score\nAlice,90\nBob,80\nCarol,70'),
);
const insights = runInsights(dataset);

describe('HTML report export', () => {
  const html = buildHtmlReport(dataset, insights);

  it('produces a full HTML document', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('</html>');
  });

  it('locks the report down with its own policy: no scripts, no network', () => {
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/)?.[1];
    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toMatch(/script-src|connect-src/);
    expect(html.indexOf('Content-Security-Policy')).toBeLessThan(html.indexOf('<title>'));
    expect(html).not.toMatch(/<script/i);
  });

  it('includes the file name in the title', () => {
    expect(html).toContain('report.csv');
  });

  it('includes the overview, quality, columns, and whispers sections', () => {
    expect(html).toContain('Overview');
    expect(html).toContain('Data quality');
    expect(html).toContain('Columns');
    expect(html).toContain('Whispers');
  });

  it('escapes HTML-special characters in column names to prevent markup injection', () => {
    // A column name containing markup must be escaped where it is rendered.
    const malicious = analyzeDataset(
      rawFromCsv('x.csv', '<script>alert(1)</script>,b\n1,2\n3,4'),
    );
    const out = buildHtmlReport(malicious, []);
    expect(out).not.toContain('<script>alert(1)</script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('renders the privacy note', () => {
    expect(html).toContain('never left your device');
  });
});
