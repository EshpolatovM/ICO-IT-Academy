/**
 * Yozuv paytida kutilgan holat parallel tranzaksiya tufayli o'zgargan (masalan qayta tartiblashda
 * yangilangan qatorlar soni mos kelmadi). Repository tashlaydi, servis 409 `CONFLICT` ga o'giradi.
 * Servis ushlamasa — global filter'da 500.
 */
export class ConcurrentModificationError extends Error {
  override readonly name = 'ConcurrentModificationError';
}
