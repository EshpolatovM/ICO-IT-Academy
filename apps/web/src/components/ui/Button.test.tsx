import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('standart holatda primary, type="button"', () => {
    render(<Button>Kirish</Button>);
    const button = screen.getByRole('button', { name: 'Kirish' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-primary');
  });

  it('variant va size klasslarini qo`llaydi', () => {
    render(
      <Button variant="danger" size="sm" fullWidth>
        O`chirish
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-danger', 'h-8', 'w-full');
  });

  it('disabled bo`lsa bosilmaydi', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Saqlash
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading holatida bloklanadi, aria-busy va spinner chiqadi', () => {
    render(<Button loading>Saqlash</Button>);
    const button = screen.getByRole('button', { name: /Saqlash/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Yuklanmoqda');
  });

  it('asChild bilan bola elementni tugma klasslari bilan chiqaradi', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/login">Kirish</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Kirish' });
    expect(link).toHaveClass('border-border');
  });
});
