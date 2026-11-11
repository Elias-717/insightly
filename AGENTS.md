# AGENTS.md

Orientation for AI agents and developers working on Insightly. Read this before
making changes so your edits match how the project actually works.

## What this project is

Insightly is a privacy-first, browser-only CSV data-profiling web app. A user
drops in a CSV/TSV and gets column types, a quality score, per-column stats,
charts, a correlation heatmap, and ranked plain-English insights. There is **no
backend and no database** — everything runs in the browser, and the app exports to
a static site.

Tagline: "Drop a CSV. Get the story."

## Tech stack

- Next.js 14 (App Router), static export (`output: 'export'` in `next.config.mjs`)
- TypeScript strict, no `any`
- Tailwind CSS
- Recharts (charts), @tanstack/react-virtual (table), Papaparse (CSV in a Worker),
  jsPDF + html2canvas (PDF)
- Vitest + React Testing Library (unit/component), fast-check (property-based),
  Playwright + @axe-core/playwright (E2E + a11y)

## Architecture and where things live

```
src/
├── app/            # Next.js layout, page, global error boundary, metadata, CSS
├── components/
│   ├── charts/     # Histogram, CategoryBar, ScatterChart, TimeSeries,
│   │               # CorrelationHeatmap, BoxSummary, ChartFrame (PNG export wrapper)
│   ├── panels/     # One component per dashboard tab + ColumnDetail
│   ├── providers/  # ThemeProvider (dark mode), ToastProvider
│   └── ui/         # Logo, Card, Badge, Header, Sparkline, Skeleton
├── data/samples.ts # three built-in sample datasets (CSV strings)
├── hooks/          # useCsvParser — owns the Web Worker, validation, progress
├── lib/
│   ├── analysis/   # PURE engine: clean-value, delimiter, detect-type, stats,
│   │               # correlation, duplicates, profile-column, quality-score,
│   │               # cleaning, analyze (orchestrator)
│   ├── export/     # csv, markdown, html, pdf
│   ├── insights/   # types, index (runner + registry), rules/<one per rule>
│   └── overview/   # pure presentation helpers for the Overview screen (summary,
│                   # missing breakdown, quality reasons/verdict) — no analysis logic
├── types/index.ts  # shared domain types (single source of truth)
└── workers/csv.worker.ts  # Papaparse parsing off the main thread
```

Security posture and the dependency rationale (why we stay on Next 14.2.x for a
static export, patched jsPDF, CSP/headers) are documented in `SECURITY.md`.

### Key design rules (do not break these)

1. **`src/lib/analysis` and `src/lib/insights` are pure and React-free.** No DOM,
   no I/O, no React imports. This is what makes them testable and reusable. The UI
   only renders their output.
2. **The analyze pipeline is `analyzeDataset(raw, overrides?) -> Dataset`.** Type
   overrides are passed in and the whole thing recomputes (memoized in the
   Dashboard). Do not mutate datasets in place.
3. **One insight rule per file** under `src/lib/insights/rules/`. A rule is a pure
   `(dataset: Dataset) => Insight[]`. Register it in `src/lib/insights/index.ts`
   (the `INSIGHT_RULES` array). `runInsights` flattens, ranks by severity then
   importance, and caps the list.
4. **Parsing happens only in the Worker** (`src/workers/csv.worker.ts`), driven by
   `useCsvParser`. The worker strips a BOM, detects the delimiter, normalizes row
   shape, reports progress, and has a 30s timeout.
5. **Shared types live in `src/types`.** Reuse `Dataset`, `ColumnProfile`,
   `Insight`, etc. Don't invent parallel shapes.

## How it was built (history)

The app was scaffolded and implemented in phases (see git log): tooling →
analysis engine → insights → export/worker/data → UI components → dashboard wiring
→ then a full test suite.

## Testing (current state)

- **187** Vitest tests: unit (`tests/unit`, plus top-level `tests/*.test.ts`),
  edge cases (`tests/edge`), property-based (`tests/property`, fast-check), and
  component (`tests/components`).
- **12** Playwright tests (`tests/e2e`): an end-to-end flow and axe accessibility
  scans, each on desktop and a 375px mobile viewport.
- **1** performance smoke test (`tests/performance`, run via `npm run test:perf`):
  generates a 50k × 30 dataset in memory and asserts analysis < 5s.
- Coverage of `src/lib` is ~95.2% statements / 100% functions, with enforced
  thresholds (90% for analysis & insights, 70% overall) in `vitest.config.ts`.

Commands:

```bash
npm test               # fast feedback, no browser
npm run test:coverage  # enforces thresholds
npm run test:perf      # 50k x 30 budget check
npm run test:e2e       # needs: npm run test:e2e:install first
```

Test helpers live in `tests/helpers.ts` (`rawFromCsv`, `rawFromFixture`,
`readFixture`). jsdom gaps (matchMedia, ResizeObserver) are stubbed in
`tests/setup.ts`. Fixtures are in `tests/fixtures/`.

## Bug fixes made while adding tests

Two minimal production fixes, both revealed by tests and documented in
`TEST_REPORT.md`:

1. **CSV formula injection** — `toCsv` now prefixes `'` to cells starting with
   `= + - @` (`neutralizeFormula` in `src/lib/analysis/cleaning.ts`).
2. **BOM handling** — `stripBom` in `src/lib/analysis/clean-value.ts`, applied in
   the worker, removes a leading U+FEFF so the first header is clean.

## Conventions and gotchas

- Strict TS, no `any`; `noUnusedLocals`/`noUnusedParameters` are on — prefix
  intentionally-unused names with `_`.
- Charts need layout dimensions and `ResizeObserver`; in tests these are stubbed.
- The data table is virtualized; in jsdom tests, assert on controls (search, sort
  headers, column toggles) rather than on specific virtualized rows unless you
  provide element dimensions.
- Export modules (`csv.ts`, `pdf.ts`) are DOM/browser-bound and excluded from unit
  coverage; they are exercised by the Playwright flow instead.
- **Windows coverage gotcha:** run `npm run test:coverage` from a path with an
  uppercase drive letter (`C:\...`). Launched from `c:\...` (as some editors do),
  v8 coverage fails to map files and reports ~48% with spurious threshold errors.
- The Overview's quality verdict (`qualityVerdict`) takes the headline severity
  from `buildOverviewSummary` so the two can never contradict each other. Keep
  them wired together if you change either.
- Conventional-commit messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Definition of done for a change

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All green, coverage thresholds satisfied, and docs updated
(`TEST_REPORT.md`, `docs/requirements.md`) when behavior or counts change.
