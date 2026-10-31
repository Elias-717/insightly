'use client';

import { Logo } from './Logo';
import { useTheme } from '@/components/providers/ThemeProvider';

export function Header({
  onReset,
  onShowShortcuts,
  showReset,
}: {
  onReset?: () => void;
  onShowShortcuts: () => void;
  showReset: boolean;
}) {
  const { theme, toggle } = useTheme();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2"
          aria-label="Insightlet home"
          disabled={!showReset}
        >
          <Logo size={30} className="text-slate-800 dark:text-slate-100" />
          <span className="text-lg font-extrabold tracking-tight">Insightlet</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowShortcuts}
            aria-label="Keyboard shortcuts"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium dark:border-slate-700"
          >
            ?
          </button>
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {showReset && (
            <button
              onClick={onReset}
              className="rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white"
            >
              New file
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
