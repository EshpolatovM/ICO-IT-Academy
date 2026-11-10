/**
 * Bir nechta repository amalini bitta baza tranzaksiyasida bajarish (masalan asosiy amal + audit,
 * docs/01 §4). Service'lar Prisma'ni bilmaydi (dependency-cruiser), shuning uchun shu abstraksiya
 * orqali ishlaydi; amalga oshirish — `infra/prisma` (`PrismaUnitOfWork`, AsyncLocalStorage bilan).
 * `work` ichidagi repository chaqiruvlari (`PrismaService.client`/`transaction` ishlatadiganlari)
 * shu tranzaksiyaga qo'shiladi; xato bo'lsa hammasi bekor qilinadi.
 * `work` ichida tashqi tizimlar (Redis, HTTP) va sekin hisob-kitob (Argon2) bajarilmaydi.
 */
export abstract class UnitOfWork {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
