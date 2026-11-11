import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateInput } from './DateInput';
import { FormField } from './FormField';

describe('DateInput', () => {
  it('type="date" va berilgan qiymatni ko`rsatadi', () => {
    render(<DateInput aria-label="Sana" value="2026-11-11" onChange={vi.fn()} />);
    const input = screen.getByLabelText('Sana');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2026-11-11');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('o`zgarganda onChange ga YYYY-MM-DD qiymat uzatiladi', () => {
    const onChange = vi.fn();
    render(<DateInput aria-label="Sana" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Sana'), { target: { value: '2026-12-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-12-01');
  });

  it('tozalanganda onChange ga bo`sh satr uzatiladi', () => {
    const onChange = vi.fn();
    render(<DateInput aria-label="Sana" value="2026-12-01" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Sana'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('min, max va disabled atributlari uzatiladi', () => {
    render(
      <DateInput
        aria-label="Sana"
        value=""
        onChange={vi.fn()}
        min="2026-01-01"
        max="2026-12-31"
        disabled
      />,
    );
    const input = screen.getByLabelText('Sana');
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('max', '2026-12-31');
    expect(input).toBeDisabled();
  });

  it('xato holatida aria-invalid va danger chegara', () => {
    render(<DateInput aria-label="Sana" value="" onChange={vi.fn()} invalid />);
    const input = screen.getByLabelText('Sana');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-danger');
  });

  it('FormField bilan label, id va aria-describedby bog`lanadi', () => {
    render(
      <FormField label="Boshlanish sanasi" hint="Ixtiyoriy" error="Noto`g`ri sana">
        {(control) => <DateInput value="" onChange={vi.fn()} {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText('Boshlanish sanasi');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Ixtiyoriy Noto`g`ri sana');
    expect(input).toHaveClass('border-danger');
  });
});
