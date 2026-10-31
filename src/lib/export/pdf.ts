import type { Dataset, Insight } from '@/types';

/**
 * Build a clean multi-page PDF report using jsPDF. We construct the document
 * programmatically (text + simple shapes) so it stays crisp and small, and we
 * optionally capture chart nodes via html2canvas when element ids are provided.
 *
 * jsPDF and html2canvas are imported dynamically so they stay out of the main
 * bundle and only load when the user exports.
 */
export async function exportPdfReport(
  dataset: Dataset,
  insights: Insight[],
  chartElementIds: string[] = [],
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const addHeading = (text: string, size = 16) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(30, 41, 59);
    doc.text(text, margin, y);
    y += size + 8;
  };

  const addLine = (text: string, size = 10, color: [number, number, number] = [71, 85, 105]) => {
    ensureSpace(size + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * (size + 3);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Cover.
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 120, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Insightlet report', margin, 70);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dataset.raw.fileName}`, margin, 95);
  y = 150;
  addLine(`Generated ${new Date().toISOString().slice(0, 10)}`, 10);
  y += 10;

  // Overview.
  addHeading('Overview');
  addLine(`Rows: ${dataset.overview.rows.toLocaleString()}`);
  addLine(`Columns: ${dataset.overview.columns}`);
  addLine(
    `Missing cells: ${dataset.overview.missingCells.toLocaleString()} (${dataset.overview.missingPct.toFixed(1)}%)`,
  );
  addLine(
    `Duplicate rows: ${dataset.overview.duplicateRows} (${dataset.overview.duplicatePct.toFixed(1)}%)`,
  );
  y += 8;

  // Quality.
  addHeading(`Data quality: ${dataset.quality.score}/100 (grade ${dataset.quality.grade})`, 14);
  for (const c of dataset.quality.components) {
    addLine(`${c.label}: ${c.score}/100 — weight ${(c.weight * 100).toFixed(0)}% — ${c.detail}`);
  }
  y += 8;

  // Columns.
  addHeading('Columns', 14);
  for (const col of dataset.columns) {
    addLine(
      `${col.name} — ${col.type} · missing ${col.missingPct.toFixed(1)}% · unique ${col.uniqueCount}`,
    );
  }
  y += 8;

  // Charts (captured as images when available).
  if (chartElementIds.length > 0) {
    const html2canvas = (await import('html2canvas')).default;
    for (const id of chartElementIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      try {
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
        const img = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        ensureSpace(imgHeight + 16);
        doc.addImage(img, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 16;
      } catch {
        // Skip charts that cannot be captured rather than failing the whole export.
      }
    }
  }

  // Insights.
  addHeading('Whispers', 14);
  for (const insight of insights) {
    addLine(`[${insight.severity}] ${insight.title}`, 10, [15, 23, 42]);
    addLine(insight.explanation, 9);
    y += 2;
  }

  addLine('Generated locally by Insightlet. Your data never left your device.', 9, [148, 163, 184]);

  doc.save(`insightlet-${dataset.raw.fileName.replace(/\.[^.]+$/, '')}.pdf`);
}
