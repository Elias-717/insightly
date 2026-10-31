'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CellValue, Dataset } from '@/types';
import { Card } from '@/components/ui/Card';
import { isMissing, parseNumber } from '@/lib/analysis/clean-value';
import { cn } from '@/lib/utils';

export interface DataTableHandle {
  focusSearch: () => void;
}

type SortDir = 'asc' | 'desc' | null;

interface DataTablePanelProps {
  dataset: Dataset;
}

export const DataTablePanel = forwardRef<DataTableHandle, DataTablePanelProps>(
  function DataTablePanel({ dataset }, ref) {
    const { headers, rows } = dataset.raw;
    const searchRef = useRef<HTMLInputElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState<number | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [hidden, setHidden] = useState<Set<number>>(new Set());
    const [columnFilters, setColumnFilters] = useState<Record<number, string>>({});

    useImperativeHandle(ref, () => ({
      focusSearch: () => searchRef.current?.focus(),
    }));

    // Outlier sets per numeric column for cell highlighting.
    const outlierSets = useMemo(() => {
      const map = new Map<number, Set<number>>();
      for (const col of dataset.columns) {
        if (col.numeric) {
          map.set(col.index, new Set(col.numeric.outliers));
        }
      }
      return map;
    }, [dataset.columns]);

    const visibleColumns = headers
      .map((h, i) => ({ h, i }))
      .filter(({ i }) => !hidden.has(i));

    const filteredRows = useMemo(() => {
      const q = search.trim().toLowerCase();
      const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.trim() !== '');

      let result = rows;
      if (q || activeFilters.length > 0) {
        result = rows.filter((row) => {
          if (q && !row.some((c) => (c ?? '').toLowerCase().includes(q))) return false;
          for (const [idxStr, val] of activeFilters) {
            const idx = Number(idxStr);
            if (!(row[idx] ?? '').toLowerCase().includes(val.toLowerCase())) return false;
          }
          return true;
        });
      }

      if (sortCol !== null && sortDir) {
        const col = dataset.columns[sortCol];
        const numeric = col?.type === 'number' || col?.type === 'integer';
        result = [...result].sort((a, b) => {
          const av = a[sortCol];
          const bv = b[sortCol];
          let cmp: number;
          if (numeric) {
            cmp = (parseNumber(av) ?? -Infinity) - (parseNumber(bv) ?? -Infinity);
          } else {
            cmp = (av ?? '').localeCompare(bv ?? '');
          }
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
      return result;
    }, [rows, search, sortCol, sortDir, columnFilters, dataset.columns]);

    const rowVirtualizer = useVirtualizer({
      count: filteredRows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 36,
      overscan: 12,
    });

    const toggleSort = (idx: number) => {
      if (sortCol !== idx) {
        setSortCol(idx);
        setSortDir('asc');
      } else if (sortDir === 'asc') {
        setSortDir('desc');
      } else if (sortDir === 'desc') {
        setSortCol(null);
        setSortDir(null);
      } else {
        setSortDir('asc');
      }
    };

    const toggleHidden = (idx: number) => {
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    };

    const cellClass = (value: CellValue, rowOutlier: boolean) =>
      cn(
        'truncate border-b border-slate-100 px-3 py-2 text-sm dark:border-slate-800',
        isMissing(value) && 'bg-rose-50 text-rose-400 dark:bg-rose-950/30',
        rowOutlier && 'bg-amber-50 font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
      );

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all columns…  (press /)"
            aria-label="Search the data table"
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 sm:w-auto"
          />
          <span className="text-sm text-slate-500">
            {filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} rows
          </span>
          <details className="relative ml-auto">
            <summary className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium dark:border-slate-700">
              Columns
            </summary>
            <div className="absolute right-0 z-20 mt-2 max-h-64 w-56 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-800">
              {headers.map((h, i) => (
                <label key={i} className="flex items-center gap-2 px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={!hidden.has(i)}
                    onChange={() => toggleHidden(i)}
                    className="accent-violet"
                  />
                  <span className="truncate">{h}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        <Card className="p-0">
          <div ref={parentRef} className="scroll-thin max-h-[600px] overflow-auto">
            <table className="w-full min-w-max border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800">
                <tr>
                  {visibleColumns.map(({ h, i }) => (
                    <th key={i} className="min-w-[140px] px-3 py-2 text-left">
                      <button
                        onClick={() => toggleSort(i)}
                        className="flex items-center gap-1 text-sm font-semibold"
                      >
                        {h}
                        <span className="text-xs text-slate-400">
                          {sortCol === i ? (sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '') : '⇅'}
                        </span>
                      </button>
                      <input
                        type="text"
                        value={columnFilters[i] ?? ''}
                        onChange={(e) =>
                          setColumnFilters((prev) => ({ ...prev, [i]: e.target.value }))
                        }
                        placeholder="filter"
                        aria-label={`Filter ${h}`}
                        className="mt-1 w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowVirtualizer.getVirtualItems().length > 0 && (
                  <tr style={{ height: rowVirtualizer.getVirtualItems()[0].start }} aria-hidden />
                )}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = filteredRows[virtualRow.index];
                  return (
                    <tr key={virtualRow.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {visibleColumns.map(({ i }) => {
                        const value = row[i] ?? null;
                        const num = parseNumber(value);
                        const isOutlier = num !== null && (outlierSets.get(i)?.has(num) ?? false);
                        return (
                          <td
                            key={i}
                            className={cellClass(value, isOutlier)}
                            title={value ?? ''}
                          >
                            {isMissing(value) ? '—' : value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {rowVirtualizer.getVirtualItems().length > 0 && (
                  <tr
                    style={{
                      height:
                        rowVirtualizer.getTotalSize() -
                        (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                    }}
                    aria-hidden
                  />
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  },
);
