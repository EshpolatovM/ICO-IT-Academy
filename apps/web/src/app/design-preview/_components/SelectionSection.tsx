'use client';

import { useState } from 'react';

import { Checkbox, Combobox, FormField, Stack, Text } from '@/components/ui';
import type { ComboboxOption } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const PEOPLE: readonly ComboboxOption[] = [
  { value: 'm1', label: 'Aziz Karimov', description: '+998 90 111 11 11' },
  { value: 'm2', label: 'Bekzod Aliyev', description: '+998 91 222 22 22' },
  { value: 'm3', label: 'Dilnoza Tursunova' },
  { value: 'st1', label: 'ST-10245 — Ali Valiyev' },
  { value: 'st2', label: 'ST-10246 — Barno Karimova' },
];

function useLocalSearch() {
  const [query, setQuery] = useState('');
  const needle = query.toLowerCase();
  const options = PEOPLE.filter((option) => option.label.toLowerCase().includes(needle));
  return { options, setQuery };
}

function CheckboxStates() {
  const [rows, setRows] = useState([true, false, false]);
  const checkedCount = rows.filter(Boolean).length;
  const allChecked = checkedCount === rows.length;
  return (
    <Stack gap="3">
      <Checkbox
        label="Hammasini tanlash (indeterminate)"
        checked={allChecked}
        indeterminate={checkedCount > 0 && !allChecked}
        onChange={() => {
          setRows(rows.map(() => !allChecked));
        }}
      />
      {rows.map((checked, index) => (
        <Checkbox
          key={`row-${String(index)}`}
          label={`Qator ${String(index + 1)}`}
          checked={checked}
          onChange={() => {
            setRows(rows.map((value, i) => (i === index ? !value : value)));
          }}
          className="pl-6"
        />
      ))}
      <Checkbox label="Izohli" description="Faqat faol studentlarni ko'rsatish" />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled, belgilangan" disabled defaultChecked />
      <FormField label="Xato holati (FormField bilan)" error="Rozilik shart">
        {(control) => <Checkbox {...control} />}
      </FormField>
    </Stack>
  );
}

function SingleCombobox() {
  const [value, setValue] = useState<ComboboxOption | null>(null);
  const { options, setQuery } = useLocalSearch();
  return (
    <FormField label="Mentor (Combobox)" hint="Yozing yoki ↓ bosing; Enter — tanlash, Esc — yopish">
      {(control) => (
        <Combobox
          value={value}
          onChange={setValue}
          options={options}
          onSearchChange={setQuery}
          placeholder="Mentorni qidiring"
          {...control}
        />
      )}
    </FormField>
  );
}

function MultipleCombobox() {
  const [value, setValue] = useState<ComboboxOption[]>([PEOPLE[3] as ComboboxOption]);
  const { options, setQuery } = useLocalSearch();
  return (
    <FormField label="Studentlar (Combobox multiple)">
      {(control) => (
        <Combobox
          multiple
          value={value}
          onChange={setValue}
          options={options}
          onSearchChange={setQuery}
          placeholder="Student qo'shish"
          {...control}
        />
      )}
    </FormField>
  );
}

function ComboboxStates() {
  const noop = () => undefined;
  return (
    <Stack gap="4">
      <SingleCombobox />
      <MultipleCombobox />
      <FormField label="Yuklanmoqda (bosib oching)">
        {(control) => <Combobox value={null} onChange={noop} options={[]} loading {...control} />}
      </FormField>
      <FormField label="Natija yo'q (bosib oching)">
        {(control) => (
          <Combobox
            value={null}
            onChange={noop}
            options={[]}
            emptyText="Mentor topilmadi"
            {...control}
          />
        )}
      </FormField>
      <FormField label="Xato holati" error="Mentor tanlanishi shart">
        {(control) => <Combobox value={null} onChange={noop} options={PEOPLE} {...control} />}
      </FormField>
      <FormField label="Disabled">
        {(control) => (
          <Combobox
            value={PEOPLE[0] ?? null}
            onChange={noop}
            options={PEOPLE}
            disabled
            {...control}
          />
        )}
      </FormField>
      <Text variant="small">
        Filtrlash bu yerda lokal; sahifalarda — feature hook (debounce + API).
      </Text>
    </Stack>
  );
}

/** Tanlash elementlari: Checkbox va Combobox. */
export function SelectionSection() {
  return (
    <PreviewSection
      id="selection"
      title="Tanlash elementlari"
      description="Checkbox (indeterminate, izoh, disabled, xato) va Combobox (bitta / multiple, yuklanmoqda, bo'sh, xato, disabled)."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <CheckboxStates />
        <ComboboxStates />
      </div>
    </PreviewSection>
  );
}
