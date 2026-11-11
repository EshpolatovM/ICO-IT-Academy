'use client';

import { useState } from 'react';

import { ErrorCode } from '@lms/shared';

import { Alert, Button, FileInput, FormField, Stack } from '@/components/ui';
import { errorMessage, isApiError } from '@/lib/api';

import { importRowErrors } from '../lib/import-errors';

import { ImportErrorsTable } from './ImportErrorsTable';

const CSV_ACCEPT = '.csv,text/csv';
const FILE_HINT = "UTF-8, sarlavhali CSV. Fayl hajmi standart bo'yicha 1 MiB gacha.";
const TOO_LARGE_HINT = "Faylni bir nechta kichik faylga bo'lib, alohida yuklang.";

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

/** CSV fayl tanlash va yuborish; xatolar (qatorlar jadvali, 413) shu yerda ko'rsatiladi. */
export function StudentImportForm({ onSubmit, isPending, error }: StudentImportFormProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (file !== null) {
          onSubmit(file).catch(() => undefined);
        }
      }}
    >
      <Stack gap="4">
        <FormField label="CSV fayl" hint={FILE_HINT} required>
          {({ invalid, required: _required, ...control }) => (
            <FileInput {...control} accept={CSV_ACCEPT} invalid={invalid} onFileChange={setFile} />
          )}
        </FormField>
        {error !== null ? <ImportError error={error} /> : null}
        <Stack direction="horizontal" justify="end">
          <Button type="submit" loading={isPending} disabled={file === null}>
            Import qilish
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
