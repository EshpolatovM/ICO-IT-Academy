import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavItem } from './NavItem';
import { TextLink } from './TextLink';

describe('NavItem disabled', () => {
  it('havola emas, aria-disabled va hint chiqaradi', () => {
    render(
      <ul>
        <NavItem disabled hint="Tez orada">
          Bellashuv
        </NavItem>
      </ul>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const item = screen.getByText('Bellashuv').parentElement;
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveClass('cursor-not-allowed', 'text-text-disabled');
    expect(screen.getByText('Tez orada')).toBeInTheDocument();
  });

  it('href berilsa ham disabled band havola bo`lmaydi', () => {
    render(
      <ul>
        <NavItem href="/a" disabled>
          Profil
        </NavItem>
      </ul>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('TextLink', () => {
  it('ichki havola: target/rel yo`q, default variant', () => {
    render(<TextLink href="/login">Kirish</TextLink>);
    const link = screen.getByRole('link', { name: 'Kirish' });
    expect(link).toHaveAttribute('href', '/login');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
    expect(link).toHaveClass('text-primary');
  });

  it('external: yangi oyna va xavfsiz rel', () => {
    render(
      <TextLink href="https://example.com" external variant="muted">
        Tashqi
      </TextLink>,
    );
    const link = screen.getByRole('link', { name: 'Tashqi' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveClass('text-text-muted');
  });
});
