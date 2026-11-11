import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressBar, toPercent } from './ProgressBar';

describe('ProgressBar', () => {
  it('progressbar roli, nom va aria qiymatlari', () => {
    render(<ProgressBar value={0.426} label="Yo'l progressi" />);
    const bar = screen.getByRole('progressbar', { name: "Yo'l progressi" });
    expect(bar).toHaveAttribute('aria-valuenow', '43');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('43%')).toBeInTheDocument();
  });

  it('foiz matnini yashirish mumkin', () => {
    render(<ProgressBar value={0.5} label="Bo'lim" showValue={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '50%');
  });

  it('chegaradan tashqari va NaN qiymatlar qirqiladi', () => {
    expect(toPercent(-1)).toBe(0);
    expect(toPercent(2)).toBe(100);
    expect(toPercent(Number.NaN)).toBe(0);
    expect(toPercent(1)).toBe(100);
  });
});
