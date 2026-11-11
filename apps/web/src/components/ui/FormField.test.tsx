import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './FormField';
import { Input } from './Input';
import { Label } from './Label';

describe('FormField', () => {
  it('label, yordam va xato matnini maydon bilan bog`laydi', () => {
    render(
      <FormField label="Telefon" hint="+998 bilan" error="Noto'g'ri raqam" required>
        {(control) => <Input type="tel" {...control} />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: /Telefon/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription("+998 bilan Noto'g'ri raqam");
    expect(input).toHaveClass('border-danger');
  });

  it('xato bo`lmasa faqat yordam matni bog`lanadi', () => {
    render(
      <FormField label="Ism" id="name" hint="To'liq ism">
        {(control) => <Input {...control} />}
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Ism' });
    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('aria-describedby', 'name-hint');
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});

describe('Label', () => {
  it('majburiy belgisini ekran o`quvchiga ham bildiradi', () => {
    render(<Label required>Parol</Label>);
    expect(screen.getByText('(majburiy)')).toHaveClass('sr-only');
  });
});
