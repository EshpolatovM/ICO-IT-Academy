'use client';

import {
  useCreateSection,
  useCreateTopic,
  useUpdateSection,
  useUpdateTopic,
} from '../hooks/useNodeMutations';
import {
  nodeFormDefaults,
  toCreateNode,
  toCreateSection,
  toUpdateSection,
  toUpdateTopic,
} from '../lib/node-requests';

import { ContentFormDialog } from './ContentFormDialog';
import { EMPTY_NODE_FORM, NodeForm } from './NodeForm';

import type { ContentFormDialogProps } from './ContentFormDialog';
import type { NodeFormValues } from '../schemas/content-forms.schemas';
import type { AdminSectionNode, AdminTopicNode } from '../types/admin-content.types';

interface NodeDialogProps extends Omit<ContentFormDialogProps, 'children'> {
  node?: AdminSectionNode | AdminTopicNode;
  withIcon: boolean;
  onValid: (values: NodeFormValues) => Promise<unknown>;
}

/** Bo'lim/mavzu forma oynasi: `node` berilsa — tahrirlash (holat bilan), aks holda yaratish. */
function NodeDialog({ node, withIcon, onValid, ...dialog }: NodeDialogProps) {
  return (
    <ContentFormDialog {...dialog}>
      {(close) => (
        <NodeForm
          defaultValues={node === undefined ? EMPTY_NODE_FORM : nodeFormDefaults(node)}
          submitLabel={node === undefined ? "Qo'shish" : 'Saqlash'}
          withIcon={withIcon}
          withStatus={node !== undefined}
          onCancel={close}
          onValid={async (values) => {
            await onValid(values);
            close();
          }}
        />
      )}
    </ContentFormDialog>
  );
}

/** `POST /admin/paths/:id/sections` (oxiriga, `DRAFT`). */
export function AddSectionDialog({ pathId }: { pathId: string }) {
  const create = useCreateSection(pathId);
  return (
    <NodeDialog
      title="Yangi bo'lim"
      triggerLabel="Bo'lim qo'shish"
      triggerVariant="primary"
      triggerSize="md"
      withIcon={false}
      onValid={(values) => create.mutateAsync(toCreateSection(values))}
    />
  );
}

/** `PATCH /admin/sections/:id`. */
export function EditSectionDialog({ section }: { section: AdminSectionNode }) {
  const update = useUpdateSection(section.id);
  return (
    <NodeDialog
      title="Bo'limni tahrirlash"
      triggerLabel="Tahrirlash"
      triggerAriaLabel={`Tahrirlash: ${section.title}`}
      node={section}
      withIcon={false}
      onValid={(values) => update.mutateAsync(toUpdateSection(values))}
    />
  );
}

/** `POST /admin/sections/:id/topics`. */
export function AddTopicDialog({ section }: { section: AdminSectionNode }) {
  const create = useCreateTopic(section.id);
  return (
    <NodeDialog
      title={`Yangi mavzu: ${section.title}`}
      triggerLabel="+ Mavzu"
      triggerAriaLabel={`Mavzu qo'shish: ${section.title}`}
      withIcon
      onValid={(values) => create.mutateAsync(toCreateNode(values))}
    />
  );
}

/** `PATCH /admin/topics/:id` (bo'limga ko'chirish yo'q, Q-2). */
export function EditTopicDialog({ topic }: { topic: AdminTopicNode }) {
  const update = useUpdateTopic(topic.id);
  return (
    <NodeDialog
      title="Mavzuni tahrirlash"
      triggerLabel="Tahrirlash"
      triggerAriaLabel={`Tahrirlash: ${topic.title}`}
      node={topic}
      withIcon
      onValid={(values) => update.mutateAsync(toUpdateTopic(values))}
    />
  );
}
