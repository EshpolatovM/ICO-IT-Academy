'use client';

import { useState } from 'react';

import type { ComboboxOption } from './Combobox.types';
import type { KeyboardEvent } from 'react';

const NO_ACTIVE = -1;

interface UseComboboxParams {
  options: readonly ComboboxOption[];
  disabled: boolean;
  onSearchChange: ((query: string) => void) | undefined;
  onSelect: (option: ComboboxOption) => void;
  /** Bitta tanlovli rejim: tanlangach ro'yxat yopiladi, yopilganda qidiruv matni tozalanadi. */
  single: boolean;
}

export interface ComboboxState {
  open: boolean;
  query: string;
  /** Faol (klaviatura bilan belgilangan) variant indeksi yoki -1. */
  activeIndex: number;
  openList: () => void;
  close: () => void;
  changeQuery: (query: string) => void;
  select: (option: ComboboxOption) => void;
  setActiveIndex: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function step(current: number, delta: number, count: number): number {
  if (current === NO_ACTIVE) {
    return delta > 0 ? 0 : count - 1;
  }
  return (current + delta + count) % count;
}

interface KeyContext {
  open: boolean;
  activeOption: ComboboxOption | undefined;
  move: (delta: number) => void;
  select: (option: ComboboxOption) => void;
  close: () => void;
}

/** Klaviatura amallari; `true` — tugma ishlatildi (brauzer standart xatti-harakati to'xtatiladi). */
const KEY_HANDLERS: Partial<Record<string, (context: KeyContext) => boolean>> = {
  ArrowDown: ({ move }) => {
    move(1);
    return true;
  },
  ArrowUp: ({ move }) => {
    move(-1);
    return true;
  },
  Enter: ({ open, activeOption, select }) => {
    if (!open || activeOption === undefined) {
      return false;
    }
    select(activeOption);
    return true;
  },
  Escape: ({ open, close }) => {
    if (open) {
      close();
    }
    return open;
  },
};

function createKeyDownHandler(disabled: boolean, context: KeyContext) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    const handler = disabled ? undefined : KEY_HANDLERS[event.key];
    if (handler?.(context) === true) {
      event.preventDefault();
    }
  };
}

/** Faol variant indeksi; natijalar yangilanib qisqarsa, eski indeks chegaradan chiqmaydi. */
function useActiveIndex(count: number): [number, (index: number) => void] {
  const [rawIndex, setIndex] = useState(NO_ACTIVE);
  return [rawIndex < count ? rawIndex : NO_ACTIVE, setIndex];
}

interface ListStateParams {
  single: boolean;
  onSearchChange: ((query: string) => void) | undefined;
  resetActive: () => void;
}

/** Ochiq/yopiq holat va qidiruv matni; bitta rejimda yopilganda matn tozalanadi. */
function useListState({ single, onSearchChange, resetActive }: ListStateParams) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const changeQuery = (next: string) => {
    setQuery(next);
    resetActive();
    setOpen(true);
    onSearchChange?.(next);
  };

  const close = () => {
    setOpen(false);
    resetActive();
    if (single && query !== '') {
      setQuery('');
      onSearchChange?.('');
    }
  };

  return { open, setOpen, query, changeQuery, close };
}

/** Combobox holati: ochiq/yopiq, qidiruv matni, faol variant va klaviatura (↑ ↓ Enter Esc). */
export function useCombobox({
  options,
  disabled,
  onSearchChange,
  onSelect,
  single,
}: UseComboboxParams): ComboboxState {
  const [activeIndex, setActiveIndex] = useActiveIndex(options.length);
  const { open, setOpen, query, changeQuery, close } = useListState({
    single,
    onSearchChange,
    resetActive: () => {
      setActiveIndex(NO_ACTIVE);
    },
  });

  const select = (option: ComboboxOption) => {
    onSelect(option);
    if (single) {
      close();
    }
  };

  const move = (delta: number) => {
    setOpen(true);
    if (options.length > 0) {
      setActiveIndex(step(open ? activeIndex : NO_ACTIVE, delta, options.length));
    }
  };

  const onKeyDown = createKeyDownHandler(disabled, {
    open,
    activeOption: options[activeIndex],
    move,
    select,
    close,
  });

  const openList = () => {
    setOpen((current) => current || !disabled);
  };

  return {
    open,
    query,
    activeIndex,
    openList,
    close,
    changeQuery,
    select,
    setActiveIndex,
    onKeyDown,
  };
}
