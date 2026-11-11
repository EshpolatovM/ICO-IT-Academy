import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SEARCH_DEBOUNCE_MS, useSearchField } from './useSearchField';

describe('useSearchField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("yozish darhol ko'rinadi, onSearch esa debounce'dan keyin bir marta", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearchField('', onSearch));

    act(() => {
      result.current.setValue('a');
    });
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS / 2);
      result.current.setValue('ali');
    });
    expect(result.current.value).toBe('ali');
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('ali');
  });

  it("q tashqaridan o'zgarsa (orqaga qaytish) — maydon yangilanadi, onSearch chaqirilmaydi", () => {
    const onSearch = vi.fn();
    const { result, rerender } = renderHook(({ q }) => useSearchField(q, onSearch), {
      initialProps: { q: 'ali' },
    });

    rerender({ q: 'vali' });
    expect(result.current.value).toBe('vali');
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    });
    expect(onSearch).not.toHaveBeenCalled();
  });
});
