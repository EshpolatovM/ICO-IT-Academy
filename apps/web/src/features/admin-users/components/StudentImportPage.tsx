'use client';

import { STUDENT_IMPORT_REQUIRED_COLUMNS, StudentImportColumn } from '@lms/shared';
import type { StudentImportResult } from '@lms/shared';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Stack,
  Text,
  TextLink,
} from '@/components/ui';

import { studentsApi } from '../api/students.api';
import { useSecretMutation } from '../hooks/useSecretMutation';
import { AdminUsersPath } from '../lib/admin-users-paths';

import { ImportResultTable } from './ImportResultTable';
import { StudentImportForm } from './StudentImportForm';

const REQUIRED = STUDENT_IMPORT_REQUIRED_COLUMNS.join(', ');

function FormatHelp() {
  return (
    <Stack gap="2">
      <Text variant="muted">
        Birinchi qator — sarlavha. Majburiy ustunlar: {REQUIRED}. Ixtiyoriy:{' '}
        {StudentImportColumn.GROUP_NAME} (faol guruh nomi). Ajratgich — vergul yoki nuqtali vergul.
        Parollarni tizim yaratadi.
      </Text>
      <Text variant="muted">
        Birorta qatorda xato bo&apos;lsa, hech bir student yaratilmaydi — xatolar ro&apos;yxati
        ko&apos;rsatiladi.
      </Text>
    </Stack>
  );
}

function ImportResult({ result, onReset }: { result: StudentImportResult; onReset: () => void }) {
  return (
    <Stack gap="4">
      <Alert variant="success">{result.count} ta student yaratildi.</Alert>
      <Alert variant="warning">
        Vaqtinchalik parollar faqat hozir ko&apos;rsatiladi. Ularni nusxalab, xavfsiz joyga saqlang
        — sahifadan chiqqach qayta ko&apos;rib bo&apos;lmaydi.
      </Alert>
      <ImportResultTable students={result.students} />
      <Stack direction="horizontal" justify="end">
        <Button variant="secondary" onClick={onReset}>
          Yangi import
        </Button>
      </Stack>
    </Stack>
  );
}

/** `/admin/students/import` — CSV orqali ommaviy yaratish (S-21, docs/12 §2.1). */
export function StudentImportPage() {
  const { run, result, clear, isPending, error } = useSecretMutation(
    'students',
    studentsApi.import,
  );

  return (
    <Stack gap="6">
      <TextLink href={AdminUsersPath.STUDENTS} variant="muted">
        ← Studentlar
      </TextLink>
      <Heading as="h1">Studentlarni CSV orqali import qilish</Heading>
      <Card>
        <CardHeader>
          <CardTitle>{result === null ? 'Fayl yuklash' : 'Natija'}</CardTitle>
        </CardHeader>
        <CardContent>
          {result === null ? (
            <Stack gap="4">
              <FormatHelp />
              <StudentImportForm onSubmit={run} isPending={isPending} error={error} />
            </Stack>
          ) : (
            <ImportResult result={result} onReset={clear} />
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
