import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from './Alert';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

describe('Alert', () => {
  it('danger — role="alert" va danger klasslari', () => {
    render(<Alert variant="danger" title="Xato" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-danger-bg');
    expect(alert).toHaveTextContent('Xato');
  });

  it('info — role="status"', () => {
    render(<Alert>Ma'lumot</Alert>);
    expect(screen.getByRole('status')).toHaveClass('bg-info-bg');
  });
});

describe('Spinner', () => {
  it('ekran o`quvchi uchun matn va o`lcham klassi', () => {
    render(<Spinner size="sm" label="Kuting" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Kuting');
    expect(status.querySelector('.animate-spin')).toHaveClass('size-4');
  });
});

describe('EmptyState', () => {
  it('sarlavha, tavsif va amalni chiqaradi', () => {
    render(<EmptyState title="Bo'sh" description="Hali yo'q" action={<button>Qo'shish</button>} />);
    expect(screen.getByText("Bo'sh")).toBeInTheDocument();
    expect(screen.getByText("Hali yo'q")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeInTheDocument();
  });
});
