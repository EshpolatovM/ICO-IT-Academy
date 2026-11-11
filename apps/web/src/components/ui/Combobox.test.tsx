import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from './Combobox';
import { FormField } from './FormField';

import type { ComboboxOption } from './Combobox.types';

const MENTORS: readonly ComboboxOption[] = [
  { value: 'm1', label: 'Aziz Karimov', description: '+998 90 111 11 11' },
  { value: 'm2', label: 'Bekzod Aliyev' },
  { value: 'm3', label: 'Dilnoza Tursunova' },
];

function filterOptions(query: string): readonly ComboboxOption[] {
  const needle = query.toLowerCase();
  return MENTORS.filter((option) => option.label.toLowerCase().includes(needle));
}

function SingleHarness({ onSearch }: { onSearch?: (query: string) => void }) {
  const [value, setValue] = useState<ComboboxOption | null>(null);
  const [query, setQuery] = useState('');
  return (
    <Combobox
      aria-label="Mentor"
      value={value}
      onChange={setValue}
      options={filterOptions(query)}
      onSearchChange={(next) => {
        setQuery(next);
        onSearch?.(next);
      }}
    />
  );
}

function MultipleHarness() {
  const [value, setValue] = useState<ComboboxOption[]>([MENTORS[0] as ComboboxOption]);
  return (
    <Combobox
      multiple
      aria-label="Studentlar"
      value={value}
      onChange={setValue}
      options={MENTORS}
    />
  );
}

describe('Combobox — bitta tanlov', () => {
  it('ARIA: yopiq holatda aria-expanded=false, listbox yo`q', () => {
    render(<SingleHarness />);
    const input = screen.getByRole('combobox', { name: 'Mentor' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('yozish qidiruvni chaqiradi va natijani ko`rsatadi', async () => {
    const onSearch = vi.fn();
    render(<SingleHarness onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('combobox'), 'bek');
    expect(onSearch).toHaveBeenLastCalledWith('bek');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Bekzod Aliyev' })).toBeInTheDocument();
  });

  it('klaviatura: ↓ ↓ ↑ faol variantni o`zgartiradi, Enter tanlaydi va yopadi', async () => {
    render(<SingleHarness />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const second = screen.getByRole('option', { name: 'Bekzod Aliyev' });
    expect(input).toHaveAttribute('aria-activedescendant', second.id);
    await userEvent.keyboard('{ArrowUp}');
    const first = screen.getByRole('option', { name: /Aziz Karimov/ });
    expect(input).toHaveAttribute('aria-activedescendant', first.id);
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('Aziz Karimov');
  });

  it('Esc ro`yxatni yopadi, sichqoncha bilan tanlash ishlaydi, Tozalash qiymatni o`chiradi', async () => {
    render(<SingleHarness />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Dilnoza Tursunova' }));
    expect(input).toHaveValue('Dilnoza Tursunova');
    expect(input).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('yuklanish va bo`sh natija holatlari', async () => {
    const { rerender } = render(
      <Combobox aria-label="Mentor" value={null} onChange={vi.fn()} options={[]} loading />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Yuklanmoqda');
    rerender(
      <Combobox
        aria-label="Mentor"
        value={null}
        onChange={vi.fn()}
        options={[]}
        emptyText="Yo'q"
      />,
    );
    expect(screen.getByText("Yo'q")).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('disabled: ochilmaydi; FormField bilan xato holati', async () => {
    render(
      <FormField label="Mentor" error="Mentor tanlang">
        {(control) => (
          <Combobox value={null} onChange={vi.fn()} options={MENTORS} disabled {...control} />
        )}
      </FormField>,
    );
    const input = screen.getByRole('combobox', { name: 'Mentor' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Mentor tanlang');
    await userEvent.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Combobox — multiple', () => {
  it('tanlanganlar chip, variant bosilsa qo`shiladi/olib tashlanadi, ro`yxat ochiq qoladi', async () => {
    render(<MultipleHarness />);
    const input = screen.getByRole('combobox', { name: 'Studentlar' });
    expect(
      screen.getByRole('button', { name: 'Aziz Karimov — olib tashlash' }),
    ).toBeInTheDocument();

    await userEvent.click(input);
    expect(screen.getByRole('option', { name: /Aziz Karimov/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(screen.getByRole('option', { name: 'Bekzod Aliyev' }));
    expect(
      screen.getByRole('button', { name: 'Bekzod Aliyev — olib tashlash' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: 'Bekzod Aliyev' }));
    expect(screen.queryByRole('button', { name: 'Bekzod Aliyev — olib tashlash' })).toBeNull();
  });

  it('chip tugmasi bilan olib tashlash', async () => {
    render(<MultipleHarness />);
    await userEvent.click(screen.getByRole('button', { name: 'Aziz Karimov — olib tashlash' }));
    expect(screen.queryByText('Aziz Karimov')).not.toBeInTheDocument();
  });
});
