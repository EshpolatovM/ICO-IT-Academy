'use client';

import type { SelectOption } from '@/components/ui';
import { FormTextField } from '@/features/auth';

import { useContentForm } from '../hooks/useContentForm';
import { chestFormSchema } from '../schemas/content-forms.schemas';

import { ContentFormShell } from './ContentFormShell';
import { SelectField } from './SelectField';

import type { ChestFormInput, ChestFormValues } from '../schemas/content-forms.schemas';

type RewardKind = 'xp' | 'coin';
type RewardBound = 'min' | 'max';

interface RewardField {
  name: `reward.${RewardKind}.${RewardBound}`;
  kind: RewardKind;
  bound: RewardBound;
  label: string;
}

const REWARD_FIELDS: readonly RewardField[] = [
  { name: 'reward.xp.min', kind: 'xp', bound: 'min', label: 'XP (eng kam)' },
  { name: 'reward.xp.max', kind: 'xp', bound: 'max', label: "XP (eng ko'p)" },
  { name: 'reward.coin.min', kind: 'coin', bound: 'min', label: 'Coin (eng kam)' },
  { name: 'reward.coin.max', kind: 'coin', bound: 'max', label: "Coin (eng ko'p)" },
];

/** Server maydon nomlari forma maydonlari bilan bir xil (`reward.xp.max` — §2.2 refine xatosi). */
const CHEST_SERVER_FIELDS = {
  title: 'title',
  afterTopicId: 'afterTopicId',
  'reward.xp.min': 'reward.xp.min',
  'reward.xp.max': 'reward.xp.max',
  'reward.coin.min': 'reward.coin.min',
  'reward.coin.max': 'reward.coin.max',
} as const;

export interface ChestFormProps {
  defaultValues: ChestFormInput;
  /** Shu bo'limdagi mavzular; sandig'i bor mavzular — `disabled`. */
  topicOptions: readonly SelectOption[];
  submitLabel: string;
  onValid: (values: ChestFormValues) => Promise<unknown>;
  onCancel: () => void;
}

/** Sandiq formasi: nom, qaysi mavzudan keyin, mukofot oralig'i (qat'iy qiymat — min = max). */
export function ChestForm({
  defaultValues,
  topicOptions,
  submitLabel,
  onValid,
  onCancel,
}: ChestFormProps) {
  const { form, errors, shell } = useContentForm({
    schema: chestFormSchema,
    defaultValues,
    serverFields: CHEST_SERVER_FIELDS,
    onValid,
    submitLabel,
    onCancel,
  });

  return (
    <ContentFormShell {...shell}>
      <FormTextField
        label="Nom"
        registration={form.register('title')}
        error={errors.title?.message}
      />
      <SelectField
        label="Qaysi mavzudan keyin"
        required
        placeholder="Mavzuni tanlang"
        options={topicOptions}
        registration={form.register('afterTopicId')}
        error={errors.afterTopicId?.message}
      />
      {REWARD_FIELDS.map(({ name, kind, bound, label }) => (
        <FormTextField
          key={name}
          label={label}
          inputMode="numeric"
          registration={form.register(name)}
          error={errors.reward?.[kind]?.[bound]?.message}
        />
      ))}
    </ContentFormShell>
  );
}
