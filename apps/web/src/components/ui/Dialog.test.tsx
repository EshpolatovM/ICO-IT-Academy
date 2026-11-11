import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

function renderDialog() {
  render(
    <Dialog>
      <DialogTrigger asChild>
        <Button>Ochish</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student yaratish</DialogTitle>
          <DialogDescription>Ma&apos;lumotlarni kiriting</DialogDescription>
        </DialogHeader>
        <input aria-label="Ism" />
        <DialogFooter>
          <Button>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe('Dialog', () => {
  it('ochiladi: nom va tavsif bog`langan, fokus ichkarida', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Ochish' }));
    const dialog = screen.getByRole('dialog', { name: 'Student yaratish' });
    expect(dialog).toHaveAccessibleDescription("Ma'lumotlarni kiriting");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('Esc va "Yopish" tugmasi bilan yopiladi, fokus triggerga qaytadi', async () => {
    renderDialog();
    const trigger = screen.getByRole('button', { name: 'Ochish' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Yopish' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('alertdialog: tasdiqlash va bekor qilish', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Studentni deaktivatsiya qilish"
        description="Student tizimga kira olmaydi."
        confirmLabel="Deaktivatsiya"
        variant="danger"
        onConfirm={onConfirm}
      />,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Studentni deaktivatsiya qilish' });
    expect(dialog).toHaveAccessibleDescription('Student tizimga kira olmaydi.');
    const confirm = screen.getByRole('button', { name: 'Deaktivatsiya' });
    expect(confirm).toHaveClass('bg-danger');

    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Bekor qilish' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('loading paytida bloklanadi va Esc bilan yopilmaydi', async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        loading
        onOpenChange={onOpenChange}
        title="Tokenni bekor qilish"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Tasdiqlash/ })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
