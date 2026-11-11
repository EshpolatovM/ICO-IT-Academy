'use client';

import { useEffect, useRef, useState } from 'react';

import type { ComboboxOption } from './Combobox.types';
import type { FocusEvent, KeyboardEvent, RefObject } from 'react';

const NO_ACTIVE = -1;

interface UseComboboxParams {
  options: readonly ComboboxOption[];
  disabled: boolean;
  onSearchChange: ((query: string) => void) | undefined;
  onSelect: (option: ComboboxOption) => void;
  /** Bitta tanlovli rejim: tanlangach ro'yxat yopiladi, yopilganda qidiruv matni tozalanadi. */
  single: boolean;
  /** Komponentning tashqi konteyneri: undan tashqariga bosish yoki fokus chiqishi ro'yxatni yopadi. */
  rootRef: RefObject<HTMLElement | null>;
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
  /** Konteynerning `onBlur`i: fokus komponentdan tashqariga chiqsa ro'yxat yopiladi. */
  onRootBlur: (event: FocusEvent<HTMLElement>) => void;
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
  disabled: boolean;
  onSearchChange: ((query: string) => void) | undefined;
  resetActive: () => void;
}

/** Ochiq/yopiq holat va qidiruv matni; bitta rejimda yopilganda matn tozalanadi. */
function useListState({ single, disabled, onSearchChange, resetActive }: ListStateParams) {
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

  const openList = () => {
    setOpen((current) => current || !disabled);
  };

  return { open, setOpen, query, changeQuery, close, openList };
}

function isInside(root: HTMLElement | null, target: EventTarget | null): boolean {
  return root !== null && target instanceof Node && root.contains(target);
}

/**
 * Tashqariga bosish (pointerdown) va fokus chiqishi ro'yxatni yopadi.
 * Ichkarida bosish yopmaydi — `multiple` rejimda ketma-ket tanlash uchun.
 */
function useDismiss(rootRef: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!isInside(rootRef.current, event.target)) {
        closeRef.current();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, rootRef]);

  return (event: FocusEvent<HTMLElement>) => {
    if (open && !isInside(rootRef.current, event.relatedTarget)) {
      close();
    }
  };
}

/** Combobox holati: ochiq/yopiq, qidiruv matni, faol variant va klaviatura (↑ ↓ Enter Esc). */
export function useCombobox({
  options,
  disabled,
  onSearchChange,
  onSelect,
  single,
  rootRef,
}: UseComboboxParams): ComboboxState {
  const [activeIndex, setActiveIndex] = useActiveIndex(options.length);
  const { open, setOpen, query, changeQuery, close, openList } = useListState({
    single,
    disabled,
    onSearchChange,
    resetActive: () => {
      setActiveIndex(NO_ACTIVE);
    },
  });

  const onRootBlur = useDismiss(rootRef, open, close);

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
    onRootBlur,
  };
}
