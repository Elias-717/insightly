'use client';

import { Keyboard, Moon, Sun, FilePlus2 } from 'lucide-react';
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
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const iconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-control border border-border text-muted transition-colors hover:bg-surface-2 hover:text-fg';

  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2"
          aria-label="Insightlet home"
          disabled={!showReset}
        >
          <Logo size={26} className="text-fg" />
          <span className="text-base font-semibold tracking-tightish">Insightlet</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowShortcuts}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
            className={iconBtn}
          >
            <Keyboard size={18} aria-hidden="true" />
          </button>
          <button
            onClick={toggle}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
            className={iconBtn}
          >
            {theme === 'dark' ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </button>
          {showReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-control bg-accent px-3 py-2 text-sm font-medium text-accent-fg transition-colors hover:opacity-90"
            >
              <FilePlus2 size={18} aria-hidden="true" />
              New file
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
