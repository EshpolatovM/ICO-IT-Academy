import type { ParentTokenSummary } from '@lms/shared';

import { HeadedTable } from '@/components/shared';
import { Stack, TableCell, TableEmpty, TableRow } from '@/components/ui';
import { formatDateTime } from '@/lib/format';

import { RegenerateParentTokenAction } from './RegenerateParentTokenAction';
import { RevokeParentTokenAction } from './RevokeParentTokenAction';

const HEADERS = [
  'Yorliq',
  'Prefiks',
  'Yaratilgan',
  'Oxirgi foydalanilgan',
  'Foydalanishlar',
  '',
] as const;

export interface ParentTokensTableProps {
  studentId: string;
  studentName: string;
  tokens: readonly ParentTokenSummary[];
}

function TokenRows({ studentId, studentName, tokens }: ParentTokensTableProps) {
  if (tokens.length === 0) {
    return <TableEmpty colSpan={HEADERS.length} title="Faol ota-ona havolasi yo'q" />;
  }
  return tokens.map((token) => (
    <TableRow key={token.id}>
      <TableCell>{token.label ?? '—'}</TableCell>
      <TableCell>{token.prefix}</TableCell>
      <TableCell>{formatDateTime(token.createdAt)}</TableCell>
      <TableCell>{formatDateTime(token.lastUsedAt)}</TableCell>
      <TableCell>{token.useCount}</TableCell>
      <TableCell>
        <Stack direction="horizontal" gap="2">
          <RegenerateParentTokenAction
            studentId={studentId}
            studentName={studentName}
            token={token}
          />
          <RevokeParentTokenAction studentId={studentId} token={token} />
        </Stack>
      </TableCell>
    </TableRow>
  ));
}

/** Faol ota-ona tokenlari: yorliq, prefiks, sanalar, foydalanishlar soni, amallar. */
export function ParentTokensTable(props: ParentTokensTableProps) {
  return (
    <HeadedTable label="Ota-ona tokenlari" headers={HEADERS}>
      <TokenRows {...props} />
    </HeadedTable>
  );
}
