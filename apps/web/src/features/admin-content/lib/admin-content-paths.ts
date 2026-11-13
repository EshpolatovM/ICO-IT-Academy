/** Admin kontent sahifalari. Route o'zgarsa faqat shu fayl yangilanadi. */
export const ADMIN_PATHS_HOME = '/admin/paths';

export function pathTreePath(pathId: string): string {
  return `${ADMIN_PATHS_HOME}/${encodeURIComponent(pathId)}`;
}

export function lessonEditorPath(lessonId: string): string {
  return `/admin/lessons/${encodeURIComponent(lessonId)}`;
}
