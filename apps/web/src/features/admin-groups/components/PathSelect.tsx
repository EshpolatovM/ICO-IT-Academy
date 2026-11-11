'use client';

import { Select } from '@/components/ui';
import type { FormFieldControlProps, SelectProps } from '@/components/ui';

import { useLearningPaths } from '../hooks/useGroupQueries';

export interface PathSelectProps extends Omit<SelectProps, 'options' | 'required'> {
  control: FormFieldControlProps;
}

/** Ilm yo'lini tanlash (`GET /admin/paths`); yuklanayotganda — disabled. */
export function PathSelect({ control: { required, ...control }, ...props }: PathSelectProps) {
  const paths = useLearningPaths();
  const options = (paths.data ?? []).map((path) => ({ value: path.id, label: path.title }));
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
