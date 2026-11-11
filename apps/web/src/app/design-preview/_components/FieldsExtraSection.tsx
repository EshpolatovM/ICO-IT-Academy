'use client';

import { useState } from 'react';

import {
  DateInput,
  FileInput,
  FormField,
  SearchInput,
  Select,
  Stack,
  Textarea,
} from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const GROUP_OPTIONS = [
  { value: 'fe-1', label: 'Frontend-1' },
  { value: 'py-2', label: 'Python-2' },
  { value: 'old', label: 'Arxivlangan guruh', disabled: true },
] as const;

function SelectAndSearch() {
  const [query, setQuery] = useState('ST-10');
  return (
    <Stack gap="4">
      <FormField label="Qidiruv (SearchInput)" hint="ID yoki ism bo'yicha">
        {(control) => (
          <SearchInput value={query} onValueChange={setQuery} placeholder="Qidirish" {...control} />
        )}
      </FormField>
      <FormField label="Guruh (Select)" required>
        {(control) => <Select options={GROUP_OPTIONS} placeholder="Guruhni tanlang" {...control} />}
      </FormField>
      <FormField label="Select xato holati" error="Guruh tanlanishi shart">
        {(control) => <Select options={GROUP_OPTIONS} placeholder="Guruhni tanlang" {...control} />}
      </FormField>
      <FormField label="Select disabled">
        {(control) => (
          <Select options={GROUP_OPTIONS} placeholder="Hammasi" disabled {...control} />
        )}
      </FormField>
    </Stack>
  );
}

function TextareaAndFile() {
  return (
    <Stack gap="4">
      <FormField label="Izoh (Textarea)" hint="Ixtiyoriy">
        {(control) => <Textarea placeholder="Matn kiriting" {...control} />}
      </FormField>
      <FormField label="Textarea xato holati" error="Izoh juda uzun">
        {(control) => <Textarea defaultValue="..." {...control} />}
      </FormField>
      <FormField label="CSV fayl (FileInput)" hint="Faqat .csv">
        {(control) => <FileInput accept=".csv,text/csv" {...control} />}
      </FormField>
      <FormField label="FileInput xato holati" error="Fayl tanlang">
        {(control) => <FileInput accept=".csv" {...control} />}
      </FormField>
      <FormField label="FileInput disabled">
        {(control) => <FileInput disabled {...control} />}
      </FormField>
    </Stack>
  );
}

function DateFields() {
  const [startsAt, setStartsAt] = useState('');
  const [filled, setFilled] = useState('2026-11-11');
  return (
    <Stack gap="4">
      <FormField label="Boshlanish sanasi (DateInput)" hint={startsAt === '' ? 'Bo`sh' : startsAt}>
        {(control) => <DateInput value={startsAt} onChange={setStartsAt} {...control} />}
      </FormField>
      <FormField label="DateInput min/max bilan" hint="2026-yil ichida">
        {(control) => (
          <DateInput
            value={filled}
            onChange={setFilled}
            min="2026-01-01"
            max="2026-12-31"
            {...control}
          />
        )}
      </FormField>
      <FormField label="DateInput xato holati" error="Sana noto'g'ri">
        {(control) => <DateInput value="" onChange={setStartsAt} {...control} />}
      </FormField>
      <FormField label="DateInput disabled">
        {(control) => <DateInput value="2026-09-01" onChange={setStartsAt} disabled {...control} />}
      </FormField>
    </Stack>
  );
}

/** Qo'shimcha forma elementlari: SearchInput, Select, Textarea, FileInput, DateInput. */
export function FieldsExtraSection() {
  return (
    <PreviewSection
      id="fields-extra"
      title="Qo'shimcha forma elementlari"
      description="SearchInput, Select, Textarea, FileInput, DateInput — oddiy, focus (Tab), disabled va xato holatlari."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <SelectAndSearch />
        <TextareaAndFile />
        <DateFields />
      </div>
    </PreviewSection>
  );
}
