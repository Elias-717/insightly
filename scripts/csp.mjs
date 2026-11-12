/*
 * Tightens the Content-Security-Policy in the static export after `next build`.
 *
 * Next.js writes a few inline <script> tags into each page (hydration data), so
 * the policy in `src/app/layout.tsx` has to allow `'unsafe-inline'`, which would
 * also let an injected script run. This step hashes the exact inline scripts in
 * each HTML file and replaces `'unsafe-inline'` with those hashes. Only the
 * scripts Next.js generated can run.
 *
 * It also moves the CSP <meta> to just after <meta charset>, because a meta
 * policy only applies to elements that come after it.
 *
 * Runs as part of `postbuild`, before `build-sw.mjs` (the service worker's
 * cache version must reflect the rewritten HTML).
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CSP_META = /<meta http-equiv="Content-Security-Policy" content="([^"]*)"\s*\/?>/i;
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const CHARSET_META = /<meta charSet="utf-8"\s*\/?>/i;

/** `'sha256-…'` source expressions for every inline script, in order, deduplicated. */
export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const digest = createHash('sha256').update(match[1], 'utf8').digest('base64');
    hashes.add(`'sha256-${digest}'`);
  }
  return [...hashes];
}

const decode = (s) =>
  s
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
const encode = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

/** Replace `'unsafe-inline'` (and any earlier hashes) in script-src with `hashes`. */
export function hardenPolicy(policy, hashes) {
  let found = false;
  const directives = policy.split(';').map((directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    if (name !== 'script-src') return directive.trim();
    found = true;
    const kept = sources.filter((s) => s !== "'unsafe-inline'" && !s.startsWith("'sha256-"));
    return [name, ...kept, ...hashes].join(' ');
  });
  if (!found) throw new Error('CSP has no script-src directive');
  return directives.join('; ');
}

/** Rewrite one HTML document. Throws if it has no CSP meta to harden. */
export function hardenHtml(html) {
  const meta = html.match(CSP_META);
  if (!meta) throw new Error('No Content-Security-Policy <meta> found');
  const policy = hardenPolicy(decode(meta[1]), inlineScriptHashes(html));
  const tag = `<meta http-equiv="Content-Security-Policy" content="${encode(policy)}"/>`;

  const without = html.replace(meta[0], '');
  const charset = without.match(CHARSET_META);
  if (charset) return without.replace(charset[0], `${charset[0]}${tag}`);
  return without.replace(/<head>/i, `<head>${tag}`);
}

/** Harden every .html file directly in `outDir`; returns the files changed. */
export function hardenExport(outDir) {
  const files = readdirSync(outDir).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const path = join(outDir, file);
    writeFileSync(path, hardenHtml(readFileSync(path, 'utf8')));
  }
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = fileURLToPath(new URL('../out', import.meta.url));
  const files = hardenExport(out);
  console.log(`csp: script hashes applied to ${files.join(', ')}`);
}
