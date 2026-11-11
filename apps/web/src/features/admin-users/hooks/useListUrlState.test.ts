import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { navigation, resetNavigation } from '@/lib/testing/navigation';

import { useListUrlState } from './useListUrlState';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

const PATH = '/admin/students';

describe('useListUrlState', () => {
  beforeEach(() => {
    resetNavigation(PATH, 'page=3&q=ali&status=ACTIVE');
  });

  it("holatni URL query'dan o'qiydi", () => {
    const { result } = renderHook(() => useListUrlState());
    expect(result.current.state).toMatchObject({ page: 3, q: 'ali', status: 'ACTIVE' });
  });

  it('sahifa almashganda filtrlar saqlanadi', () => {
    const { result } = renderHook(() => useListUrlState());
    act(() => {
      result.current.setPage(4);
    });
    expect(navigation.replace).toHaveBeenCalledWith(`${PATH}?page=4&q=ali&status=ACTIVE`, {
      scroll: false,
    });
  });

  it("filtr/saralash o'zgarsa — 1-sahifaga qaytadi", () => {
    const { result } = renderHook(() => useListUrlState());
    act(() => {
      result.current.setSort('lastName');
    });
    expect(navigation.replace).toHaveBeenLastCalledWith(
      `${PATH}?q=ali&status=ACTIVE&sort=lastName`,
      {
        scroll: false,
      },
    );
    act(() => {
      result.current.setStatus(undefined);
    });
    expect(navigation.replace).toHaveBeenLastCalledWith(`${PATH}?q=ali`, { scroll: false });
  });

  it("hammasi standart bo'lsa — query'siz yo'l", () => {
    resetNavigation(PATH, 'q=ali');
    const { result } = renderHook(() => useListUrlState());
    act(() => {
      result.current.setQuery('');
    });
    expect(navigation.replace).toHaveBeenCalledWith(PATH, { scroll: false });
  });
});
