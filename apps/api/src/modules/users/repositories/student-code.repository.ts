import { Injectable } from '@nestjs/common';

import { formatStudentCode } from '@lms/shared';

import type { Prisma } from '../../../infra/prisma/generated/client.js';

/** `$queryRaw` bajara oladigan klient yoki tranzaksiya. */
export type RawQueryClient = Pick<Prisma.TransactionClient, '$queryRaw'>;

/**
 * Student kodi (`ST-10245`) `student_code_seq` dan — poyga holatisiz (docs/02 §2, docs/11 §1).
 * Student yaratish tranzaksiyasi ichida chaqiriladi, shuning uchun klient parametr sifatida beriladi.
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
}
