'use client';

import { ContentStatus } from '@lms/shared';

import { Select } from '@/components/ui';
import type { FormFieldControlProps, SelectProps } from '@/components/ui';

import { useLearningPaths } from '../hooks/useGroupQueries';

export interface PathSelectProps extends Omit<SelectProps, 'options' | 'required'> {
  control: FormFieldControlProps;
  /** Guruh yaratishda arxivlangan yo'l tanlanmaydi (server 400 `pathId` qaytaradi, B20 R Q-6). */
  excludeArchived?: boolean;
}

/** Ilm yo'lini tanlash (`GET /admin/paths`); yuklanayotganda — disabled. */
export function PathSelect({
  control: { required, ...control },
  excludeArchived = false,
  ...props
}: PathSelectProps) {
  const paths = useLearningPaths();
  const options = (paths.data ?? [])
    .filter((path) => !excludeArchived || path.status !== ContentStatus.ARCHIVED)
    .map((path) => ({ value: path.id, label: path.title }));
  return (
    <Select
      {...control}
      {...props}
      required={required}
      options={options}
      disabled={props.disabled === true || paths.isPending}
    />
  );
}
