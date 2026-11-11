import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppShell } from './AppShell';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

function renderShell(withSidebar = true) {
  return render(
    <AppShell
      topBar={<TopBar start="ICO" />}
      sidebar={
        withSidebar ? (
          <Sidebar label="Menyu ro'yxati">
            <li>
              <a href="#bosh">Bosh sahifa</a>
            </li>
            <li>
              <a href="#profil">Profil</a>
            </li>
          </Sidebar>
        ) : undefined
      }
    >
      Kontent
    </AppShell>,
  );
}

const menuButton = () => screen.getByRole('button', { name: /Menyu|Yopish/ });

describe('AppShell mobil menyu', () => {
  it('tugma aria-expanded va aria-controls bilan panelni ochadi/yopadi', async () => {
    const user = userEvent.setup();
    renderShell();
    const button = menuButton();
    const panelId = button.getAttribute('aria-controls');
    expect(panelId).not.toBeNull();
    expect(document.getElementById(panelId ?? '')).toHaveClass('hidden');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveTextContent('Yopish');
    expect(document.getElementById(panelId ?? '')).not.toHaveClass('hidden');
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toHaveFocus();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('Esc yopadi va fokusni tugmaga qaytaradi', async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(menuButton());
    await user.keyboard('{Escape}');
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveFocus();
  });

  it('havola bosilganda yopiladi', async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(menuButton());
    await user.click(screen.getByRole('link', { name: 'Profil' }));
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('Tab fokusni panel ichida aylantiradi', async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(menuButton());
    await user.tab();
    expect(screen.getByRole('link', { name: 'Profil' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toHaveFocus();
  });

  it('yon panelsiz AppShell da menyu tugmasi yo`q', () => {
    renderShell(false);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
