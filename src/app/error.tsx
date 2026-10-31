'use client';

import { useEffect } from 'react';
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
      <Logo size={56} className="text-slate-400" />
      <div>
        <h1 className="text-2xl font-bold">Something slipped.</h1>
        <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
          Insightlet hit an unexpected error, but your data never left your browser. Try again or
          reload with a fresh file.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-soft transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
