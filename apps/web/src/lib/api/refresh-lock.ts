/** Tablararo refresh qulfining nomi (Web Locks API, bir origin ichida umumiy). */
export const REFRESH_LOCK_NAME = 'lms-auth-refresh';

function lockManager(): LockManager | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  return (navigator as Partial<Pick<Navigator, 'locks'>>).locks;
}

/**
 * `task` ni tablararo eksklyuziv qulf ichida bajaradi (H2): bir nechta tab bir vaqtda refresh
 * qilsa, ular navbat bilan ishlaydi — keyingisi oldingisi yozgan yangi `rt` cookie bilan uradi.
 * Web Locks mavjud bo'lmasa (eski brauzer, SSR) — qulfsiz (tab ichidagi single-flight qoladi).
 */
export async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = lockManager();
  if (locks === undefined) {
    return task();
  }
  return await locks.request(REFRESH_LOCK_NAME, task);
}
