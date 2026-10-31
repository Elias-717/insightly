import type { Dataset, Insight } from '@/types';

/** Render insights as a Markdown document suitable for copying to the clipboard. */
export function insightsToMarkdown(dataset: Dataset, insights: Insight[]): string {
  const lines: string[] = [];
  lines.push(`# Insightly report — ${dataset.raw.fileName}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(`- Rows: ${dataset.overview.rows.toLocaleString()}`);
  lines.push(`- Columns: ${dataset.overview.columns}`);
  lines.push(
    `- Missing cells: ${dataset.overview.missingCells.toLocaleString()} (${dataset.overview.missingPct.toFixed(1)}%)`,
  );
  lines.push(
    `- Duplicate rows: ${dataset.overview.duplicateRows} (${dataset.overview.duplicatePct.toFixed(1)}%)`,
  );
  lines.push(`- Quality score: ${dataset.quality.score}/100 (grade ${dataset.quality.grade})`);
  lines.push('');
  lines.push('## Whispers');
  lines.push('');
  for (const insight of insights) {
    lines.push(`- **[${insight.severity}]** ${insight.title}`);
    lines.push(`  - ${insight.explanation}`);
  }
  lines.push('');
  return lines.join('\n');
}
