import type { SelectOption } from '@/components/ui';

import type { ChestFormInput } from '../schemas/content-forms.schemas';
import type { AdminChestNode, AdminSectionNode } from '../types/admin-content.types';

export const EMPTY_CHEST_FORM: ChestFormInput = {
  title: '',
  afterTopicId: '',
  reward: { xp: { min: '', max: '' }, coin: { min: '', max: '' } },
};

export function chestFormDefaults({ title, afterTopicId, reward }: AdminChestNode): ChestFormInput {
  return {
    title,
    afterTopicId,
    reward: {
      xp: { min: String(reward.xp.min), max: String(reward.xp.max) },
      coin: { min: String(reward.coin.min), max: String(reward.coin.max) },
    },
  };
}

/** Sandiq mavzusi variantlari: shu bo'lim mavzulari; boshqa sandig'i bor mavzu — tanlab bo'lmaydi. */
export function chestTopicOptions(
  section: AdminSectionNode,
  chestId: string | null,
): SelectOption[] {
  return section.topics.map((topic) => ({
    value: topic.id,
    label: topic.title,
    disabled: section.chests.some(
      (chest) => chest.afterTopicId === topic.id && chest.id !== chestId,
    ),
  }));
}
