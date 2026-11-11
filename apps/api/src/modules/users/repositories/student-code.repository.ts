import { Injectable } from '@nestjs/common';

import { formatStudentCode } from '@lms/shared';

import type { Prisma } from '../../../infra/prisma/generated/client.js';

/** `$queryRaw` bajara oladigan klient yoki tranzaksiya. */
export type RawQueryClient = Pick<Prisma.TransactionClient, '$queryRaw'>;

/**
 * Student kodi (`ST-10245`) `student_code_seq` dan — poyga holatisiz (docs/02 §2, docs/11 §1).
 * Student yaratish tranzaksiyasi ichida chaqiriladi, shuning uchun klient parametr sifatida beriladi.
 * `BaseRepository` dan meros olmaydi: model emas, PostgreSQL sequence bilan ishlaydi (CRUD ma'nosiz).
 */
@Injectable()
export class StudentCodeRepository {
  async next(client: RawQueryClient): Promise<string> {
    const [row] = await client.$queryRaw<
      { value: bigint }[]
    >`SELECT nextval('student_code_seq') AS value`;
    if (!row) {
      throw new Error('student_code_seq dan qiymat olinmadi.');
    }
    return formatStudentCode(row.value);
  }

  /**
   * Bir nechta kod bitta so'rovda (CSV import): qiymatlar o'sish tartibida qaytadi.
   * Tranzaksiya bekor bo'lsa sequence qiymatlari qaytmaydi (raqamlarda bo'shliq — normal holat).
   */
  async nextMany(client: RawQueryClient, count: number): Promise<string[]> {
    if (count <= 0) {
      return [];
    }
    const rows = await client.$queryRaw<{ value: bigint }[]>`
      SELECT nextval('student_code_seq') AS value FROM generate_series(1, ${count}::int)`;
    if (rows.length !== count) {
      throw new Error('student_code_seq dan yetarli qiymat olinmadi.');
    }
    return rows
      .map((row) => row.value)
      .sort((left, right) => (left < right ? -1 : 1))
      .map((value) => formatStudentCode(value));
  }
}
