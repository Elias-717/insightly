/*
 * Generates `out/sw.js` from `scripts/sw-template.js` after `next build`.
 *
 * The precache list is every file in the static export, and the cache version
 * is a hash of their contents, so each deploy gets a fresh cache and the
 * browser picks up the new worker. Runs automatically as the `postbuild` script.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Export files that should not be precached. */
const SKIP = new Set([
  'sw.js', // the worker itself
  '404.html', // never navigated to directly
  'index.txt', // React Server Component payload; only used for client-side routing
]);

/** Recursively list files under `dir` as sorted, forward-slash relative paths. */
export function listFiles(dir) {
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(relative(dir, full).split(sep).join('/'));
    }
  };
  walk(dir);
  return files.sort();
}

/** Map export file paths to the URLs the browser will request. */
export function precacheUrls(files) {
  return files
    .filter((file) => !SKIP.has(file))
    .map((file) => (file === 'index.html' ? '/' : `/${file}`));
}

/** Short content hash over every file, so any change produces a new version. */
export function buildVersion(dir, files) {
  const hash = createHash('sha256');
  for (const file of files) {
    if (SKIP.has(file)) continue;
    hash.update(file);
    hash.update(readFileSync(join(dir, file)));
  }
  return hash.digest('hex').slice(0, 12);
}

/** Fill the template's placeholders; each must appear exactly once. */
export function renderServiceWorker(template, version, urls) {
  const values = { __VERSION__: version, __PRECACHE__: JSON.stringify(urls, null, 2) };
  let output = template;
  for (const [placeholder, value] of Object.entries(values)) {
    const count = output.split(placeholder).length - 1;
    if (count !== 1) {
      throw new Error(`sw-template.js must contain ${placeholder} exactly once (found ${count})`);
    }
    output = output.replace(placeholder, () => value);
  }
  return output;
}

/** Write `<outDir>/sw.js` and return what was generated. */
export function generateServiceWorker(outDir, templatePath) {
  const files = listFiles(outDir);
  const urls = precacheUrls(files);
  const version = buildVersion(outDir, files);
  const template = readFileSync(templatePath, 'utf8');
  writeFileSync(join(outDir, 'sw.js'), renderServiceWorker(template, version, urls));
  return { version, urls };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { version, urls } = generateServiceWorker(
    join(root, 'out'),
    join(root, 'scripts', 'sw-template.js'),
  );
  console.log(`sw.js: version ${version}, ${urls.length} files precached`);
}
