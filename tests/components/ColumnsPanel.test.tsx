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

  it('opens a column detail when a column is clicked', async () => {
    render(<ColumnsPanel dataset={dataset} onOverride={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Open details for city'));
    // The detail panel shows the "Top values" header for a category column.
    expect(screen.getByText('Top values')).toBeInTheDocument();
    const detail = screen.getByText('Top values').closest('div');
    expect(within(detail!.parentElement!).getByText(/KL/)).toBeInTheDocument();
  });
});
