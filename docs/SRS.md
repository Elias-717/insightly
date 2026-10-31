# Software Requirements Specification — Insightly

Version 1.0 · Status: implemented

## 1. Introduction

### 1.1 Purpose

This SRS describes the requirements for Insightly, a privacy-first, browser-only
data profiling tool. It is intended for developers, reviewers, and any agent or
contributor continuing the project.

### 1.2 Scope

Insightly lets a user drop in a CSV/TSV file and immediately see column types, a
data-quality score, per-column statistics, auto-generated charts, a correlation
heatmap, and plain-English insights. All processing happens in the browser; no
data is transmitted to any server. The application is a static site with no
backend and no database.

### 1.3 Definitions

- **Dataset**: the parsed file plus derived profiles, overview, quality, and
  correlation (see `src/types`).
- **Column profile**: per-column type and statistics.
- **Insight ("Whisper")**: a ranked, severity-tagged, plain-English observation.
- **Quality score**: a 0–100 blend of completeness, uniqueness, consistency, and
  outlier control.

### 1.4 References

- Functional requirements: [requirements.md](requirements.md)
- Test coverage and results: [../TEST_REPORT.md](../TEST_REPORT.md)
- Architecture for contributors: [../AGENTS.md](../AGENTS.md)

## 2. Overall description

### 2.1 Product perspective

A single-page Next.js (App Router) application exported as static files. The CSV
parser runs in a Web Worker; all analysis is pure TypeScript with no React or I/O
dependencies, which makes it deterministic and testable.

### 2.2 User classes

Students, analysts, freelancers, and developers who want a fast first look at a
dataset without uploading it anywhere.

### 2.3 Operating environment

A modern evergreen browser (Chromium, Firefox, Safari) with Web Worker support.
Development requires Node.js 20+.

### 2.4 Design and implementation constraints

- No backend, database, authentication, or third-party data transmission.
- TypeScript strict mode, no `any`.
- Analysis and insight logic must remain pure and React-free.
- Maximum input size 20 MB.
- Must remain responsive (no main-thread blocking) for files up to 50,000 rows ×
  30 columns.

### 2.5 Assumptions and dependencies

- Input is delimited text (CSV/TSV). Excel/JSON are future work.
- The browser can hold the dataset in memory; very large files are bounded by the
  20 MB limit.

## 3. Functional requirements

The complete, itemized list with IDs and status is maintained in
[requirements.md](requirements.md). Summarized by area: upload/parsing (FR-1),
type detection (FR-2), overview and quality (FR-3), per-column profiles (FR-4),
charts (FR-5), insights (FR-6), cleaning (FR-7), data table (FR-8), export (FR-9),
and UI/UX and resilience (FR-10).

## 4. External interface requirements

### 4.1 User interfaces

- A landing hero with tagline, a privacy badge, an upload zone, and sample-data
  buttons.
- A tabbed dashboard: Overview, Columns, Charts, Whispers, Clean, Data.
- Light and dark themes; responsive from 360px upward.

### 4.2 Hardware interfaces

None beyond a standard browser on desktop or mobile.

### 4.3 Software interfaces

- Papaparse (CSV parsing, in a Web Worker).
- Recharts (charts).
- @tanstack/react-virtual (table virtualization).
- jsPDF + html2canvas (PDF export).

### 4.4 Communications interfaces

None. The application makes no network requests with user data. Static assets are
served over HTTPS by the host.

## 5. Non-functional requirements

### 5.1 Performance

- Analysis of a 50,000 × 30 dataset completes in under 5 seconds (measured
  ~2.2 s). CSV parsing runs in a Web Worker and never blocks the main thread.

### 5.2 Security and privacy

- No user data leaves the browser.
- CSV export neutralizes formula-injection vectors (cells starting with
  `= + - @`).
- HTML report output escapes HTML-special characters.
- External/file content is treated as untrusted data, not code.

### 5.3 Accessibility

- Semantic HTML, labels, visible focus states, keyboard navigation, aria-live
  parsing announcements, and text alternatives for charts. Target: WCAG 2.1 AA,
  verified by automated axe scans in light and dark mode. (Full conformance also
  requires manual assistive-technology testing.)

### 5.4 Reliability

- Every failure mode (empty, wrong type, oversized, malformed, timeout, no numeric
  columns, single column) produces a friendly, specific message; a global error
  boundary prevents crashes.

### 5.5 Maintainability

- Pure, typed analysis engine; one insight rule per file; shared domain types;
  enforced test-coverage thresholds.

### 5.6 Portability

- Static export deployable to Vercel or any static host.

## 6. Verification

- Unit, edge, property-based, and component tests via Vitest (163 tests).
- End-to-end and accessibility tests via Playwright on desktop and mobile.
- A performance smoke test for the 50k × 30 budget.
- CI runs lint, typecheck, coverage, build, and Playwright on every push and PR.

See [../TEST_REPORT.md](../TEST_REPORT.md) for results.
