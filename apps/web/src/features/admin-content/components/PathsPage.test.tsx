import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmAction } from '@/lib/testing/dialogs';
import { navigation, resetNavigation } from '@/lib/testing/navigation';
import { renderWithQuery } from '@/lib/testing/render';

import { resetAdminContentMock } from '../api/admin-content.mock';

import { PathsPage } from './PathsPage';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

async function rowOf(title: string): Promise<HTMLElement> {
  const link = await screen.findByRole('link', { name: title });
  const row = link.closest('tr');
  if (row === null) {
    throw new Error(`Qator topilmadi: ${title}`);
  }
  return row;
}

describe('PathsPage', () => {
  beforeEach(() => {
    resetAdminContentMock();
    resetNavigation('/admin/paths');
  });

  it("ro'yxat: nom (daraxtga havola), slug, holat, bo'limlar soni", async () => {
    renderWithQuery(<PathsPage />);
    const row = await rowOf('Frontend dasturchi');
    expect(within(row).getByRole('link', { name: 'Frontend dasturchi' })).toHaveAttribute(
      'href',
      '/admin/paths/path-frontend',
    );
    expect(within(row).getByText('Nashr qilingan')).toBeInTheDocument();
    expect(within(row).getByRole('cell', { name: '2' })).toBeInTheDocument();
    expect(within(await rowOf('Python asoslari')).getByText('Qoralama')).toBeInTheDocument();
  });

  it("yaratish: band slug — maydon ostida 409 xatosi, so'ng daraxt sahifasiga o'tiladi", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PathsPage />);
    await user.click(screen.getByRole('button', { name: "Yangi yo'l" }));
    const dialog = await screen.findByRole('dialog', { name: "Yangi yo'l" });

    await user.type(within(dialog).getByLabelText(/Nom/), 'Go dasturlash');
    await user.type(within(dialog).getByLabelText(/Slug/), 'frontend');
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));
    expect(await within(dialog).findByText('Bu slug band')).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText(/Slug/));
    await user.type(within(dialog).getByLabelText(/Slug/), 'go');
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));
    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith('/admin/paths/path-new-1');
    });
  });

  it("o'chirish: guruh ishlatayotgan yo'l — 409 sababi oynada", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PathsPage />);
    await rowOf('Frontend dasturchi');

    await confirmAction(user, "O'chirish: Frontend dasturchi", "O'chirish");

    const dialog = screen.getByRole('alertdialog');
    expect(
      await within(dialog).findByText(/Yo'l ishlatilmoqda.*Guruhlar soni: 1\./),
    ).toBeInTheDocument();
  });

  it("o'chirish: ishlatilmagan yo'l ro'yxatdan yo'qoladi", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PathsPage />);
    await rowOf('Python asoslari');

    await confirmAction(user, "O'chirish: Python asoslari", "O'chirish");

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Python asoslari' })).not.toBeInTheDocument();
    });
  });

  it('nashr qilish / yashirish — holat yangilanadi', async () => {
    const user = userEvent.setup();
    renderWithQuery(<PathsPage />);
    const row = await rowOf('Python asoslari');

    await user.click(within(row).getByRole('button', { name: 'Nashr qilish: Python asoslari' }));
    expect(await within(row).findByText('Nashr qilingan')).toBeInTheDocument();

    await user.click(within(row).getByRole('button', { name: 'Yashirish: Python asoslari' }));
    expect(await within(row).findByText('Qoralama')).toBeInTheDocument();
  });
});
