/**
 * Kontent versiyasi hisoblagichi (docs/13 §6, 3.2 §5): `content:path:{pathId}:ver`, TTL yo'q.
 * Har bir kontent mutatsiyasi commit'dan keyin tegishli yo'l versiyasini `INCR` qiladi; 3.3 kesh
 * kalitlari (`content:path:{id}:v{version}`) shu qiymatdan foydalanadi.
 */
export const CONTENT_VERSION_KEY_PREFIX = 'content:path:';
export const CONTENT_VERSION_KEY_SUFFIX = ':ver';

/**
 * Commit'dan keyingi bump (B1 siyosati): xato javobni yiqitmaydi — qisqa chiziqli backoff bilan
 * qayta urinadi, oxirida `error` log. Eng katta eskirish — 3.3 kesh TTL'i.
 */
export const CONTENT_VERSION_BUMP_ATTEMPTS = 3;
export const CONTENT_VERSION_BUMP_BACKOFF_MS = 50;

/** Validatsiya xatolaridagi so'rov maydonlari nomlari (`details[].field`). */
export const ContentField = {
  SLUG: 'slug',
  NAME: 'name',
  AFTER_TOPIC_ID: 'afterTopicId',
  SECTION_IDS: 'sectionIds',
  TOPIC_IDS: 'topicIds',
  LESSON_IDS: 'lessonIds',
  SKILL_IDS: 'skillIds',
} as const;

/** Audit snapshot'iga qiymati yozilmaydigan maydon (hajm) — faqat nomi `changedFields` da. */
export const AUDIT_VALUE_OMITTED_FIELDS: readonly string[] = ['contentMd'];
