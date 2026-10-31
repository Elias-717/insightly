'use client';

const SHORTCUTS = [
  { keys: '/', description: 'Focus the table search' },
  { keys: 'd', description: 'Toggle dark mode' },
  { keys: '?', description: 'Open this shortcuts dialog' },
  { keys: 'Esc', description: 'Close dialogs' },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold">Keyboard shortcuts</h2>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between">
              <span className="text-sm text-muted">{s.description}</span>
              <kbd className="rounded-control border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-control bg-accent py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
