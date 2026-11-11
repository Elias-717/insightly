# Insightly — Test Report

This report documents the test suite added to the existing Insightly project. No
features were refactored or restyled. The only production-code changes were two
small, security/correctness bug fixes revealed by the tests (see below).

## Before vs After

| Metric | Before | After |
| --- | --- | --- |
| Unit/component test files | 10 | 33 |
| Total unit + component tests | 70 | 163 |
| Statement coverage (`src/lib`) | 75.37% | **95.82%** |
| `src/lib/analysis` coverage | 91.36% | **96.25%** |
| `src/lib/insights/rules` coverage | ~83% | **97.16%** |
| Function coverage | 92.64% | **100%** |
| Branch coverage | 81.56% | 88.73% |
| Property-based tests | 0 | 5 |
| Edge-case tests | partial | 16 |
| E2E tests (Playwright) | 0 | 12 (6 × desktop + mobile) |
| Accessibility scans | 0 | 4 (light/dark × landing/dashboard) |
| Performance smoke test | 0 | 1 (50k × 30) |
| Coverage thresholds enforced | no | yes (90% analysis & insights, 70% overall) |

Lint, typecheck, and build all pass before and after.

## Test types and how to run them

| Type | Command | Location |
| --- | --- | --- |
| Unit, edge, property, component | `npm test` | `tests/**/*.test.ts(x)` |
| Watch mode | `npm run test:watch` | — |
| Coverage (thresholds enforced) | `npm run test:coverage` | — |
| Performance smoke (50k × 30) | `npm run test:perf` | `tests/performance/` |
| End-to-end + accessibility | `npm run test:e2e:install` then `npm run test:e2e` | `tests/e2e/` |

## What is covered

**Unit (`tests/unit`, `tests/*.test.ts`)**

- Delimiter detection: comma, semicolon, tab, pipe.
- Type detection: integers, decimals, currency/thousands-separated numbers,
  dates (ISO, DD/MM/YYYY, MM/DD/YYYY, "Jan 5, 2024"), booleans (true/false,
  yes/no, 0/1), categories, identifiers, free text.
- Statistics: min, max, mean, median, mode, variance, std dev, percentiles,
  quartiles, IQR, skewness, zeros/negatives, histogram binning.
- Outlier detection (IQR), Pearson correlation (incl. pairwise-missing), duplicate
  detection, missing-value counting.
- Quality score and each weighted component; letter grades.
- Every insight rule has its own file in `tests/unit/insights/` with a triggering
  case and a non-triggering case, plus a runner test for ranking and capping.
- Cleaning actions: remove duplicates, drop sparse columns, trim whitespace,
  standardize casing.
- Export: CSV (quoting, escaping, **formula-injection protection**), Markdown, and
  HTML report (including HTML-escaping of column names).

**Edge cases (`tests/edge`)**

Empty dataset, single row, single column, all-missing column, all-identical values,
very large and negative numbers, unicode/emoji, mixed-type columns, very long
strings, quoted fields with commas, leading BOM, inconsistent row lengths, and a
CSV export round-trip preserving row/column counts.

**Property-based (`tests/property`, fast-check)**

- `min <= median <= max`
- correlation always in `[-1, 1]`
- quality score always in `[0, 100]`
- mean of a constant column equals that constant (relative tolerance)
- parse → re-export preserves row and column counts

**Component (`tests/components`, React Testing Library)**

Upload zone (valid file, empty/wrong-type/oversized errors, sample buttons,
cancel), quality gauge (score + grade + accessible label), whispers panel
(ordering + empty state), column type override dropdown (recompute), data table
(search, sort headers, column show/hide, per-column filter, focus handle),
dark-mode toggle (persists to localStorage, restores on mount), and a Dashboard
integration test that loads sample data and renders every tab.

**End-to-end (`tests/e2e`, Playwright) — desktop + 375px mobile**

Load app → "Try sample data" → verify Overview/Columns/Charts/Whispers/Data tabs
→ open a column detail → run a cleaning action → export a report. Plus a keyboard
shortcut test.

**Accessibility (`tests/e2e/accessibility.spec.ts`, @axe-core/playwright)**

axe scans of the landing page and dashboard in both light and dark mode, asserting
no serious or critical WCAG 2 A/AA violations.

