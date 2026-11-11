'use client';

import { useGroupOptions } from '../hooks/useLookupOptions';

import { LookupCombobox } from './LookupCombobox';

import type { SingleLookupComboboxProps } from './LookupCombobox';

export type GroupComboboxProps = SingleLookupComboboxProps;

/** Faol guruhni qidirib tanlash (bitta). `FormField` render-prop'i ichida ishlatiladi. */
export function GroupCombobox(props: GroupComboboxProps) {
  const groups = useGroupOptions();
  return (
    <LookupCombobox props={props} lookup={groups} listLabel="Guruhlar" placeholder="Guruh nomi" />
  );
}
