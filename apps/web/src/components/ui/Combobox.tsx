'use client';

import { useId, useRef } from 'react';

import { cn } from '@/lib/cn';

import { focusRing, focusWithinRing } from './classes';
import { ComboboxChips } from './ComboboxChips';
import { ComboboxListbox } from './ComboboxListbox';
import { getComboboxSelection } from './comboboxSelection';
import { useCombobox } from './useCombobox';

import type { ComboboxProps } from './Combobox.types';
import type { ComboboxSelection } from './comboboxSelection';
import type { ComboboxState } from './useCombobox';
import type { RefObject } from 'react';

const DEFAULT_TEXTS = {
  empty: 'Hech narsa topilmadi',
  loading: 'Yuklanmoqda',
  list: 'Variantlar',
  clear: 'Tozalash',
  remove: 'olib tashlash',
} as const;

interface ClearButtonProps {
  label: string;
  onClear: () => void;
}

function ClearButton({ label, onClear }: ClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className={cn('rounded-sm px-1 text-sm text-text-muted hover:text-text', focusRing)}
    >
      {label}
    </button>
  );
}

/** Input'da ko'rinadigan matn: bitta rejimda yopiq holatda — tanlangan variant yorlig'i. */
function getInputText(props: ComboboxProps, state: ComboboxState): string {
  if (props.multiple === true || state.open) {
    return state.query;
  }
  return props.value?.label ?? '';
}

/** Bitta rejimda ochiq holatda placeholder o'rnida tanlangan variant ko'rinadi. */
function getPlaceholder(props: ComboboxProps, state: ComboboxState): string | undefined {
  if (props.multiple !== true && state.open && props.value !== null) {
    return props.value.label;
  }
  return props.placeholder;
}

interface ExtrasProps {
  props: ComboboxProps;
  selection: ComboboxSelection;
  inputRef: RefObject<HTMLInputElement | null>;
}

/** Bitta rejimda tanlov bo'lsa — "Tozalash" tugmasi. */
function SingleClear({ props, selection, inputRef }: ExtrasProps) {
  if (props.multiple === true || props.value === null || props.disabled === true) {
    return null;
  }
  const { value } = props;
  return (
    <ClearButton
      label={props.clearLabel ?? DEFAULT_TEXTS.clear}
      onClear={() => {
        selection.remove(value);
        inputRef.current?.focus();
      }}
    />
  );
}

/** Ko'p rejimda tanlanganlar — chip'lar. */
function MultipleChips({ props, selection }: Omit<ExtrasProps, 'inputRef'>) {
  if (props.multiple !== true) {
    return null;
  }
  return (
    <ComboboxChips
      options={selection.selected}
      removeLabel={props.removeLabel ?? DEFAULT_TEXTS.remove}
      disabled={props.disabled === true}
      onRemove={selection.remove}
    />
  );
}

function shellClasses(props: ComboboxProps): string {
  return cn(
    'flex w-full flex-wrap items-center gap-1 rounded-md border border-border bg-bg px-3 py-2 text-sm',
    focusWithinRing,
    props.invalid === true && 'border-danger',
    props.disabled === true && 'cursor-not-allowed bg-surface-muted',
  );
}

const inputClasses =
  'min-w-24 flex-1 bg-transparent text-text outline-none placeholder:text-text-disabled disabled:cursor-not-allowed disabled:text-text-disabled';

interface ComboboxIds {
  inputId: string;
  listboxId: string;
  getOptionId: (index: number) => string;
}

interface InputPartProps {
  props: ComboboxProps;
  state: ComboboxState;
  ids: ComboboxIds;
  inputRef: RefObject<HTMLInputElement | null>;
}

/** `role="combobox"` input'i: ARIA bog'lanishlar va klaviatura. */
function ComboboxInput({ props, state, ids, inputRef }: InputPartProps) {
  const activeId = state.open && state.activeIndex >= 0 ? ids.getOptionId(state.activeIndex) : null;
  return (
    <input
      ref={inputRef}
      id={ids.inputId}
      type="text"
      role="combobox"
      autoComplete="off"
      aria-autocomplete="list"
      aria-expanded={state.open}
      aria-controls={state.open ? ids.listboxId : undefined}
      aria-activedescendant={activeId ?? undefined}
      aria-label={props['aria-label']}
      aria-describedby={props['aria-describedby']}
      aria-invalid={props.invalid === true || props['aria-invalid'] === true || undefined}
      aria-required={props.required}
      disabled={props.disabled}
      value={getInputText(props, state)}
      placeholder={getPlaceholder(props, state)}
      onChange={(event) => {
        state.changeQuery(event.target.value);
      }}
      onClick={state.openList}
      onKeyDown={state.onKeyDown}
      className={inputClasses}
    />
  );
}

interface ListPartProps {
  props: ComboboxProps;
  state: ComboboxState;
  ids: ComboboxIds;
  selection: ComboboxSelection;
}

function ComboboxOptions({ props, state, ids, selection }: ListPartProps) {
  return (
    <ComboboxListbox
      id={ids.listboxId}
      label={props.listLabel ?? DEFAULT_TEXTS.list}
      options={props.options}
      activeIndex={state.activeIndex}
      isSelected={selection.isSelected}
      getOptionId={ids.getOptionId}
      loading={props.loading === true}
      loadingText={props.loadingText ?? DEFAULT_TEXTS.loading}
      emptyText={props.emptyText ?? DEFAULT_TEXTS.empty}
      onSelect={state.select}
      onActivate={state.setActiveIndex}
    />
  );
}

function useComboboxIds(id: string | undefined): ComboboxIds {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return {
    inputId,
    listboxId: `${inputId}-listbox`,
    getOptionId: (index) => `${inputId}-option-${String(index)}`,
  };
}

/**
 * Qidiruvli tanlash (WAI-ARIA combobox + listbox). Bitta yoki `multiple` tanlov.
 * Variantlarni filtrlash va so'rov — feature'da (`onSearchChange`), komponent faqat ko'rsatadi.
 * Klaviatura: ↓/↑ — variantlar bo'ylab, Enter — tanlash, Esc — yopish.
 */
export function Combobox(props: ComboboxProps) {
  const ids = useComboboxIds(props.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const selection = getComboboxSelection(props);
  const state = useCombobox({
    options: props.options,
    disabled: props.disabled === true,
    onSearchChange: props.onSearchChange,
    onSelect: selection.pick,
    single: props.multiple !== true,
    rootRef,
  });

  return (
    <div ref={rootRef} className={cn('relative', props.className)} onBlur={state.onRootBlur}>
      <div className={shellClasses(props)}>
        <MultipleChips props={props} selection={selection} />
        <ComboboxInput props={props} state={state} ids={ids} inputRef={inputRef} />
        <SingleClear props={props} selection={selection} inputRef={inputRef} />
      </div>
      {state.open ? (
        <ComboboxOptions props={props} state={state} ids={ids} selection={selection} />
      ) : null}
    </div>
  );
}
