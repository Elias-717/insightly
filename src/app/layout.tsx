import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const title = 'Insightlet — Drop a CSV. Get the story.';
const description =
  'A privacy-first, browser-only data profiling tool. Drop a CSV and instantly see column types, a data quality score, statistics, charts, and plain-English insights. Your data never leaves your device.';

export const metadata: Metadata = {
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
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
