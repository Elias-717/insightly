import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhispersPanel } from '@/components/panels/WhispersPanel';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { analyzeDataset } from '@/lib/analysis/analyze';
import type { Insight } from '@/types';
import { rawFromCsv } from '../helpers';

const dataset = analyzeDataset(rawFromCsv('t.csv', 'a,b\n1,2\n3,4'));

const insights: Insight[] = [
  { id: 'info-1', severity: 'Info', title: 'Info insight', explanation: 'x', importance: 10 },
  { id: 'warn-1', severity: 'Warning', title: 'Warning insight', explanation: 'y', importance: 90 },
  { id: 'disc-1', severity: 'Discovery', title: 'Discovery insight', explanation: 'z', importance: 50 },
];

function renderPanel(items = insights) {
  return render(
    <ToastProvider>
      <WhispersPanel dataset={dataset} insights={items} onSelectInsight={vi.fn()} />
    </ToastProvider>,
  );
}

describe('WhispersPanel', () => {
  it('renders all provided insights', () => {
    renderPanel();
    expect(screen.getByText('Info insight')).toBeInTheDocument();
    expect(screen.getByText('Warning insight')).toBeInTheDocument();
    expect(screen.getByText('Discovery insight')).toBeInTheDocument();
  });

  it('renders insights in the order given (already ranked by severity upstream)', () => {
    renderPanel();
    const titles = screen.getAllByText(/insight$/).map((el) => el.textContent);
    expect(titles[0]).toBe('Info insight');
  });

  it('shows an empty state when there are no insights', () => {
    renderPanel([]);
    expect(screen.getByText(/looks clean/i)).toBeInTheDocument();
  });

  it('shows the copy-as-markdown action', () => {
    renderPanel();
    expect(screen.getByText('Copy as Markdown')).toBeInTheDocument();
  });
});
