'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

/** Global error boundary with a friendly fallback. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging without crashing the app.
    console.error('Insightlet caught an error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo size={48} className="text-muted" />
      <div>
        <h1 className="text-xl font-semibold tracking-tightish">Something slipped.</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Insightlet hit an unexpected error, but your data never left your browser. Try again or
          reload with a fresh file.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:opacity-90"
      >
        <RotateCcw size={18} aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
