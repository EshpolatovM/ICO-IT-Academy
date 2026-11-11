import { vi } from 'vitest';

/**
 * `next/navigation` mock'i holati. Testda:
 * `vi.mock('next/navigation', async () => (await import('@/lib/testing/navigation')).nextNavigationModule)`.
 */
export const navigation = {
  replace: vi.fn<(href: string, options?: { scroll?: boolean }) => void>(),
  push: vi.fn<(href: string) => void>(),
  pathname: '/',
  search: new URLSearchParams(),
};

export const nextNavigationModule = {
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.search,
};

/** Har test oldidan: yo'l, query va mock chaqiruvlarini tiklaydi. */
export function resetNavigation(pathname: string, search = ''): void {
  navigation.replace.mockReset();
  navigation.push.mockReset();
  navigation.pathname = pathname;
  navigation.search = new URLSearchParams(search);
}
