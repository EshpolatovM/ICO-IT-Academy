/**
 * Ilm yo'li kontenti chegaralari (docs/11 §3, 3.2 §2.5). docs'da bo'lmagan qiymatlar (T-4) —
 * `PATH_DESCRIPTION_MAX_LENGTH`, `LESSON_CONTENT_MAX_LENGTH`, `LESSON_EST_MINUTES_MAX`,
 * `CONTENT_REORDER_MAX`, `TOPIC_SKILLS_MAX` — 3.2 taklifi (Tech Lead tasdiqlaydi).
 */

/** `learning_paths.title`, `learning_paths.slug` (varchar(128)). */
export const PATH_TITLE_MAX_LENGTH = 128;
export const PATH_SLUG_MAX_LENGTH = 128;
/** `path_sections.title`, `topics.title`, `lessons.title` (varchar(128)). */
export const SECTION_TITLE_MAX_LENGTH = 128;
export const TOPIC_TITLE_MAX_LENGTH = 128;
export const LESSON_TITLE_MAX_LENGTH = 128;
/** `topics.icon`, `skills.icon` (varchar(64)). */
export const CONTENT_ICON_MAX_LENGTH = 64;
/** `path_chests.title` (varchar(64)). */
export const CHEST_TITLE_MAX_LENGTH = 64;
/** `skills.name` (varchar(64)). */
export const SKILL_NAME_MAX_LENGTH = 64;
/** `lessons.video_url` (varchar(512)). */
export const LESSON_VIDEO_URL_MAX_LENGTH = 512;
/** Dars videosi havolasida ruxsat etilgan sxemalar (R Q-10: faqat `https:`). */
export const LESSON_VIDEO_URL_PROTOCOLS: readonly string[] = ['https:'];

/** T-4: yo'l, bo'lim va mavzu tavsifi (`text`) chegarasi. */
export const PATH_DESCRIPTION_MAX_LENGTH = 1000;
/**
 * T-4: dars Markdown matni. API JSON body chegarasi (Nest standarti 100 KB) ichida qolishi uchun:
 * UTF-8 da eng ko'pi 3 bayt/belgi → ~90 KB.
 */
export const LESSON_CONTENT_MAX_LENGTH = 30_000;
/** T-4: dars davomiyligi, daqiqa (`smallint` chegarasi ichida). */
export const LESSON_EST_MINUTES_MAX = 600;
/** T-4: bitta `PUT …/order` so'rovidagi id'lar soni. */
export const CONTENT_REORDER_MAX = 200;
/** T-4: bitta mavzuga biriktiriladigan ko'nikmalar soni. */
export const TOPIC_SKILLS_MAX = 20;
/** Ko'nikmalar ro'yxatidagi qidiruv satri (`?q=`). */
export const SKILL_SEARCH_MAX_LENGTH = 64;

/** Slug: kichik lotin harflari va raqamlar, so'zlar orasida bitta `-` (kebab-case). */
export const PATH_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
