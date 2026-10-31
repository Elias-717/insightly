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
      className={cn('rounded-card border border-border bg-surface p-4', className)}
    >
      {children}
    </div>
  );
}
