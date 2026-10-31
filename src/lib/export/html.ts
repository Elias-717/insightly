import type { Dataset, Insight } from '@/types';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build a standalone, self-contained HTML report (inline styles, no scripts). */
export function buildHtmlReport(dataset: Dataset, insights: Insight[]): string {
  const { overview, quality, columns } = dataset;
  const columnRows = columns
    .map(
      (c) => `<tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.type}</td>
        <td>${c.missingPct.toFixed(1)}%</td>
        <td>${c.uniqueCount}</td>
      </tr>`,
    )
    .join('');

  const insightItems = insights
    .map(
      (i) => `<li><span class="sev sev-${i.severity.toLowerCase()}">${i.severity}</span>
        <strong>${escapeHtml(i.title)}</strong><br/><span class="muted">${escapeHtml(i.explanation)}</span></li>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Insightlet report — ${escapeHtml(dataset.raw.fileName)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 40px; color: #1e293b; background: #f8fafc; }
  .wrap { max-width: 900px; margin: 0 auto; }
  h1 { background: linear-gradient(135deg,#7C3AED,#14B8A6); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 24px -4px rgba(0,0,0,.08); margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 16px; }
  .stat { text-align: center; }
  .stat .num { font-size: 28px; font-weight: 700; }
  .muted { color: #64748b; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
  ul { list-style: none; padding: 0; }
  li { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .sev { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-right: 8px; }
  .sev-warning { background: #fef3c7; color: #92400e; }
  .sev-discovery { background: #ede9fe; color: #5b21b6; }
  .sev-info { background: #cffafe; color: #155e75; }
  .gauge { font-size: 48px; font-weight: 800; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Insightlet report</h1>
    <p class="muted">File: ${escapeHtml(dataset.raw.fileName)} · Generated ${new Date().toISOString().slice(0, 10)}</p>

    <div class="card">
      <h2>Overview</h2>
      <div class="grid">
        <div class="stat"><div class="num">${overview.rows.toLocaleString()}</div><div class="muted">Rows</div></div>
        <div class="stat"><div class="num">${overview.columns}</div><div class="muted">Columns</div></div>
        <div class="stat"><div class="num">${overview.missingPct.toFixed(1)}%</div><div class="muted">Missing</div></div>
        <div class="stat"><div class="num">${overview.duplicateRows}</div><div class="muted">Duplicates</div></div>
      </div>
    </div>

    <div class="card">
      <h2>Data quality</h2>
      <div class="gauge">${quality.score}/100 · ${quality.grade}</div>
      <ul>
        ${quality.components.map((c) => `<li>${c.label}: ${c.score}/100 (weight ${(c.weight * 100).toFixed(0)}%) — <span class="muted">${escapeHtml(c.detail)}</span></li>`).join('')}
      </ul>
    </div>

    <div class="card">
      <h2>Columns</h2>
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Missing</th><th>Unique</th></tr></thead>
        <tbody>${columnRows}</tbody>
      </table>
    </div>

    <div class="card">
      <h2>Whispers</h2>
      <ul>${insightItems}</ul>
    </div>

    <p class="muted">Generated locally by Insightlet. Your data never left your device.</p>
  </div>
</body>
</html>`;
}
