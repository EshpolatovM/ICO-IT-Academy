import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SecretReveal } from './SecretReveal';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
}

describe('SecretReveal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ogohlantirish, qiymat va muvaffaqiyatli nusxa (aria-live)', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);
    render(<SecretReveal label="Vaqtinchalik parol" value="Abc12345" />);

    expect(screen.getByRole('alert')).toHaveTextContent("faqat hozir ko'rsatiladi");
    expect(screen.getByRole('group', { name: 'Vaqtinchalik parol' })).toHaveTextContent('Abc12345');
    await user.click(screen.getByRole('button', { name: 'Nusxa olish' }));
    expect(writeText).toHaveBeenCalledWith('Abc12345');
    expect(await screen.findByText('Nusxa olindi')).toHaveAttribute('aria-live', 'polite');
  });

  it('clipboard xatosida xato matni', async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.reject(new Error('denied')));
    render(<SecretReveal label="Ota-ona havolasi" value="https://example.test/p#t=x" />);
    await user.click(screen.getByRole('button', { name: 'Nusxa olish' }));
    expect(await screen.findByText(/Nusxa olib bo'lmadi/)).toHaveClass('text-danger');
  });
});
