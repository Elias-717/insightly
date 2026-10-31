import { cn } from '@/lib/utils';
import type { ColumnType, InsightSeverity } from '@/types';
import { COLUMN_TYPE_ICON, SEVERITY_ICON } from './icons';

export function TypeBadge({ type }: { type: ColumnType }) {
  const Icon = COLUMN_TYPE_ICON[type];
  return (
    <span className="inline-flex items-center gap-1 rounded-control border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      <Icon size={13} aria-hidden="true" />
      {type}
    </span>
  );
}

// Semantic tokens: info=blue, warning=amber, discovery=green. Always icon + label.
const severityStyle: Record<InsightSeverity, string> = {
  Info: 'text-info-text bg-info-soft',
  Warning: 'text-warning-text bg-warning-soft',
  Discovery: 'text-success-text bg-success-soft',
};

export function SeverityBadge({ severity }: { severity: InsightSeverity }) {
  const Icon = SEVERITY_ICON[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-xs font-semibold',
        severityStyle[severity],
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {severity}
    </span>
  );
}
