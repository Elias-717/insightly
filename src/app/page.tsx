'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useCsvParser } from '@/hooks/useCsvParser';
import { useTheme } from '@/components/providers/ThemeProvider';
import { getSample } from '@/data/samples';
import type { DataTableHandle } from '@/components/panels/DataTablePanel';

export default function HomePage() {
  const { state, parse, parseText, cancel, reset } = useCsvParser();
  const { toggle } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const tableRef = useRef<DataTableHandle>(null);

  const onSample = useCallback(
    (id: 'grades' | 'sales' | 'messy') => {
      const sample = getSample(id);
      parseText(sample.fileName, sample.csv);
    },
    [parseText],
  );

  // Global keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }
      if (typing) return;
      if (e.key === '/') {
        e.preventDefault();
        tableRef.current?.focusSearch();
      } else if (e.key === 'd') {
        toggle();
      } else if (e.key === '?') {
        setShowShortcuts((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const hasData = state.status === 'done' && state.dataset;

  return (
    <div className="min-h-screen">
      <Header
        onReset={reset}
        onShowShortcuts={() => setShowShortcuts(true)}
        showReset={Boolean(hasData)}
      />

      <main>
        {hasData ? (
          <Dashboard raw={state.dataset!} tableRef={tableRef} />
        ) : state.status === 'parsing' ? (
          <div className="mx-auto max-w-7xl px-4 py-10">
            <DashboardSkeleton />
          </div>
        ) : (
          <Hero state={state} onFile={parse} onSample={onSample} onCancel={cancel} />
        )}
      </main>

      <footer className="no-print border-t border-border py-6 text-center text-sm text-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4">
          <a
            href="https://github.com/Elias-717/insightly"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-fg hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.4-2.69 5.37-5.25 5.66.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <span className="tabular">v1.0.0</span>
          <span aria-hidden="true">·</span>
          <span>Open source, MIT license</span>
        </div>
      </footer>

      <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