**Performance (`tests/performance`)**

Generates a 50,000 × 30 dataset in memory (never committed) and measures parse and
analysis time. Budgets: a synchronous parse chunk under 200 ms is not relied upon
because the app parses in a Web Worker off the main thread; total analysis must be
under 5 s.

Recorded on the development machine (Node 22):

```
[perf] rows=50000 cols=30 parse=125ms analysis=2247ms insights=12
```

Analysis of 50k × 30 completes in ~2.2 s, comfortably under the 5 s budget. In the
running app, CSV parsing happens in a Web Worker, so the main thread is never
blocked regardless of file size.

## Bugs found and fixed

Both were found by new tests and fixed with the smallest possible change.

1. **CSV formula injection (security).** `toCsv` in `src/lib/analysis/cleaning.ts`
   did not neutralize cells beginning with `=`, `+`, `-`, or `@`. Such cells can be
   executed as formulas when the exported CSV is opened in a spreadsheet. Fix: a
   `neutralizeFormula` helper prefixes a single quote to those cells before
   serialization. No change to the in-memory data model or any UI behavior.

2. **UTF-8 BOM handling.** A leading byte-order mark (U+FEFF) was left attached to
   the first header name, corrupting its column name and type detection. Fix: a
   pure `stripBom` helper in `src/lib/analysis/clean-value.ts`, applied in the CSV
   worker before parsing (and mirrored in the test helper). Added
   `tests/fixtures/bom.csv` to lock in the behavior.

## Flakiness

The full Vitest suite was run three times consecutively: 163/163 passing each time (at the time of this report; the suite is now 187 tests, see below)
with no flaky tests.

## Fixtures

`tests/fixtures/`: `clean.csv`, `messy.csv`, `empty.csv`, `one-column.csv`,
`semicolon.csv`, `bom.csv`, `unicode.csv`.

## Changes since this report

UI work on the Overview, Columns, and landing screens added 15 tests (suite now **198** passing):

- `tests/components/Dashboard.test.tsx`: the Overview shows up to four top
  findings, and clicking one navigates to its column or chart.
- `tests/unit/overview-summary.test.ts`: `qualityVerdict` is capped by the
  headline severity, and a messy dataset never gets an "Excellent" verdict next
  to a warning headline (previously a 92-scoring file with 15% missing cells
  showed both).

Coverage of `src/lib` is now 95.19% statements / 89.82% branches / 100%
functions; all thresholds pass.

**Windows note:** run coverage from a path with an uppercase drive letter
(`C:\...`). From a lowercase `c:\...` working directory, v8 coverage fails to
map source files and reports ~48% with false threshold failures.

Columns tab (`tests/components/ColumnsPanel.test.tsx`, +3): the first column's
detail opens by default, a column highlighted from an insight opens its detail,
and each column's type is shown once (the badge-styled override dropdown).

Landing page (+8): `tests/unit/preview.test.ts` recomputes the messy sample's
report with the real engine and checks every figure, column type, row, and
finding shown in the static landing preview; `tests/components/SamplePreview.test.tsx`
covers the finding-to-cell highlighting and the "open the full report" actions.

### Playwright status

Before this UI work, 9 of the 12 Playwright tests were failing (axe violations
on the landing page and dashboard, plus the flow test). Fixed since:

- File input had no accessible name and sat inside the `role="button"` drop area
  (`label`, `nested-interactive`). It now has a label and lives outside it.
- The landing table's horizontal scroll area was not keyboard-reachable
  (`scrollable-region-focusable`). It is now a labelled, focusable region.
- Dashboard contrast failures in dark mode, resolved by the new color tokens.

Still failing (both viewports): the flow test's "open column → Numeric
statistics" step. This is a real type-detection bug, not a test problem:
`detectColumnType` labels any integer column whose values are all unique (and
has more than 10 rows) an `identifier`, so `score` in the grades sample is
profiled as an ID. Not fixed here because it changes analysis behavior.

The accessibility scans run with `reducedMotion: 'reduce'` so axe checks the
settled page; mid-animation, fading text is partly transparent and would be
reported as low contrast.

The keyboard-shortcut test and the mobile dashboard scan are timing-sensitive
when the whole suite runs in parallel: both passed 16/16 when repeated alone.
