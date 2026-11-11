import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';
import { FormField } from './FormField';

describe('Checkbox', () => {
  it('label va description bilan bog`lanadi, bosilganda belgilanadi', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Faol" description="Faqat faol studentlar" onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Faol' });
    expect(checkbox).toHaveAccessibleDescription('Faqat faol studentlar');
    await userEvent.click(screen.getByText('Faol'));
    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('klaviatura (Space) bilan almashtiriladi', async () => {
    render(<Checkbox label="Tanlash" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Tanlash' });
    checkbox.focus();
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  it('indeterminate holat DOM xususiyatiga yoziladi va o`zgaradi', () => {
    const { rerender } = render(<Checkbox aria-label="Hammasi" indeterminate readOnly />);
    const checkbox = screen.getByRole('checkbox', { name: 'Hammasi' });
    expect(checkbox).toBePartiallyChecked();
    rerender(<Checkbox aria-label="Hammasi" indeterminate={false} checked readOnly />);
    expect(checkbox).not.toBePartiallyChecked();
    expect(checkbox).toBeChecked();
  });

  it('tashqi ref ham ishlaydi', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox aria-label="Ref" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('checkbox', { name: 'Ref' }));
  });

  it('FormField bilan: xato holati va disabled', () => {
    render(
      <FormField label="Shartlarga roziman" error="Rozilik shart">
        {(control) => <Checkbox disabled {...control} />}
      </FormField>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Shartlarga roziman' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Rozilik shart');
    expect(checkbox).toBeDisabled();
  });
});
