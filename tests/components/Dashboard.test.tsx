import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import type { DataTableHandle } from '@/components/panels/DataTablePanel';
import { getSample } from '@/data/samples';
import { rawFromCsv } from '../helpers';

beforeAll(() => {
  // Give layout dimensions so Recharts ResponsiveContainer and the virtualizer render.
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return 400;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return 600;
    },
  });
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

function renderDashboard() {
  const sample = getSample('grades');
  const raw = rawFromCsv(sample.fileName, sample.csv);
  const ref = createRef<DataTableHandle>();
  render(
    <ThemeProvider>
      <ToastProvider>
        <Dashboard raw={raw} tableRef={ref} />
      </ToastProvider>
    </ThemeProvider>,
  );
}

describe('Dashboard (sample data loaded)', () => {
  it('renders the file name and all tab buttons', () => {
    renderDashboard();
    expect(screen.getByText('student-grades.csv')).toBeInTheDocument();
    for (const tab of ['Overview', 'Columns', 'Charts', 'Whispers', 'Clean', 'Data']) {
      expect(screen.getByRole('tab', { name: new RegExp(tab) })).toBeInTheDocument();
    }
  });

  it('starts on the Overview tab showing the quality gauge', () => {
    renderDashboard();
    expect(screen.getByText('Data quality')).toBeInTheDocument();
  });

  it('surfaces the top findings directly on the Overview', () => {
    renderDashboard();
    const heading = screen.getByRole('heading', { name: 'Top findings' });
    const list = heading.closest('section')!.querySelector('ol')!;
    const items = list.querySelectorAll('li');
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(4);
  });

  it('opens the Columns tab when a column finding is clicked', async () => {
    renderDashboard();
    const heading = screen.getByRole('heading', { name: 'Top findings' });
    const buttons = heading.closest('section')!.querySelectorAll('ol button');
    await userEvent.click(buttons[0] as HTMLElement);
    expect(
      screen.getByRole('tab', { name: /Columns|Charts/, selected: true }),
    ).toBeInTheDocument();
  });

  it('switches to the Columns tab and lists columns', async () => {
    renderDashboard();
    await userEvent.click(screen.getByRole('tab', { name: /Columns/ }));
    expect(screen.getAllByLabelText(/Override type for/).length).toBeGreaterThan(0);
  });

  it('switches to the Whispers tab and shows ranked insights', async () => {
    renderDashboard();
    await userEvent.click(screen.getByRole('tab', { name: /Whispers/ }));
    expect(screen.getByText(/ranked by importance/)).toBeInTheDocument();
  });

  it('switches to the Clean tab showing before/after score', async () => {
    renderDashboard();
    await userEvent.click(screen.getByRole('tab', { name: /Clean/ }));
    expect(screen.getByText(/before . after/i)).toBeInTheDocument();
  });
});
