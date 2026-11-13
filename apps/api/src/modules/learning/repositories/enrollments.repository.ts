import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/** Enrollment holati (`completed_at`), yozuv yo'q — `null`. */
export interface EnrollmentRecord {
  completedAt: Date | null;
}

/**
 * `student_path_enrollments` (3.1 §2.8.1): lazy enrollment idempotentligining yagona kafolati —
 * `uq_student_path_enrollments_student_id_path_id` + `createMany({ skipDuplicates })`
 * (`ON CONFLICT DO NOTHING`). "Avval topib, keyin yaratish" yo'q.
 */
@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, pathId: string): Promise<EnrollmentRecord | null> {
    return this.prisma.client.studentPathEnrollment.findUnique({
      where: { studentId_pathId: { studentId, pathId } },
      select: { completedAt: true },
    });
  }

  async ensure(studentId: string, pathId: string): Promise<void> {
    await this.prisma.client.studentPathEnrollment.createMany({
      data: [{ studentId, pathId }],
      skipDuplicates: true,
    });
  }

  /** Yo'l yakunlandi — faqat bir marta (`completed_at IS NULL`, S-35: qayta o'zgarmaydi). */
  async markCompleted(studentId: string, pathId: string): Promise<void> {
    await this.prisma.client.studentPathEnrollment.updateMany({
      where: { studentId, pathId, completedAt: null },
      data: { completedAt: new Date() },
    });
  }
}
