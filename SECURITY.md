# Security

Insightlet is a privacy-first, **100% client-side** tool. It has no backend, no
database, and makes no network requests with user data. A CSV is read, parsed
(in a Web Worker), analyzed, and rendered entirely in the browser. This shapes
the threat model: the main risks are client-side (XSS, unsafe rendering of
file-derived content, supply-chain) rather than server-side.

## Controls in place

- **No `dangerouslySetInnerHTML`.** Every cell value is rendered as plain text.
  The HTML report builder escapes all interpolated strings.
- **CSV formula-injection protection.** Exported CSV prefixes cells beginning
  with `= + - @` to stop spreadsheet formula execution (`neutralizeFormula`).
- **Content-Security-Policy** delivered via `<meta>` (and exported as
  `SECURITY_HEADERS` in `next.config.mjs` for the CDN/edge): `default-src 'self'`,
  `connect-src 'self'` (no outbound data), `object-src 'none'`,
  `frame-ancestors 'none'`. `'unsafe-eval'` is scoped to development only and is
  dropped from the production policy.
- **Additional headers:** `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy` disabling camera/mic/
  geolocation, and `X-Frame-Options: DENY`.
- **External links** use `rel="noopener noreferrer"`.
- **Self-hosted fonts** via `next/font` — no third-party font/CDN requests.
- **No analytics or trackers.**

## Verify privacy yourself

Open DevTools → Network, load a CSV or a sample, and use every tab. No request
carrying your file or data is made; only the app's own static assets load.

## Dependency audit

Run `npm audit --omit=dev` for production dependencies.

Known remaining advisories and why they do not apply to this app:

- **Next.js server-runtime advisories** (Image Optimizer DoS, request
  smuggling in rewrites, RSC request DoS, middleware cache poisoning). These
  require a **running Next.js server** using those features. Insightlet ships as
  a **static export** (`output: 'export'`) served as plain files, so none of
  these code paths run. Upgrading to the Next.js major that "fixes" them (16)
  is a breaking change with no security benefit for a static site, so we stay on
  the latest 14.2.x patch (`14.2.35`).
- **postcss (build-time), bundled inside Next.js.** Used only during the build;
  it is never shipped to the browser in the static output.

Dependencies actively used in the browser are kept current:

- `next` → `14.2.35` (latest 14.2.x; patches the applicable advisories)
- `jspdf` → `4.2.1` (fixes path traversal, PDF/JS injection, and image DoS
  advisories present in 2.x/3.x; also pulls patched `dompurify@3.4.17`)

## Reporting

This is a portfolio project. For real deployments, report issues via the GitHub
repository's issues or security advisories.
