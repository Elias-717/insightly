import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Self-hosted via next/font — no external font requests at runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const title = 'Insightlet — Drop a CSV. Get the story.';
const description =
  'Column types, a data quality score, outliers, correlations, and plain-English insights. No upload, no account.';

export const metadata: Metadata = {
  metadataBase: new URL('https://insightlet.vercel.app'),
  title,
  description,
  applicationName: 'Insightlet',
  keywords: ['CSV', 'data profiling', 'data quality', 'analytics', 'privacy', 'browser'],
  authors: [{ name: 'Insightlet' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'Insightlet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
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
 * Delivered as a <meta> tag because static export cannot set HTTP headers; the
 * same policy plus extra headers is also configured in next.config for hosts
 * that serve it dynamically.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
