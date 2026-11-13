/**
 * Baza cheklovi buzilishi — repository Prisma xatosini shu domen xatosiga aylantiradi, servis esa
 * (Prisma'ni bilmasdan) aniq javob shakliga o'giradi. Masalan poyga holatida slug band (unique)
 * yoki progressi paydo bo'lgan kontentni o'chirish (FK `Restrict`).
 * Servis ushlamasa — global filter'da 500 (shuning uchun faqat ushlanadigan joyda ishlatiladi).
 */
export abstract class ConstraintViolationError extends Error {}

export class UniqueViolationError extends ConstraintViolationError {
  override readonly name = 'UniqueViolationError';
}

export class ForeignKeyViolationError extends ConstraintViolationError {
  override readonly name = 'ForeignKeyViolationError';
}
