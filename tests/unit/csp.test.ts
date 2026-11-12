import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hardenExport, hardenHtml, hardenPolicy, inlineScriptHashes } from '../../scripts/csp.mjs';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

const POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
const encoded = POLICY.replace(/'/g, '&#x27;');

const page = (body: string) =>
  `<!DOCTYPE html><html><head><meta charSet="utf-8"/><script src="/a.js" async=""></script>` +
  `<meta http-equiv="Content-Security-Policy" content="${encoded}"/></head><body>${body}</body></html>`;

describe('csp postbuild step', () => {
  it('hashes inline scripts only, deduplicated, over their exact text', () => {
    const html = page(
      '<script>one()</script><script src="/b.js"></script><script>one()</script><script id="x">two()</script>',
    );
    expect(inlineScriptHashes(html)).toEqual([sha('one()'), sha('two()')]);
  });

  it("swaps script-src 'unsafe-inline' for hashes and leaves other directives alone", () => {
    const hardened = hardenPolicy(POLICY, ["'sha256-abc'"]);
    expect(hardened).toBe(
      "default-src 'self'; script-src 'self' 'sha256-abc'; style-src 'self' 'unsafe-inline'",
    );
  });

  it('is idempotent: a second run replaces old hashes', () => {
    const once = hardenPolicy(POLICY, ["'sha256-old'"]);
    expect(hardenPolicy(once, ["'sha256-new'"])).toContain("script-src 'self' 'sha256-new'");
    expect(hardenPolicy(once, ["'sha256-new'"])).not.toContain('old');
  });

  it('moves the policy directly after <meta charSet>, ahead of every script', () => {
    const out = hardenHtml(page('<script>boot()</script>'));
    expect(out).toContain('<meta charSet="utf-8"/><meta http-equiv="Content-Security-Policy"');
    expect(out.match(/Content-Security-Policy/g)).toHaveLength(1);
    expect(out.indexOf('Content-Security-Policy')).toBeLessThan(out.indexOf('<script'));
    expect(out).toContain(sha('boot()').replace(/'/g, '&#x27;'));
    const scriptSrc = out.match(/script-src[^;]*/)?.[0] ?? '';
    expect(scriptSrc).not.toContain('unsafe-inline');
  });

  it('fails the build when a page has no policy to harden', () => {
    expect(() => hardenHtml('<html><head></head></html>')).toThrow(/No Content-Security-Policy/);
    expect(() => hardenPolicy("default-src 'self'", [])).toThrow(/script-src/);
  });

  it('rewrites every html file in the export folder', () => {
    const dir = mkdtempSync(join(tmpdir(), 'insightly-csp-'));
    try {
      writeFileSync(join(dir, 'index.html'), page('<script>a()</script>'));
      writeFileSync(join(dir, '404.html'), page('<script>b()</script>'));
      writeFileSync(join(dir, 'other.txt'), 'untouched');
      expect(hardenExport(dir).sort()).toEqual(['404.html', 'index.html']);
      expect(readFileSync(join(dir, '404.html'), 'utf8')).toContain(
        sha('b()').replace(/'/g, '&#x27;'),
      );
      expect(readFileSync(join(dir, 'other.txt'), 'utf8')).toBe('untouched');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
