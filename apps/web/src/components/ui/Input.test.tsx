import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';
import { PasswordInput } from './PasswordInput';

describe('Input', () => {
  it('oddiy holatda aria-invalid yo`q', () => {
    render(<Input aria-label="Ism" />);
    const input = screen.getByRole('textbox', { name: 'Ism' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('xato holatida aria-invalid va danger chegara', () => {
    render(<Input aria-label="Ism" invalid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-danger');
  });

  it('disabled holati', () => {
    render(<Input aria-label="Ism" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('PasswordInput', () => {
  it('ko`rsatish/yashirish tugmasi turini almashtiradi', async () => {
    render(<PasswordInput aria-label="Parol" />);
    const input = screen.getByLabelText('Parol');
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: "Ko'rsatish" }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Yashirish' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Yashirish' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
