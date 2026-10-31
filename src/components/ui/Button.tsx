import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg px-4 py-2 hover:opacity-90',
  secondary:
    'border border-border bg-surface px-3 py-2 text-fg hover:bg-surface-2',
  ghost: 'px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg',
};

/** Shared button with one accent for primary and neutral borders elsewhere. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
});
