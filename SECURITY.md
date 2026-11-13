# Security

Insightly is a privacy-first, **100% client-side** tool. It has no backend, no
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
  `frame-ancestors` limited to the site itself and the owner's portfolio (`eliasalsumairi.dev`, plus localhost for local testing). `'unsafe-eval'` is scoped to development only and is
  dropped from the production policy.
- **No inline scripts except Next.js's own.** After the build, `scripts/csp.mjs`
  replaces `script-src 'unsafe-inline'` in the exported HTML with SHA-256 hashes
  of the page's inline scripts and moves the policy to the top of `<head>`. An
  injected script is blocked. The header policy keeps `'unsafe-inline'` (hashes
  change every build), but browsers enforce both policies, so the hashed meta
  policy decides.
- **Additional headers** (`vercel.json`, kept identical to `SECURITY_HEADERS` by
  a unit test): `Strict-Transport-Security` (2 years), `Cross-Origin-Opener-Policy`
  and `Cross-Origin-Resource-Policy: same-origin`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, and a `Permissions-Policy`
  that disables camera, mic, location, payment, USB, serial, HID, MIDI, sensors,
  screen capture, and Topics. `/sw.js` is served `Cache-Control: no-cache`. Note
  that `frame-ancestors` only works as a header (browsers ignore it in `<meta>`),
  so self-hosters should set these headers too.
- **Exported HTML reports are inert.** Each report carries its own policy
  (`default-src 'none'`, inline styles only): no scripts, no network, even if
  escaping ever missed something.
- **File contents are treated as untrusted keys.** Column names never index plain
  objects (`Object.hasOwn`, null-prototype lookups, `Map`), so headers such as
  `constructor` or `__proto__` are profiled like any other column.
- **Closing a file clears it.** "New file" drops the dataset and terminates the
  parsing worker; nothing was ever persisted.
- **External links** use `rel="noopener noreferrer"`.
- **Self-hosted fonts** via `next/font` — no third-party font/CDN requests.
- **No analytics or trackers.**
- **Service worker caches app files only.** `out/sw.js` precaches the static
  export for offline use and handles same-origin `GET` requests only. CSVs are
  read from disk by the page and never pass through it or into its cache.

## Verify privacy yourself

Open DevTools → Network, load a CSV or a sample, and use every tab. No request
carrying your file or data is made; only the app's own static assets load.

The same check runs in CI: `tests/e2e/privacy.spec.ts` loads a file containing
a unique marker, opens every tab, runs every export, and fails on any
cross-origin request, any non-GET request, any request carrying the marker, any
non-static request after load, or any CSP violation.

### What the host can still see

Your data never leaves the device, but the site's host (Vercel for the public
deployment) sees ordinary web traffic, like any website: IP address, user agent,
and which static files were requested. To avoid even that, self-host the `out/`
folder or run it locally (`npx serve out`); it then works fully offline.

## Dependency audit

Run `npm audit --omit=dev` for production dependencies.

Known remaining advisories and why they do not apply to this app:

- **Next.js server-runtime advisories** (Image Optimizer DoS, request
  smuggling in rewrites, RSC request DoS, middleware cache poisoning). These
  require a **running Next.js server** using those features. Insightly ships as
  a **static export** (`output: 'export'`) served as plain files, so none of
  these code paths run. Upgrading to the Next.js major that "fixes" them (16)
  is a breaking change with no security benefit for a static site, so we stay on
  the latest 14.2.x patch (`14.2.35`).
- **postcss (build-time), bundled inside Next.js.** Used only during the build;
  it is never shipped to the browser in the static output.

Dependabot (`.github/dependabot.yml`) opens weekly update PRs for npm packages
and GitHub Actions. Next.js majors are ignored there and planned by hand: 14.2.x
will stop receiving fixes, so a move to a supported major should be scheduled
before then.

Dependencies actively used in the browser are kept current:

- `next` → `14.2.35` (latest 14.2.x; patches the applicable advisories)
- `jspdf` → `4.2.1` (fixes path traversal, PDF/JS injection, and image DoS
  advisories present in 2.x/3.x; also pulls patched `dompurify@3.4.17`)

## Reporting

This is a portfolio project. For real deployments, report issues via the GitHub
repository's issues or security advisories.
