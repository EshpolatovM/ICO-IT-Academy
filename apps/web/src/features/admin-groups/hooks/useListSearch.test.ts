import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SEARCH_DELAY_MS } from './useDebouncedValue';
import { useListSearch } from './useListSearch';

describe('useListSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('kiritish darhol, commit — debounce bilan', () => {
    const onCommit = vi.fn<(q: string) => void>();
    const { result } = renderHook(() => useListSearch('', onCommit));

    act(() => {
      result.current.setText('fe');
    });
    expect(result.current.text).toBe('fe');
    expect(onCommit).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(SEARCH_DELAY_MS);
    });
    expect(onCommit).toHaveBeenCalledWith('fe');
  });

  it("q tashqaridan o'zgarsa — maydon yangilanadi, commit qilinmaydi", () => {
    const onCommit = vi.fn<(q: string) => void>();
    const { result, rerender } = renderHook(({ q }) => useListSearch(q, onCommit), {
      initialProps: { q: 'fe' },
    });

    rerender({ q: 'be' });
    expect(result.current.text).toBe('be');
    act(() => {
      vi.advanceTimersByTime(SEARCH_DELAY_MS);
    });
    expect(onCommit).not.toHaveBeenCalled();
  });
});
