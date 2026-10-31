import { cn } from '@/lib/utils';
import type { ColumnType, InsightSeverity } from '@/types';

const typeColors: Record<ColumnType, string> = {
  number: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  integer: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  text: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  category: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  boolean: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  date: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  identifier: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export function TypeBadge({ type }: { type: ColumnType }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', typeColors[type])}>
      {type}
    </span>
  );
}

const severityColors: Record<InsightSeverity, string> = {
  Info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  Warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Discovery: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
};

export function SeverityBadge({ severity }: { severity: InsightSeverity }) {
  return (
    <span
      className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', severityColors[severity])}
    >
      {severity}
    </span>
  );
}
