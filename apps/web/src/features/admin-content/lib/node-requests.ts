import type { NodeFormInput, NodeFormValues } from '../schemas/content-forms.schemas';
import type {
  CreateTopicRequest,
  UpdateSectionRequest,
  UpdateTopicRequest,
} from '../types/admin-content-api.types';
import type { AdminSectionNode, AdminTopicNode } from '../types/admin-content.types';

/** Bo'lim/mavzu formasi qiymatlari ↔ API so'rovlari. */

/** Yaratish: bo'sh ixtiyoriy maydonlar yuborilmaydi, `status` server tomonidan `DRAFT`. */
export function toCreateNode({ title, description, icon }: NodeFormValues): CreateTopicRequest {
  return { title, description: description ?? undefined, icon: icon ?? undefined };
}

export function toCreateSection(values: NodeFormValues): { title: string; description?: string } {
  const { icon: _icon, ...rest } = toCreateNode(values);
  return rest;
}

export function toUpdateSection({
  title,
  description,
  status,
}: NodeFormValues): UpdateSectionRequest {
  return { title, description, status };
}

export function toUpdateTopic({
  title,
  description,
  icon,
  status,
}: NodeFormValues): UpdateTopicRequest {
  return { title, description, icon, status };
}

export function nodeFormDefaults(node: AdminSectionNode | AdminTopicNode): NodeFormInput {
  return {
    title: node.title,
    description: node.description ?? '',
    icon: 'icon' in node ? (node.icon ?? '') : '',
    status: node.status,
  };
}
