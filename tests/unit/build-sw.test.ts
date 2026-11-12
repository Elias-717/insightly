import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildVersion,
  generateServiceWorker,
  listFiles,
  precacheUrls,
  renderServiceWorker,
} from '../../scripts/build-sw.mjs';

const TEMPLATE = resolve(__dirname, '../../scripts/sw-template.js');

describe('build-sw', () => {
  let out: string;

  beforeEach(() => {
    out = mkdtempSync(join(tmpdir(), 'insightly-sw-'));
    mkdirSync(join(out, '_next', 'static', 'chunks'), { recursive: true });
    writeFileSync(join(out, 'index.html'), '<html></html>');
    writeFileSync(join(out, 'index.txt'), 'rsc');
    writeFileSync(join(out, '404.html'), 'not found');
    writeFileSync(join(out, 'favicon.svg'), '<svg/>');
    writeFileSync(join(out, '_next', 'static', 'chunks', 'main-abc.js'), 'console.log(1)');
  });

  afterEach(() => {
    rmSync(out, { recursive: true, force: true });
  });

  it('lists files with forward slashes, sorted', () => {
    expect(listFiles(out)).toEqual([
      '404.html',
      '_next/static/chunks/main-abc.js',
      'favicon.svg',
      'index.html',
      'index.txt',
    ]);
  });

  it('maps index.html to / and skips files that should not be precached', () => {
    const urls = precacheUrls(['404.html', 'favicon.svg', 'index.html', 'index.txt', 'sw.js']);
    expect(urls).toEqual(['/favicon.svg', '/']);
  });

  it('changes the version when any precached file changes, and only then', () => {
    const before = buildVersion(out, listFiles(out));
    expect(buildVersion(out, listFiles(out))).toBe(before);

    writeFileSync(join(out, '404.html'), 'changed but skipped');
    expect(buildVersion(out, listFiles(out))).toBe(before);

    writeFileSync(join(out, '_next', 'static', 'chunks', 'main-abc.js'), 'console.log(2)');
    expect(buildVersion(out, listFiles(out))).not.toBe(before);
  });

  it('fills every placeholder in the real template', () => {
    const rendered = renderServiceWorker(readFileSync(TEMPLATE, 'utf8'), 'v1', ['/', '/a.js']);
    expect(rendered).not.toContain('__VERSION__');
    expect(rendered).not.toContain('__PRECACHE__');
    expect(rendered).toContain("const VERSION = 'v1';");
    expect(rendered).toContain('"/a.js"');
  });

  it('refuses a template with a missing or repeated placeholder', () => {
    expect(() => renderServiceWorker('const PRECACHE = __PRECACHE__;', 'v1', [])).toThrow(
      /__VERSION__/,
    );
    expect(() => renderServiceWorker('// __VERSION__\n__VERSION__ __PRECACHE__', 'v1', [])).toThrow(
      /found 2/,
    );
  });

  it('writes sw.js into the output folder and does not precache itself on a rebuild', () => {
    const first = generateServiceWorker(out, TEMPLATE);
    const sw = readFileSync(join(out, 'sw.js'), 'utf8');
    expect(sw).toContain(first.version);
    expect(first.urls).toEqual(['/_next/static/chunks/main-abc.js', '/favicon.svg', '/']);

    const second = generateServiceWorker(out, TEMPLATE);
    expect(second).toEqual(first);
  });
});
