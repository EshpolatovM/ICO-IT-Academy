'use client';

import { ConfirmSecretAction } from '@/components/shared';

import { mentorPanelKeys } from '../api/mentor-panel.query-keys';
import { parentTokensApi } from '../api/parent-tokens.api';
import { parentTokenName } from '../lib/parent-token-name';

import { ParentTokenResultDialog } from './ParentTokenResultDialog';

import type { ParentTokenActionProps } from '../types/mentor-panel.types';

/** Qayta yaratish: eski token bekor bo'ladi, yangi havola va kod BIR MARTA ko'rinadi (keshsiz). */
export function RegenerateParentTokenAction({
  studentId,
  studentName,
  token,
}: ParentTokenActionProps) {
  const name = parentTokenName(token);
  return (
    <ConfirmSecretAction
      label="Qayta yaratish"
      ariaLabel={`${name} — qayta yaratish`}
      confirmTitle={`${name}: havola qayta yaratilsinmi?`}
      confirmDescription="Eski havola va kod darhol bekor bo'ladi. Ota-onaga yangi havolani yuborishingiz kerak."
      confirmLabel="Qayta yaratish"
      action={() => parentTokensApi.regenerate(studentId, token.id)}
      invalidateKey={mentorPanelKeys.student(studentId)}
      renderResult={(result, onDone) => (
        <ParentTokenResultDialog
          title="Havola qayta yaratildi"
          studentName={studentName}
          token={result}
          onDone={onDone}
        />
      )}
    />
  );
}
