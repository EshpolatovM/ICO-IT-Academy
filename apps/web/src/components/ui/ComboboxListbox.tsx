'use client';

import { useEffect } from 'react';

import { cn } from '@/lib/cn';

import { Spinner } from './Spinner';

import type { ComboboxOption } from './Combobox.types';

export interface ComboboxListboxProps {
  id: string;
  /** Listbox nomi (ekran o'quvchilar uchun). */
  label: string;
  options: readonly ComboboxOption[];
  activeIndex: number;
  isSelected: (option: ComboboxOption) => boolean;
  getOptionId: (index: number) => string;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  onSelect: (option: ComboboxOption) => void;
  onActivate: (index: number) => void;
}

interface OptionRowProps {
  id: string;
  option: ComboboxOption;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
  onActivate: () => void;
}

function OptionRow({ id, option, active, selected, onSelect, onActivate }: OptionRowProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      // Input fokusni yo'qotmasligi uchun (aks holda blur ro'yxatni tanlovdan oldin yopadi).
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onSelect}
      onMouseMove={onActivate}
      className={cn(
        'flex cursor-pointer items-start gap-2 rounded-sm px-3 py-2 text-sm text-text',
        active && 'bg-surface-muted',
      )}
    >
      <span aria-hidden="true" className={cn('w-4 shrink-0', !selected && 'invisible')}>
        ✓
      </span>
      <span className="flex flex-col">
        <span className={cn(selected && 'font-medium')}>{option.label}</span>
        {option.description !== undefined ? (
          <span className="text-xs text-text-muted">{option.description}</span>
        ) : null}
      </span>
    </li>
  );
}

/** Holat qatori (yuklanmoqda / natija yo'q) — `option` emas, shuning uchun tanlab bo'lmaydi. */
function StatusRow({ loading, text }: { loading: boolean; text: string }) {
  return (
    <li role="presentation" className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted">
      {loading ? <Spinner size="sm" label={text} /> : null}
      <span aria-hidden={loading || undefined}>{text}</span>
    </li>
  );
}

/** Combobox ochilgandagi variantlar ro'yxati (WAI-ARIA `listbox`). */
export function ComboboxListbox({
  id,
  label,
  options,
  activeIndex,
  isSelected,
  getOptionId,
  loading,
  loadingText,
  emptyText,
  onSelect,
  onActivate,
}: ComboboxListboxProps) {
  const activeId = activeIndex >= 0 ? getOptionId(activeIndex) : null;

  useEffect(() => {
    // Klaviatura bilan tanlangan variant ko'rinadigan joyga suriladi (jsdom'da metod yo'q).
    const element = activeId === null ? null : document.getElementById(activeId);
    if (element !== null && 'scrollIntoView' in element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId]);

  return (
    <ul
      id={id}
      role="listbox"
      aria-label={label}
      aria-busy={loading || undefined}
      className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-bg p-1 shadow-sm"
    >
      {options.map((option, index) => (
        <OptionRow
          key={option.value}
          id={getOptionId(index)}
          option={option}
          active={index === activeIndex}
          selected={isSelected(option)}
          onSelect={() => {
            onSelect(option);
          }}
          onActivate={() => {
            onActivate(index);
          }}
        />
      ))}
      {loading ? <StatusRow loading text={loadingText} /> : null}
      {!loading && options.length === 0 ? <StatusRow loading={false} text={emptyText} /> : null}
    </ul>
  );
}
