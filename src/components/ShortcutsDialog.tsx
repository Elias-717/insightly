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
        className="animate-scale-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">Keyboard shortcuts</h2>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">{s.description}</span>
              <kbd className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-800">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-brand-gradient py-2 font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
