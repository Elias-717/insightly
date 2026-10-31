import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from '@/components/UploadZone';
import type { ParserState } from '@/hooks/useCsvParser';

const baseState: ParserState = {
  status: 'idle',
  progressRows: 0,
  error: null,
  dataset: null,
};

function renderZone(overrides: Partial<ParserState> = {}, handlers = {}) {
  const props = {
    onFile: vi.fn(),
    onSample: vi.fn(),
    onCancel: vi.fn(),
    ...handlers,
  };
  render(<UploadZone state={{ ...baseState, ...overrides }} {...props} />);
  return props;
}

describe('UploadZone', () => {
  it('accepts a valid file through the hidden input', async () => {
    const onFile = vi.fn();
    renderZone({}, { onFile });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });
    await userEvent.upload(input, file);
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('shows a friendly error for a wrong file type', () => {
    renderZone({ status: 'error', error: 'That file type is not supported. Please use a .csv or .tsv file.' });
    expect(screen.getByRole('alert')).toHaveTextContent('not supported');
  });

  it('shows a friendly error for an empty file', () => {
    renderZone({ status: 'error', error: 'That file is empty. Please choose a file with data.' });
    expect(screen.getByRole('alert')).toHaveTextContent('empty');
  });

  it('shows a friendly error for an oversized file', () => {
    renderZone({ status: 'error', error: 'This file is 25.0 MB, which is over the 20 MB limit. Try a smaller sample.' });
    expect(screen.getByRole('alert')).toHaveTextContent('over the 20 MB limit');
  });

  it('renders the three sample data buttons', () => {
    renderZone();
    expect(screen.getByText('Student grades')).toBeInTheDocument();
    expect(screen.getByText('E-commerce sales')).toBeInTheDocument();
    expect(screen.getByText('Messy customers')).toBeInTheDocument();
  });

  it('calls onSample when a sample button is clicked', async () => {
    const onSample = vi.fn();
    renderZone({}, { onSample });
    await userEvent.click(screen.getByText('Student grades'));
    expect(onSample).toHaveBeenCalledWith('grades');
  });

  it('shows a cancel button while parsing and fires onCancel', async () => {
    const onCancel = vi.fn();
    renderZone({ status: 'parsing', progressRows: 1000 }, { onCancel });
    const cancel = screen.getByText('Cancel');
    await userEvent.click(cancel);
    expect(onCancel).toHaveBeenCalled();
  });
});
