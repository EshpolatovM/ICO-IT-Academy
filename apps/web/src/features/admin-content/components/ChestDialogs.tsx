'use client';

import { useCreateChest, useDeleteChest, useUpdateChest } from '../hooks/useNodeMutations';
import { chestFormDefaults, chestTopicOptions, EMPTY_CHEST_FORM } from '../lib/chest-form';

import { ChestForm } from './ChestForm';
import { ContentFormDialog } from './ContentFormDialog';
import { DeleteAction } from './DeleteAction';

import type { AdminChestNode, AdminSectionNode } from '../types/admin-content.types';

/** `POST /admin/sections/:id/chests` — bo'limda mavzu bo'lsagina. */
export function AddChestDialog({ section }: { section: AdminSectionNode }) {
  const create = useCreateChest(section.id);
  if (section.topics.length === 0) {
    return null;
  }
  return (
    <ContentFormDialog
      title={`Yangi sandiq: ${section.title}`}
      triggerLabel="+ Sandiq"
      triggerAriaLabel={`Sandiq qo'shish: ${section.title}`}
    >
      {(close) => (
        <ChestForm
          defaultValues={EMPTY_CHEST_FORM}
          topicOptions={chestTopicOptions(section, null)}
          submitLabel="Qo'shish"
          onCancel={close}
          onValid={async (values) => {
            await create.mutateAsync(values);
            close();
          }}
        />
      )}
    </ContentFormDialog>
  );
}

export interface ChestActionsProps {
  chest: AdminChestNode;
  section: AdminSectionNode;
}

/** Mavzu qatoridagi sandiq: "Sandiq: nom" (tahrirlash oynasi) va o'chirish. */
export function ChestActions({ chest, section }: ChestActionsProps) {
  const update = useUpdateChest(chest.id);
  const remove = useDeleteChest(chest.id);
  return (
    <>
      <ContentFormDialog
        title="Sandiqni tahrirlash"
        triggerLabel={`Sandiq: ${chest.title}`}
        triggerVariant="ghost"
      >
        {(close) => (
          <ChestForm
            defaultValues={chestFormDefaults(chest)}
            topicOptions={chestTopicOptions(section, chest.id)}
            submitLabel="Saqlash"
            onCancel={close}
            onValid={async (values) => {
              await update.mutateAsync(values);
              close();
            }}
          />
        )}
      </ContentFormDialog>
      <DeleteAction
        name={chest.title}
        mutation={remove}
        triggerLabel="Sandiqni o'chirish"
        description="Sandiq yo'ldan olib tashlanadi."
      />
    </>
  );
}
