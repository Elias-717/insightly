import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnsPanel } from '@/components/panels/ColumnsPanel';
import { analyzeDataset } from '@/lib/analysis/analyze';
import { rawFromCsv } from '../helpers';

const dataset = analyzeDataset(
  rawFromCsv('t.csv', 'id,score,city\n1,90,KL\n2,80,Penang\n3,70,KL'),
);

describe('ColumnsPanel type override', () => {
  it('lists every column with a type override dropdown', () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} />);
    const selects = screen.getAllByLabelText(/Override type for/);
    expect(selects).toHaveLength(dataset.columns.length);
  });

  it('calls onOverride with the chosen type when changed', async () => {
    const onOverride = vi.fn();
    render(<ColumnsPanel dataset={dataset} onOverride={onOverride} />);
    const scoreSelect = screen.getByLabelText('Override type for score') as HTMLSelectElement;
    await userEvent.selectOptions(scoreSelect, 'text');
    expect(onOverride).toHaveBeenCalledWith('score', 'text');
  });

  it('reflects an override applied to the dataset (recompute)', () => {
    // Simulate the recompute the Dashboard performs by passing overrides into analysis.
    const overridden = analyzeDataset(dataset.raw, { score: 'text' });
    render(<ColumnsPanel dataset={overridden} onOverride={vi.fn()} />);
    const scoreSelect = screen.getByLabelText('Override type for score') as HTMLSelectElement;
    expect(scoreSelect.value).toBe('text');
  });

  it('shows the first column detail by default', () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} />);
    expect(screen.getByLabelText('Open details for id')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'id' })).toBeInTheDocument();
  });

  it('opens the detail of a column highlighted from an insight', () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} highlightColumn="city" />);
    expect(screen.getByLabelText('Open details for city')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Top values')).toBeInTheDocument();
  });

  it('shows each column type once (no duplicate badge next to the dropdown)', () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} />);
    const row = document.getElementById('column-score')!;
    const type = dataset.columns.find((c) => c.name === 'score')!.type;
    // The dropdown is the only place the type appears; no separate badge text.
    const outsideSelect = within(row)
      .queryAllByText(type)
      .filter((el) => el.tagName !== 'OPTION');
    expect(outsideSelect).toHaveLength(0);
    expect((within(row).getByRole('combobox') as HTMLSelectElement).value).toBe(type);
  });

  it('opens a column detail when a column is clicked', async () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Open details for city'));
    // The detail panel shows the "Top values" header for a category column.
    expect(screen.getByText('Top values')).toBeInTheDocument();
    const detail = screen.getByText('Top values').closest('div');
    expect(within(detail!.parentElement!).getByText(/KL/)).toBeInTheDocument();
  });
});
