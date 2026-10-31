'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info';

const TOAST_ICON: Record<ToastKind, LucideIcon> = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = (counter += 1);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'animate-fade-in flex items-center gap-2 rounded-control border border-border bg-surface px-4 py-3 text-sm font-medium shadow-popover',
                t.kind === 'success' && 'text-success-text',
                t.kind === 'error' && 'text-danger-text',
                t.kind === 'info' && 'text-info-text',
              )}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="text-fg">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
