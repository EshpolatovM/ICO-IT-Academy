'use client';

import { useState } from 'react';

import { ErrorCode } from '@lms/shared';

import { Alert, Button, FileInput, FormField, Stack } from '@/components/ui';
import { errorMessage, isApiError } from '@/lib/api';

import { importRowErrors } from '../lib/import-errors';
import { exceedsDefaultImportSize, IMPORT_LIMITS_TEXT } from '../lib/import-limits';

import { ImportErrorsTable } from './ImportErrorsTable';

const CSV_ACCEPT = '.csv,text/csv';
const FILE_HINT = `UTF-8, sarlavhali CSV. Standart chegaralar: fayl hajmi ${IMPORT_LIMITS_TEXT.fileSize} gacha, ${IMPORT_LIMITS_TEXT.rows} tagacha qator.`;
const TOO_LARGE_HINT = "Faylni bir nechta kichik faylga bo'lib, alohida yuklang.";
const TOO_LARGE_WARNING = `Fayl hajmi ${IMPORT_LIMITS_TEXT.fileSize} dan katta, shuning uchun yuborilmaydi. ${TOO_LARGE_HINT} Eslatma: server chegarasi boshqacha bo'lishi mumkin.`;

export interface StudentImportFormProps {
  onSubmit: (file: File) => Promise<unknown>;
  isPending: boolean;
  error: unknown;
}

function ImportError({ error }: { error: unknown }) {
  const rows = importRowErrors(error);
  const tooLarge = isApiError(error) && error.code === ErrorCode.PAYLOAD_TOO_LARGE;
  return (
    <Stack gap="3">
      <Alert variant="danger">
        {errorMessage(error)}
        {tooLarge ? ` ${TOO_LARGE_HINT}` : null}
      </Alert>
      {rows.length > 0 ? <ImportErrorsTable errors={rows} /> : null}
    </Stack>
  );
}

/**
 * CSV fayl tanlash va yuborish. Standart hajm chegarasidan katta fayl serverga yuborilmaydi
 * (ogohlantirish); server xatolari (qatorlar jadvali, 413) shu yerda ko'rsatiladi.
 */
export function StudentImportForm({ onSubmit, isPending, error }: StudentImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const tooLarge = file !== null && exceedsDefaultImportSize(file);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (file !== null && !tooLarge) {
          onSubmit(file).catch(() => undefined);
        }
      }}
    >
      <Stack gap="4">
        <FormField label="CSV fayl" hint={FILE_HINT} required>
          {({ invalid, required: _required, ...control }) => (
            <FileInput
              {...control}
              accept={CSV_ACCEPT}
              invalid={invalid || tooLarge}
              onFileChange={setFile}
            />
          )}
        </FormField>
        {tooLarge ? <Alert variant="warning">{TOO_LARGE_WARNING}</Alert> : null}
        {error !== null && !tooLarge ? <ImportError error={error} /> : null}
        <Stack direction="horizontal" justify="end">
          <Button type="submit" loading={isPending} disabled={file === null || tooLarge}>
            Import qilish
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
