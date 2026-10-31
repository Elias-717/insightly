# Insightlet — Functional Requirements

Each requirement has a stable ID (FR-x). Status reflects the current build.
Requirements marked **Done** have corresponding implementation and, where
applicable, automated tests.

## 1. Upload and parsing

| ID | Requirement | Status |
| --- | --- | --- |
| FR-1.1 | Accept `.csv` and `.tsv` via drag-and-drop and a file picker. | Done |
| FR-1.2 | Auto-detect the delimiter (comma, semicolon, tab, pipe). | Done |
| FR-1.3 | Parse inside a Web Worker so the UI never freezes. | Done |
| FR-1.4 | Show parsing progress (row count) and a Cancel button. | Done |
| FR-1.5 | Enforce a 20 MB file-size limit with a friendly message. | Done |
| FR-1.6 | Strip a leading UTF-8 BOM before parsing. | Done |
| FR-1.7 | Provide three built-in sample datasets. | Done |
| FR-1.8 | Count and report malformed/skipped rows. | Done |

## 2. Type detection

| ID | Requirement | Status |
| --- | --- | --- |
| FR-2.1 | Detect number, integer, text, category, boolean, date, identifier. | Done |
| FR-2.2 | Category = text with < 20 unique or < 5% unique. | Done |
| FR-2.3 | Identifier = almost fully unique column. | Done |
| FR-2.4 | Recognize ISO, DD/MM/YYYY, MM/DD/YYYY, and "Jan 5, 2024" dates. | Done |
| FR-2.5 | Recognize true/false, yes/no, 0/1 as boolean. | Done |
| FR-2.6 | Parse currency symbols and thousands separators as numeric. | Done |
| FR-2.7 | Allow manual per-column type override with instant recompute. | Done |

## 3. Overview and quality

| ID | Requirement | Status |
| --- | --- | --- |
| FR-3.1 | Show rows, columns, missing cells (count + %), duplicates (count + %), size, and per-type counts. | Done |
| FR-3.2 | Compute a transparent 0–100 quality score from completeness, uniqueness, consistency, and outliers. | Done |
| FR-3.3 | Display the score as a circular gauge with a letter grade. | Done |
| FR-3.4 | Provide a "How is this calculated?" breakdown of each component and weight. | Done |

## 4. Per-column profiles

| ID | Requirement | Status |
| --- | --- | --- |
| FR-4.1 | Numeric: min, max, mean, median, mode, std, variance, Q1, Q3, IQR, skewness, outliers, zeros, negatives. | Done |
| FR-4.2 | Category/boolean: unique count, top 5 values with %, rare-value note. | Done |
| FR-4.3 | Date: earliest, latest, span, most common weekday and month. | Done |
| FR-4.4 | Text: average length, longest, shortest, empty-string count. | Done |
| FR-4.5 | Every column: missing %, unique count, and a mini sparkline. | Done |

## 5. Charts

| ID | Requirement | Status |
| --- | --- | --- |
| FR-5.1 | Histogram per numeric column with adjustable bin count. | Done |
| FR-5.2 | Bar chart per category (top 10 + "Other"). | Done |
| FR-5.3 | Time series with column and aggregation selectors (day/week/month; sum/mean/count). | Done |
| FR-5.4 | Scatter plot for any two numeric columns. | Done |
| FR-5.5 | Pearson correlation heatmap with legend and hover tooltips. | Done |
| FR-5.6 | Box/outlier summary per numeric column. | Done |
| FR-5.7 | Each chart has a text summary and a Download PNG button. | Done |

## 6. Insights ("Whispers")

| ID | Requirement | Status |
| --- | --- | --- |
| FR-6.1 | Generate 8–12 plain-English insights via rule-based logic. | Done |
| FR-6.2 | Tag each with severity (Info, Warning, Discovery) and rank by importance. | Done |
| FR-6.3 | Each rule is a pure function in its own file. | Done |
| FR-6.4 | Clicking an insight scrolls to the related column or chart. | Done |

## 7. Cleaning

| ID | Requirement | Status |
| --- | --- | --- |
| FR-7.1 | Remove duplicate rows. | Done |
| FR-7.2 | Drop columns more than 50% empty. | Done |
| FR-7.3 | Trim whitespace. | Done |
| FR-7.4 | Standardize casing for a category column. | Done |
| FR-7.5 | Show before/after quality score. | Done |
| FR-7.6 | Download cleaned data as CSV (with formula-injection protection). | Done |

## 8. Data table

| ID | Requirement | Status |
| --- | --- | --- |
| FR-8.1 | Global search across all columns. | Done |
| FR-8.2 | Click-to-sort and per-column filter. | Done |
| FR-8.3 | Virtualization that stays smooth at 50,000 rows. | Done |
| FR-8.4 | Sticky header and column show/hide. | Done |
| FR-8.5 | Highlight missing cells and outliers. | Done |

## 9. Export

| ID | Requirement | Status |
| --- | --- | --- |
| FR-9.1 | Export a PDF report (cover, overview, quality, columns, charts, insights). | Done |
| FR-9.2 | Export a standalone HTML report. | Done |
| FR-9.3 | Export insights as Markdown, copyable to clipboard. | Done |

## 10. UI/UX and resilience

| ID | Requirement | Status |
| --- | --- | --- |
| FR-10.1 | Light/dark mode toggle that remembers the choice and respects system preference. | Done |
| FR-10.2 | Responsive down to 360px; table scrolls horizontally on mobile. | Done |
| FR-10.3 | Empty state, loading skeletons, result animations, toasts. | Done |
| FR-10.4 | Tabs: Overview, Columns, Charts, Whispers, Clean, Data. | Done |
| FR-10.5 | Keyboard shortcuts: `/` search, `d` dark mode, `?` shortcuts dialog. | Done |
| FR-10.6 | Friendly, specific error messages for every failure mode. | Done |
| FR-10.7 | Global error boundary with a friendly fallback. | Done |
