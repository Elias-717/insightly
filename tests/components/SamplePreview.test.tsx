import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SamplePreview } from '@/components/SamplePreview';

describe('SamplePreview (landing example report)', () => {
  it('shows the sample file, score, and top findings', () => {
    render(<SamplePreview onOpen={vi.fn()} />);
    expect(screen.getByText('messy-customers.csv')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Top findings/ })).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('pointing at a finding isolates the cells it is about', async () => {
    render(<SamplePreview onOpen={vi.fn()} />);
    const outlier = screen.getByText('999');
    expect(outlier.className).toMatch(/bg-mark\/55/); // soft at rest
    await userEvent.hover(screen.getByRole('button', { name: /'age' has 1 outlier/ }));
    expect(outlier.className).toMatch(/bg-mark(?!\/)/); // fully lit
    expect(screen.getByText('95000').className).toMatch(/bg-transparent/); // others fade
  });

  it('opens the full report from the button and from a finding', async () => {
    const onOpen = vi.fn();
    render(<SamplePreview onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: /Open the full report/ }));
    await userEvent.click(screen.getByRole('button', { name: /inconsistent casing/ }));
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
