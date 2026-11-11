import { screen, within } from '@testing-library/react';

import type { UserEvent } from '@testing-library/user-event';

/** Tugmani bosadi va ochilgan tasdiqlash oynasida (`alertdialog`) tasdiqlash tugmasini bosadi. */
export async function confirmAction(
  user: UserEvent,
  triggerName: string,
  confirmName: string,
): Promise<void> {
  await user.click(await screen.findByRole('button', { name: triggerName }));
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: confirmName }),
  );
}
