/*
 * Kontent chegaralari (docs/tasks/03-3.2 §2.2, §2.5 — docs/11 da aniq berilganlari).
 * TODO(3.2): @lms/shared ga ko'chiriladi (`content.constants.ts`). T-4 dagi qiymatlari hali
 * tasdiqlanmagan chegaralar (tavsif, dars matni, `estMinutes` yuqori chegarasi) frontendda
 * tekshirilmaydi — server 400 qaytarsa, xato maydon ostida ko'rinadi.
 */
export const CONTENT_TITLE_MAX_LENGTH = 128;
export const PATH_SLUG_MAX_LENGTH = 128;
export const CHEST_TITLE_MAX_LENGTH = 64;
export const CONTENT_ICON_MAX_LENGTH = 64;
export const LESSON_VIDEO_URL_MAX_LENGTH = 512;
export const PATH_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
