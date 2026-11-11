import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from './AppShell';
import { Container } from './Container';
import { NavItem } from './NavItem';
import { Sidebar } from './Sidebar';
import { Stack } from './Stack';
import { TopBar } from './TopBar';

describe('Stack', () => {
  it('yo`nalish, gap va tekislash klasslari', () => {
    render(
      <Stack data-testid="stack" direction="horizontal" gap="2" align="center" justify="between">
        <span>a</span>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveClass(
      'flex-row',
      'gap-2',
      'items-center',
      'justify-between',
    );
  });
});

describe('Container', () => {
  it('o`lcham klassi', () => {
    render(<Container data-testid="container" size="sm" />);
    expect(screen.getByTestId('container')).toHaveClass('max-w-md', 'mx-auto');
  });
});

describe('AppShell + TopBar + Sidebar + NavItem', () => {
  it('karkas slotlarini va aktiv navigatsiyani chiqaradi', () => {
    render(
      <AppShell
        topBar={<TopBar start="ICO" end={<button>Chiqish</button>} />}
        sidebar={
          <Sidebar label="Menyu">
            <NavItem href="/a" active>
              Bosh sahifa
            </NavItem>
            <NavItem href="/b">Profil</NavItem>
          </Sidebar>
        }
      >
        Kontent
      </AppShell>,
    );
    expect(screen.getByRole('banner')).toHaveTextContent('ICO');
    expect(screen.getByRole('navigation', { name: 'Menyu' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Kontent');

    const active = screen.getByRole('link', { name: 'Bosh sahifa' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveClass('bg-primary');
    expect(screen.getByRole('link', { name: 'Profil' })).not.toHaveAttribute('aria-current');
  });
});
