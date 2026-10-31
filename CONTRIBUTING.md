# Contributing

Thanks for your interest in Insightlet. This is a small, focused project; the bar
is simply that changes keep the suite green and the types strict.

## Getting started

```bash
npm install
npm run dev
```

## Before you open a PR

Run the full gate locally:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Conventions

- **TypeScript strict, no `any`.** Shared domain types live in `src/types`.
- **Keep analysis pure.** Everything in `src/lib/analysis` and `src/lib/insights`
  must be free of React and side effects so it stays unit-testable.
- **One insight rule per file.** Add the rule under `src/lib/insights/rules/`,
  register it in `src/lib/insights/index.ts`, and add a test under
  `tests/unit/insights/` with a triggering and a non-triggering case.
- **Conventional commits.** For example `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- **Add tests for new behavior** and update `TEST_REPORT.md` if coverage or counts
  change meaningfully.

## Project layout

See the "Folder structure" section in [README.md](README.md) and the architecture
notes in [AGENTS.md](AGENTS.md).
