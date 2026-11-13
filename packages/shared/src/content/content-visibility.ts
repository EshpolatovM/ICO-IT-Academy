import { ContentStatus } from '../enums/content-status.js';

/**
 * Kontent studentga ko'rinadimi (TL Q-1, M-1): zanjirdagi barcha bo'g'inlar (yo'l, bo'lim, mavzu,
 * dars) `PUBLISHED`. Bo'sh zanjir — ko'rinmaydi. 3.3 SQL filtri xuddi shu qoidani qo'llaydi.
 */
export function isContentVisible(statuses: readonly ContentStatus[]): boolean {
  return statuses.length > 0 && statuses.every((status) => status === ContentStatus.PUBLISHED);
}
