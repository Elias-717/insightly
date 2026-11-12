import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS } from '../../next.config.mjs';

interface VercelHeaders {
  headers: { source: string; headers: { key: string; value: string }[] }[];
}

const vercel = JSON.parse(
  readFileSync(resolve(__dirname, '../../vercel.json'), 'utf8'),
) as VercelHeaders;

describe('security headers', () => {
  it('vercel.json sends exactly the headers exported from next.config.mjs', () => {
    const all = vercel.headers.find((h) => h.source === '/(.*)');
    const sent = Object.fromEntries((all?.headers ?? []).map((h) => [h.key, h.value]));
    expect(sent).toEqual(SECURITY_HEADERS);
  });

  it('keeps the essentials in place', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('unsafe-eval');
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toMatch(/max-age=\d{8,}/);
    expect(SECURITY_HEADERS['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(SECURITY_HEADERS['Permissions-Policy']).not.toContain('interest-cohort');
  });

  it('never lets a stale service worker be served from the HTTP cache', () => {
    const sw = vercel.headers.find((h) => h.source === '/sw.js');
    expect(sw?.headers).toContainEqual({ key: 'Cache-Control', value: 'no-cache' });
  });
});
