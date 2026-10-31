import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QualityGauge } from '@/components/QualityGauge';
import type { QualityScore } from '@/types';

const quality: QualityScore = {
  score: 82,
  grade: 'B',
  components: [
    { key: 'completeness', label: 'Completeness', weight: 0.4, score: 90, detail: '10% missing' },
    { key: 'uniqueness', label: 'Uniqueness', weight: 0.2, score: 100, detail: 'no duplicates' },
    { key: 'consistency', label: 'Consistency', weight: 0.2, score: 70, detail: '1 mixed column' },
    { key: 'outliers', label: 'Outlier control', weight: 0.2, score: 60, detail: 'some outliers' },
  ],
};

describe('QualityGauge', () => {
  it('renders the score and grade', () => {
    render(<QualityGauge quality={quality} />);
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('Grade B')).toBeInTheDocument();
  });

  it('exposes an accessible label with the score', () => {
    render(<QualityGauge quality={quality} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('82'),
    );
  });

  it('has a how-it-is-calculated toggle', () => {
    render(<QualityGauge quality={quality} />);
    expect(screen.getByText('How is this calculated?')).toBeInTheDocument();
  });
});
