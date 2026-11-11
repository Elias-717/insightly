'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { qualityVerdict } from '@/lib/overview/summary';
import { PREVIEW, PREVIEW_COLUMNS, PREVIEW_FINDINGS, PREVIEW_ROWS } from '@/data/preview';

/**
 * Landing-page preview of the report for the messy sample. Findings and the
 * table are linked: pointing at a finding highlights exactly the cells it is
 * about, and fades the rest.
 */
export function SamplePreview({ onOpen }: { onOpen: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const activeColumn = PREVIEW_FINDINGS.find((f) => f.id === active)?.column ?? null;

  return (
    <section aria-labelledby="preview-heading" className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 id="preview-heading" className="text-[13px] text-muted">
            Example report
          </h2>
          <p className="mt-0.5 truncate font-mono text-[15px] font-medium text-fg">
            {PREVIEW.fileName}
            <span className="ml-3 font-sans text-[13px] font-normal text-muted">
              {PREVIEW.rows} rows · {PREVIEW.columns} columns
            </span>
          </p>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          Open the full report
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Headline figures: plain numbers on a shared baseline, no boxes. */}
      <dl className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
        <div className="flex items-end gap-3">
          <dt className="sr-only">Quality score</dt>
          <dd className="stat-value text-[44px] font-semibold leading-none text-fg">
            {PREVIEW.score}
            <span className="ml-0.5 text-base font-medium text-muted">/100</span>
          </dd>
          <dd className="max-w-[11rem] pb-0.5 text-[13px] leading-snug text-fg-secondary">
            {qualityVerdict(PREVIEW.score, 'warning')}
          </dd>
        </div>
        <Figure label="Missing cells" value={`${PREVIEW.missingPct.toFixed(1)}%`} tone="warning" />
        <Figure label="Duplicate rows" value={String(PREVIEW.duplicateRows)} />
        <Figure label="Findings" value={String(PREVIEW.findingCount)} />
      </dl>

      {/* The data itself: the one framed element on the page. */}
      {/* `relative` keeps the table's absolutely-positioned sr-only labels
          inside this scroll container instead of widening the page on mobile. */}
      <div
        role="region"
        aria-label={`Sample rows from ${PREVIEW.fileName}`}
        tabIndex={0}
        className="scroll-thin relative mt-6 overflow-x-auto rounded-card border border-border bg-surface"
      >
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="w-10 px-3 py-2">
                <span className="sr-only">Row</span>
              </th>
              {PREVIEW_COLUMNS.map((col) => (
                <th
                  key={col.name}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-3 pb-2 pt-2.5 align-bottom font-normal transition-colors duration-150',
                    col.numeric ? 'text-right' : 'text-left',
                    activeColumn === col.name && 'bg-mark/30',
                  )}
                >
                  <span className="block font-mono text-[12.5px] font-medium text-fg">
                    {col.name}
                  </span>
                  <span className="block text-[11px] text-muted">{col.type}</span>
                  <MissingBar pct={col.missingPct} alignRight={col.numeric} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {PREVIEW_ROWS.map((row, r) => (
              <tr key={row.id} className={cn(r % 2 === 1 && 'bg-surface-2/60')}>
                <td className="px-3 py-1.5 text-right text-muted">{row.id}</td>
                {row.cells.map((cell, c) => {
                  const markId = row.marks[c];
                  const col = PREVIEW_COLUMNS[c];
                  return (
                    <td
                      key={c}
                      className={cn(
                        'whitespace-nowrap px-3 py-1.5',
                        col.numeric ? 'text-right' : 'text-left',
                      )}
                    >
                      <Cell value={cell} markId={markId} active={active} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="flex items-baseline gap-2 text-[15px] font-semibold text-fg">
          Top findings
          <span className="text-[13px] font-normal text-muted">
            {PREVIEW_FINDINGS.length} of {PREVIEW.findingCount}, ranked by importance
          </span>
        </h3>
        <ul className="mt-2 border-t border-border" onMouseLeave={() => setActive(null)}>
          {PREVIEW_FINDINGS.map((f) => (
            <li key={f.id} className="border-b border-border">
              <button
                onClick={onOpen}
                onMouseEnter={() => setActive(f.id)}
                onFocus={() => setActive(f.id)}
                onBlur={() => setActive(null)}
                className={cn(
                  'grid w-full grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 py-2.5 text-left text-sm transition-colors',
                  active === f.id ? 'text-fg' : 'text-fg-secondary',
                )}
              >
                <span className="truncate font-mono text-[12.5px] text-fg">{f.column}</span>
                <span className="min-w-0">{f.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <div>
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd
        className={cn(
          'stat-value mt-0.5 text-2xl font-semibold leading-none',
          tone === 'warning' ? 'text-warning-text' : 'text-fg',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function MissingBar({ pct, alignRight }: { pct: number; alignRight: boolean }) {
  const high = pct > 20;
  return (
    <span className={cn('mt-1.5 flex items-center gap-1.5', alignRight && 'justify-end')}>
      <span className="h-[3px] w-12 overflow-hidden rounded-full bg-surface-2">
        <span
          className={cn('block h-full', high ? 'bg-warning' : 'bg-fg-secondary/60')}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={cn('text-[11px] tabular', high ? 'text-warning-text' : 'text-muted')}>
        {pct}%
      </span>
    </span>
  );
}

function Cell({
  value,
  markId,
  active,
}: {
  value: string;
  markId?: string;
  active: string | null;
}) {
  const empty = value === '';
  const content = empty ? (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">missing</span>
    </>
  ) : (
    value
  );

  if (!markId) {
    return <span className={cn(empty && 'text-muted/70')}>{content}</span>;
  }

  // At rest every mark shows softly; pointing at a finding isolates its cells.
  const state = active === null ? 'rest' : active === markId ? 'on' : 'off';
  return (
    <mark
      className={cn(
        'rounded-[2px] px-1 py-px transition-colors duration-150',
        // Dark paper: a translucent mark goes muddy and fails contrast, so use the solid one.
        state === 'rest' && 'bg-mark/55 text-mark-fg dark:bg-mark',
        state === 'on' && 'bg-mark text-mark-fg',
        state === 'off' && 'bg-transparent text-fg',
      )}
    >
      {content}
    </mark>
  );
}
