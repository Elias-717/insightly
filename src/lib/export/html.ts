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
<title>Insightly report — ${escapeHtml(dataset.raw.fileName)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 40px; color: #0F172A; background: #F8FAFC; }
  .wrap { max-width: 900px; margin: 0 auto; }
  h1 { color: #2563EB; letter-spacing: -0.02em; }
  .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 16px; }
  .stat { text-align: center; }
  .stat .num { font-size: 28px; font-weight: 700; color: #0F172A; font-variant-numeric: tabular-nums; }
  .muted { color: #64748B; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #E2E8F0; }
  ul { list-style: none; padding: 0; }
  li { padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
  .sev { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-right: 8px; }
  .sev-warning { background: #FEF3C7; color: #B45309; }
  .sev-discovery { background: #DCFCE7; color: #15803D; }
  .sev-info { background: #E0F2FE; color: #0369A1; }
  .gauge { font-size: 48px; font-weight: 800; color: #2563EB; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Insightly report</h1>
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

    <p class="muted">Generated locally by Insightly. Your data never left your device.</p>
  </div>
</body>
</html>`;
}
