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

      <footer className="no-print border-t border-slate-200 py-6 text-center text-sm text-slate-400 dark:border-slate-800">
        Insightlet · Built for a fast first look at your data · Runs entirely in your browser
      </footer>

      <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
