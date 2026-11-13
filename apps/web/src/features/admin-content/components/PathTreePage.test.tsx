import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmAction } from '@/lib/testing/dialogs';
import { renderWithQuery } from '@/lib/testing/render';

import { adminContentApi } from '../api/admin-content.api';
import { resetAdminContentMock } from '../api/admin-content.mock';

import { PathTreePage } from './PathTreePage';

async function renderTree() {
  renderWithQuery(<PathTreePage pathId="path-frontend" />);
  return screen.findByRole('list', { name: "Yo'l daraxti" });
}

describe('PathTreePage', () => {
  beforeEach(() => {
    resetAdminContentMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("daraxt: bo'lim → mavzu → dars, sandiq mavzu qatorida, dars muharririga havola", async () => {
    const tree = await renderTree();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Frontend dasturchi' }),
    ).toBeInTheDocument();
    for (const title of ['HTML asoslari', 'CSS', 'HTML teglari', 'Matn teglari']) {
      expect(within(tree).getByText(title)).toBeInTheDocument();
    }
    expect(within(tree).getByRole('button', { name: "Sandiq: HTML sandig'i" })).toBeInTheDocument();
    expect(within(tree).getByRole('link', { name: 'Muharrir: Matn teglari' })).toHaveAttribute(
      'href',
      '/admin/lessons/lesson-tags-text',
    );
  });

  it("'Pastga' — shu darajaning yangi to'liq tartibi PUT …/order ga (Q-3)", async () => {
    const user = userEvent.setup();
    const reorderTopics = vi.spyOn(adminContentApi, 'reorderTopics');
    const tree = await renderTree();

    await user.click(within(tree).getByRole('button', { name: 'Pastga: HTML teglari' }));

    await waitFor(() => {
      expect(reorderTopics).toHaveBeenCalledWith('section-html', [
        'topic-html-forms',
        'topic-html-tags',
      ]);
    });
    await waitFor(() => {
      expect(within(tree).getByRole('button', { name: 'Yuqoriga: HTML teglari' })).toBeEnabled();
    });
    expect(within(tree).getByRole('button', { name: 'Pastga: HTML teglari' })).toBeDisabled();
  });

  it("bo'lim qo'shish — daraxt oxirida, holati 'Qoralama'", async () => {
    const user = userEvent.setup();
    await renderTree();
    await user.click(screen.getByRole('button', { name: "Bo'lim qo'shish" }));
    const dialog = await screen.findByRole('dialog', { name: "Yangi bo'lim" });
    expect(within(dialog).queryByLabelText(/Holat/)).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Nom/), 'JavaScript');
    await user.click(within(dialog).getByRole('button', { name: "Qo'shish" }));

    expect(await screen.findByText('JavaScript')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it("o'chirish: progressi bor mavzu — 409 HAS_PROGRESS sababi", async () => {
    const user = userEvent.setup();
    await renderTree();

    await confirmAction(user, "O'chirish: HTML teglari", "O'chirish");

    expect(
      await within(screen.getByRole('alertdialog')).findByText(/progressi bor/),
    ).toBeInTheDocument();
  });

  it("sandiq formasi: faqat shu bo'lim mavzulari, sandig'i bor mavzu tanlanmaydi", async () => {
    const user = userEvent.setup();
    await renderTree();
    await user.click(screen.getByRole('button', { name: "Sandiq qo'shish: HTML asoslari" }));
    const dialog = await screen.findByRole('dialog', { name: /Yangi sandiq/ });
    const select = within(dialog).getByLabelText(/Qaysi mavzudan keyin/);

    const options = within(select)
      .getAllByRole('option')
      .map((option) => [option.textContent, option.hasAttribute('disabled')]);
    expect(options).toEqual([
      ['Mavzuni tanlang', false],
      ['HTML teglari', true],
      ['Formalar', false],
    ]);
  });

  it('mavzu holatini tezkor almashtirish (kaskadsiz)', async () => {
    const user = userEvent.setup();
    const tree = await renderTree();
    await user.click(within(tree).getByRole('button', { name: 'Nashr qilish: Formalar' }));
    expect(
      await within(tree).findByRole('button', { name: 'Yashirish: Formalar' }),
    ).toBeInTheDocument();
    expect(
      within(tree).getByRole('button', { name: 'Nashr qilish: Input maydonlari' }),
    ).toBeInTheDocument();
  });

  it("noma'lum yo'l — 'Yo'l topilmadi'", async () => {
    renderWithQuery(<PathTreePage pathId="nope" />);
    expect(await screen.findByText("Yo'l topilmadi")).toBeInTheDocument();
  });
});
