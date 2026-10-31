import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadZone } from '@/components/UploadZone';
import type { ParserState } from '@/hooks/useCsvParser';

const baseState: ParserState = {
  status: 'idle',
  progressRows: 0,
  error: null,
  dataset: null,
};

describe('UploadZone', () => {
  it('shows an error message when parsing fails', () => {
    const state: ParserState = {
      ...baseState,
      status: 'error',
      error: 'That file type is not supported.',
    };
    render(
      <UploadZone state={state} onFile={vi.fn()} onSample={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('not supported');
  });

  it('renders the three sample data buttons', () => {
    render(
      <UploadZone state={baseState} onFile={vi.fn()} onSample={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Student grades')).toBeInTheDocument();
    expect(screen.getByText('E-commerce sales')).toBeInTheDocument();
    expect(screen.getByText('Messy customers')).toBeInTheDocument();
  });

  it('shows a cancel button while parsing', () => {
    render(
      <UploadZone
        state={{ ...baseState, status: 'parsing', progressRows: 1000 }}
        onFile={vi.fn()}
        onSample={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
