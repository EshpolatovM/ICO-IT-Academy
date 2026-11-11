import { expect, test } from '@playwright/test';

import { expectPath, loginAsStaff } from './support/auth';
import { e2eUsers } from './support/e2e-users';

test.use({ viewport: { width: 390, height: 844 } });

test('(g) mobil (390×844): menyu tugmasi yon panelni ochadi va yopadi', async ({ page }) => {
  const { mentor, password } = e2eUsers();
  await loginAsStaff(page, mentor, password);
  await expectPath(page, '/mentor');

  const chatLink = page.getByRole('link', { name: 'Chat' });
  const menuButton = page.getByRole('button', { name: 'Menyu' });
  await expect(chatLink).toBeHidden();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await menuButton.click();
  const closeButton = page.getByRole('button', { name: 'Yopish' });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  await expect(chatLink).toBeVisible();

  await closeButton.click();
  await expect(chatLink).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menyu' })).toBeVisible();
});
