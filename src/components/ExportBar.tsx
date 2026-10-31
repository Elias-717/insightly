'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  ChevronDown,
  FileText,
  FileCode2,
  FileType2,
  Sheet,
  type LucideIcon,
} from 'lucide-react';
import type { Dataset, Insight } from '@/types';
import { exportPdfReport } from '@/lib/export/pdf';
import { buildHtmlReport } from '@/lib/export/html';
import { insightsToMarkdown } from '@/lib/export/markdown';
import { downloadCsv, downloadText } from '@/lib/export/csv';
import { useToast } from '@/components/providers/ToastProvider';

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  run: () => void | Promise<void>;
}

export function ExportBar({ dataset, insights }: { dataset: Dataset; insights: Insight[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const exportPdf = useCallback(async () => {
    setBusy(true);
    toast('Building PDF…', 'info');
    try {
      await exportPdfReport(dataset, insights, ['chart-timeseries', 'chart-correlation']);
      toast('PDF report downloaded', 'success');
    } catch {
      toast('PDF export failed', 'error');
    } finally {
      setBusy(false);
    }
  }, [dataset, insights, toast]);

  const items: MenuItem[] = [
    { key: 'pdf', label: 'PDF', icon: FileText, run: exportPdf },
    {
      key: 'html',
      label: 'HTML',
      icon: FileCode2,
      run: () => {
        downloadText(buildHtmlReport(dataset, insights), `insightly-${dataset.raw.fileName}.html`, 'text/html');
        toast('HTML report downloaded', 'success');
      },
    },
    {
      key: 'md',
      label: 'Markdown',
      icon: FileType2,
      run: () => {
        downloadText(insightsToMarkdown(dataset, insights), `insightly-${dataset.raw.fileName}.md`, 'text/markdown');
        toast('Markdown downloaded', 'success');
      },
    },
    {
      key: 'csv',
      label: 'Cleaned CSV',
      icon: Sheet,
      run: () => {
        downloadCsv(dataset.raw, `cleaned-${dataset.raw.fileName}`);
        toast('Cleaned CSV downloaded', 'success');
      },
    },
  ];

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback((toIndex: number) => {
    setOpen(true);
    setActive(toIndex);
  }, []);

  // Move DOM focus to the active item while the menu is open.
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const choose = (item: MenuItem) => {
    close();
    void item.run();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu(items.length - 1);
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(items.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(items[active]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openMenu(0))}
        onKeyDown={onTriggerKeyDown}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        <Download size={16} aria-hidden="true" />
        Export
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Export report"
          onKeyDown={onMenuKeyDown}
          className="animate-scale-in absolute right-0 z-30 mt-1 w-48 rounded-card border border-border bg-surface p-1 shadow-popover"
        >
          {items.map((item, i) => (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={active === i ? 0 : -1}
              onClick={() => choose(item)}
              onMouseEnter={() => setActive(i)}
              className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm hover:bg-accent-soft focus:bg-accent-soft focus:outline-none"
            >
              <item.icon size={16} aria-hidden="true" className="text-muted" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
