import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark',
        className,
      )}
    >
      {children}
    </div>
  );
}
