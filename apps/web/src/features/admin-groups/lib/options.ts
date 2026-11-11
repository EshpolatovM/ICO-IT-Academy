import type { MentorListItem, StudentListItem } from '@lms/shared';

import type { ComboboxOption } from '@/components/ui';

import { personName } from './format';

/** Mentor → Combobox varianti (tavsif — telefon). */
export function toMentorOption(mentor: MentorListItem): ComboboxOption {
  return { value: mentor.id, label: personName(mentor), description: mentor.phone };
}

/** Student → Combobox varianti (tavsif — ID va joriy guruhi). */
export function toStudentOption(student: StudentListItem): ComboboxOption {
  const group = student.group === null ? 'guruhsiz' : student.group.name;
  return {
    value: student.id,
    label: personName(student),
    description: `${student.studentCode} · ${group}`,
  };
}
