'use client';

import { useRouter } from 'next/navigation';

import { useCreatePath, useUpdatePath } from '../hooks/usePathMutations';
import { pathTreePath } from '../lib/admin-content-paths';

import { ContentFormDialog } from './ContentFormDialog';
import { EMPTY_PATH_FORM, PathForm } from './PathForm';

import type { AdminPathItem } from '../types/admin-content.types';

/** "Yangi yo'l": muvaffaqiyatda yo'l daraxti muharririga o'tiladi. */
export function CreatePathDialog() {
  const router = useRouter();
  const create = useCreatePath();
  return (
    <ContentFormDialog
      title="Yangi yo'l"
      triggerLabel="Yangi yo'l"
      triggerVariant="primary"
      triggerSize="md"
    >
      {(close) => (
        <PathForm
          defaultValues={EMPTY_PATH_FORM}
          submitLabel="Yaratish"
          onCancel={close}
          onValid={async ({ description, ...values }) => {
            const path = await create.mutateAsync({
              ...values,
              description: description ?? undefined,
            });
            close();
            router.push(pathTreePath(path.id));
          }}
        />
      )}
    </ContentFormDialog>
  );
}

export type EditablePath = Pick<AdminPathItem, 'id' | 'title' | 'slug' | 'description'>;

/** Yo'lni tahrirlash (`PATCH /admin/paths/:id`). */
export function EditPathDialog({ path }: { path: EditablePath }) {
  const update = useUpdatePath(path.id);
  return (
    <ContentFormDialog
      title="Yo'lni tahrirlash"
      triggerLabel="Tahrirlash"
      triggerAriaLabel={`Tahrirlash: ${path.title}`}
    >
      {(close) => (
        <PathForm
          defaultValues={{
            title: path.title,
            slug: path.slug,
            description: path.description ?? '',
          }}
          submitLabel="Saqlash"
          onCancel={close}
          onValid={async (values) => {
            await update.mutateAsync(values);
            close();
          }}
        />
      )}
    </ContentFormDialog>
  );
}
