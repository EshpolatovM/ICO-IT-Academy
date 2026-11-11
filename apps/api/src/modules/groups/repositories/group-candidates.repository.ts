import { Injectable } from '@nestjs/common';

import { Role, UserStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/**
 * Guruhga biriktiriladigan foydalanuvchilarni tekshirish (`users` jadvali, faqat o'qish): mentor
 * (faol MENTOR) va qo'shiladigan studentlar. O'chirilganlar soft delete extension orqali
 * yashiriladi. Joriy tranzaksiyada (`PrismaService.client`) — tekshiruv va yozuv bitta `UnitOfWork`.
 * `BaseRepository` dan meros olmaydi: `users` CRUD'i bu modulga tegishli emas.
 */
@Injectable()
export class GroupCandidatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isActiveMentor(id: string): Promise<boolean> {
    const found = await this.prisma.client.user.findFirst({
      where: { id, role: Role.MENTOR, status: UserStatus.ACTIVE },
      select: { id: true },
    });
    return found !== null;
  }

  /** Berilgan id'lardan mavjud studentlar (istalgan holatda). */
  async findStudentIds(ids: readonly string[]): Promise<string[]> {
    const rows = await this.prisma.client.user.findMany({
      where: { id: { in: [...ids] }, role: Role.STUDENT },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }
}
