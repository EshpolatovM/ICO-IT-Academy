'use client';

import { QueryView } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, Stack, Text } from '@/components/ui';

import { useParentTokens } from '../hooks/useParentTokens';

import { CreateParentTokenForm } from './CreateParentTokenForm';
import { ParentTokensTable } from './ParentTokensTable';

export interface ParentTokensCardProps {
  studentId: string;
  studentName: string;
}

function ParentTokensList({ studentId, studentName }: ParentTokensCardProps) {
  return (
    <QueryView query={useParentTokens(studentId)}>
      {(tokens) => (
        <ParentTokensTable studentId={studentId} studentName={studentName} tokens={tokens} />
      )}
    </QueryView>
  );
}

/** Ota-ona tokenlari: yaratish, ro'yxat, bekor qilish, qayta yaratish (docs/02 §5). */
export function ParentTokensCard(props: ParentTokensCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ota-ona havolalari</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="4">
          <Text variant="muted">
            Ota-ona akkauntsiz, shu havola (yoki kod) orqali farzandining ma&apos;lumotlarini faqat
            ko&apos;radi. Havola faqat yaratilganda bir marta ko&apos;rsatiladi.
          </Text>
          <CreateParentTokenForm {...props} />
          <ParentTokensList {...props} />
        </Stack>
      </CardContent>
    </Card>
  );
}
