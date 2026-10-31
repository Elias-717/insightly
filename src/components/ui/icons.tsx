import {
  Hash,
  Type,
  Tags,
  ToggleLeft,
  Calendar,
  Fingerprint,
  Binary,
  Info,
  TriangleAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ColumnType, InsightSeverity } from '@/types';

/** Lucide icon for each detected column type. */
export const COLUMN_TYPE_ICON: Record<ColumnType, LucideIcon> = {
  number: Hash,
  integer: Binary,
  text: Type,
  category: Tags,
  boolean: ToggleLeft,
  date: Calendar,
  identifier: Fingerprint,
};

/** Lucide icon for each insight severity. */
export const SEVERITY_ICON: Record<InsightSeverity, LucideIcon> = {
  Info,
  Warning: TriangleAlert,
  Discovery: Sparkles,
};
