'use client';

import { useMentorOptions } from '../hooks/useLookupOptions';

import { LookupCombobox } from './LookupCombobox';

import type { SingleLookupComboboxProps } from './LookupCombobox';

export type MentorComboboxProps = SingleLookupComboboxProps;

/** Faol mentorni qidirib tanlash (bitta). `FormField` render-prop'i ichida ishlatiladi. */
export function MentorCombobox(props: MentorComboboxProps) {
  const mentors = useMentorOptions();
  return (
    <LookupCombobox
      props={props}
      lookup={mentors}
      listLabel="Mentorlar"
      placeholder="Mentor ismi yoki telefoni"
    />
  );
}
