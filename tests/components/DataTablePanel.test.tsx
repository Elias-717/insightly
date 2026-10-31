import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { DataTablePanel, type DataTableHandle } from '@/components/panels/DataTablePanel';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../helpers';

const dataset = analyzeDataset(
  rawFromCsv(
    'people.csv',
    'name,age,city\nAlice,30,KL\nBob,25,Penang\nCarol,35,KL\nDave,28,Johor',
  ),
);

// jsdom has no layout; give the scroll container a height so the virtualizer renders rows.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return 600;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return 800;
    },
  });
});

function renderTable() {
  const ref = createRef<DataTableHandle>();
  render(
    <ToastProvider>
      <DataTablePanel ref={ref} dataset={dataset} />
    </ToastProvider>,
  );
  return ref;
}

describe('DataTablePanel', () => {
  it('shows the full row count initially', () => {
    renderTable();
    expect(screen.getByText(/4 of 4 rows/)).toBeInTheDocument();
  });

  it('filters rows via the global search box', async () => {
    renderTable();
    const search = screen.getByLabelText('Search the data table');
    await userEvent.type(search, 'Alice');
    expect(screen.getByText(/1 of 4 rows/)).toBeInTheDocument();
  });

  it('exposes a focusSearch handle', () => {
    const ref = renderTable();
    const search = screen.getByLabelText('Search the data table');
    ref.current?.focusSearch();
    expect(document.activeElement).toBe(search);
  });

  it('renders a sortable header button per column', () => {
    renderTable();
    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /age/i })).toBeInTheDocument();
  });

  it('hides a column via the column show/hide menu', async () => {
    renderTable();
    await userEvent.click(screen.getByText('Columns'));
    const cityCheckbox = screen.getByRole('checkbox', { name: /city/i });
    expect(cityCheckbox).toBeChecked();
    await userEvent.click(cityCheckbox);
    expect(cityCheckbox).not.toBeChecked();
  });

  it('provides a per-column filter input', () => {
    renderTable();
    expect(screen.getByLabelText('Filter name')).toBeInTheDocument();
  });
});
