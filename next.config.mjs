// 'unsafe-eval' is only needed by the Next.js dev runtime; drop it in production.
const scriptSrc =
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

// For static export (`output: 'export'`) the headers() config is not applied at
// build time, so the Content-Security-Policy and X-Content-Type-Options are
// delivered via <meta> tags in the root layout. Hosts should ALSO set the full
// header set below at the CDN/edge. This array is exported for that purpose and
// documented in the README "Verify privacy" section.
//
// The header CSP keeps script-src 'unsafe-inline' because inline-script hashes
// change every build. The exported HTML also carries a <meta> CSP with those
// hashes instead (scripts/csp.mjs); browsers enforce both policies, so only the
// hashed scripts can run. `tests/unit/security-headers.test.ts` keeps
// vercel.json in sync with this object.
export const SECURITY_HEADERS = {
  'Content-Security-Policy': csp,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': [
    'accelerometer=()',
    'browsing-topics=()',
    'camera=()',
    'display-capture=()',
    'geolocation=()',
    'gyroscope=()',
    'hid=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'serial=()',
    'usb=()',
  ].join(', '),
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export (deployable to any static host) reinforces the privacy story.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
