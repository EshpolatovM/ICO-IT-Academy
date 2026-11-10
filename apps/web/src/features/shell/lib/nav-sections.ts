import type { NavEntry } from '../types/nav.types';

/** Bandning `href` i berilgan bosh yo'l ostidagi bo'lim segmentlari: `/admin/settings/rewards` → `['settings','rewards']`. */
function sectionSegments(entry: NavEntry, basePath: string): string[] | null {
  const prefix = basePath === '/' ? '/' : `${basePath}/`;
  if (entry.href?.startsWith(prefix) !== true) {
    return null;
  }
  return entry.href.slice(prefix.length).split('/');
}

/** Menyudagi "Tez orada" bo'limlari (bosh sahifa va `disabled` bandlardan tashqari). */
export function sectionEntries(nav: readonly NavEntry[], basePath: string, homePath: string) {
  return nav.flatMap((entry) => {
    const segments = entry.href === homePath ? null : sectionSegments(entry, basePath);
    return segments === null ? [] : [{ entry, segments }];
  });
}

/** URL segmentlari bo'yicha menyu bandini topadi. */
export function findSectionEntry(
  nav: readonly NavEntry[],
  basePath: string,
  segments: readonly string[],
): NavEntry | undefined {
  const href = `${basePath === '/' ? '' : basePath}/${segments.join('/')}`;
  return nav.find((entry) => entry.href === href);
}

/** Joriy yo'l menyu bandiga tegishlimi (bosh sahifa — faqat aniq mos kelganda). */
export function isNavEntryActive(entry: NavEntry, pathname: string, homePath: string): boolean {
  if (entry.href === undefined) {
    return false;
  }
  if (entry.href === homePath) {
    return pathname === homePath;
  }
  return pathname === entry.href || pathname.startsWith(`${entry.href}/`);
}
