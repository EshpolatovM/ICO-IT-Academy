import { z } from 'zod';

const positiveInt = z.coerce.number().int().positive();

/**
 * Studentlarni CSV orqali import qilish chegaralari (S-21, docs/12 §2). Raqamlar kodga yozilmaydi.
 * Fayl hajmi multer darajasida (xotiraga to'liq o'qilishidan oldin) cheklanadi.
 */
export const userImportEnvShape = {
  /** Yuklanadigan CSV faylining eng katta hajmi (bayt). Oshsa — 413 `PAYLOAD_TOO_LARGE`. */
  STUDENT_IMPORT_MAX_FILE_BYTES: positiveInt,
  /** Bitta importdagi ma'lumot qatorlari (sarlavhasiz) soni chegarasi. Oshsa — 400 `VALIDATION_ERROR`. */
  STUDENT_IMPORT_MAX_ROWS: positiveInt,
};
