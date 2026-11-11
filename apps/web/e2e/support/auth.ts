import { expect } from '@playwright/test';

import type { E2eUser } from './e2e-users';
import type { Locator, Page } from '@playwright/test';

/**
 * Majburiy forma maydoni: `FormField required` da accessible name — "Nomi (majburiy)" (`*` belgisi
 * `aria-hidden`). Parol maydoni ham Playwright'da `textbox` roli bilan topiladi.
 */
export function requiredField(page: Page, label: string): Locator {
  return page.getByRole('textbox', { name: `${label} (majburiy)`, exact: true });
}

/** Staff login sahifasi orqali kirish (telefon + parol). */
export async function loginAsStaff(page: Page, user: E2eUser, password: string): Promise<void> {
  await page.goto('/login/staff');
  await requiredField(page, 'Telefon raqam').fill(user.login);
  await requiredField(page, 'Parol').fill(password);
  await page.getByRole('button', { name: 'Kirish' }).click();
}

/** Student login sahifasi orqali kirish (ID + parol). */
export async function loginAsStudent(page: Page, user: E2eUser, password: string): Promise<void> {
  await page.goto('/login');
  await requiredField(page, 'Student ID').fill(user.login);
  await requiredField(page, 'Parol').fill(password);
  await page.getByRole('button', { name: 'Kirish' }).click();
}

/** Joriy sahifa yo'li (query'siz) kutilgan qiymatga kelguncha kutadi. */
export async function expectPath(page: Page, pathname: string): Promise<void> {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}
