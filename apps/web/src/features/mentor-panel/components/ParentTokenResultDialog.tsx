'use client';

import type { ParentTokenCreatedResponse } from '@lms/shared';

import { SecretResultDialog } from '@/components/shared';
import type { SecretItem } from '@/components/shared';

const CODE_WARNING =
  "Kod — havoladagi tokenning o'zi: ota-ona uni kirish sahifasida qo'lda kiritishi mumkin. U ham faqat hozir ko'rinadi.";

function tokenSecrets(token: ParentTokenCreatedResponse): SecretItem[] {
  return [
    { label: 'Ota-ona havolasi', value: token.link },
    { label: 'Kirish kodi', value: token.token, warning: CODE_WARNING },
  ];
}

export interface ParentTokenResultDialogProps {
  title: string;
  studentName: string;
  token: ParentTokenCreatedResponse;
  onDone: () => void;
}

/** Yangi ota-ona havolasi va kodi — BIR MARTA (yopilganda `onDone` xotiradan o'chiradi). */
export function ParentTokenResultDialog({
  title,
  studentName,
  token,
  onDone,
}: ParentTokenResultDialogProps) {
  return (
    <SecretResultDialog
      title={title}
      items={[
        { term: 'Student', value: studentName },
        { term: 'Yorliq', value: token.label },
        { term: 'Prefiks', value: token.prefix },
      ]}
      secrets={tokenSecrets(token)}
      onDone={onDone}
    />
  );
}
