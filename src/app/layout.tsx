import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

// Self-hosted via next/font — no external font requests at runtime.
// Text: Hanken Grotesk. Data (values, file and column names, tables): JetBrains Mono.
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const title = 'Insightly — Drop a CSV. Get the story.';
const description =
  'Column types, a data quality score, outliers, correlations, and plain-English insights. No upload, no account.';

export const metadata: Metadata = {
  metadataBase: new URL('https://tryinsightly.vercel.app'),
  title,
  description,
  applicationName: 'Insightly',
  keywords: ['CSV', 'data profiling', 'data quality', 'analytics', 'privacy', 'browser'],
  authors: [{ name: 'Insightly' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'Insightly' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

/*
 * Content-Security-Policy for a fully local, static app.
 * - default-src 'self': nothing loads cross-origin by default.
 * - script-src allows inline/eval only as Next.js' hydration runtime requires;
 *   there are no third-party scripts.
 * - worker-src blob: for the CSV parsing Web Worker.
 * - connect-src 'self': no outbound network calls with user data.
 * - img-src allows data:/blob: for generated chart PNGs and downloads.
 * After `next build`, scripts/csp.mjs replaces script-src 'unsafe-inline' in the
 * exported HTML with SHA-256 hashes of the page's own inline scripts, and moves
 * this tag to the top of <head>.
 * Delivered as a <meta> tag because static export cannot set HTTP headers; the
 * same policy plus extra headers is also configured in next.config for hosts
 * that serve it dynamically.
 */
// 'unsafe-eval' is only needed by Next.js' dev runtime; the production static
// export does not require it, so we drop it in production to tighten script-src.
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
  "frame-ancestors 'self' https://eliasalsumairi.dev https://www.eliasalsumairi.dev http://localhost:3000 http://localhost:3457",
  "form-action 'self'",
].join('; ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
