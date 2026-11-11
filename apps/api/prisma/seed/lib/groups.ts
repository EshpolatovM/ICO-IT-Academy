import { ContentStatus, GroupStatus } from '../../../src/infra/prisma/generated/client.js';

import type {
  Group,
  LearningPath,
  PrismaClient,
  User,
} from '../../../src/infra/prisma/generated/client.js';

export interface EnsureLearningPathInput {
  slug: string;
  title: string;
}

export interface EnsureGroupInput {
  name: string;
  path: LearningPath;
  mentor: User;
}

/** Natija: yozuv va u shu chaqiruvda yaratilganmi (idempotent seed loglari uchun). */
export interface EnsureResult<T> {
  record: T;
  created: boolean;
}

/** `PUBLISHED` yo'l: slug bo'yicha topadi, yo'q bo'lsa yaratadi. Mavjud yo'l o'zgartirilmaydi. */
export async function ensureLearningPath(
  prisma: PrismaClient,
  input: EnsureLearningPathInput,
): Promise<EnsureResult<LearningPath>> {
  const existing = await prisma.learningPath.findUnique({ where: { slug: input.slug } });
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await prisma.learningPath.create({
    data: { slug: input.slug, title: input.title, status: ContentStatus.PUBLISHED },
  });
  return { record, created: true };
}

/**
 * Faol guruh: nomi va yo'li bo'yicha (o'chirilmaganlar ichidan) topadi, yo'q bo'lsa mentor
 * biriktirilgan holda yaratadi. Mavjud guruh o'zgartirilmaydi.
 */
export async function ensureGroup(
  prisma: PrismaClient,
  input: EnsureGroupInput,
): Promise<EnsureResult<Group>> {
  const existing = await prisma.group.findFirst({
    where: { name: input.name, pathId: input.path.id, deletedAt: null },
  });
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await prisma.group.create({
    data: {
      name: input.name,
      pathId: input.path.id,
      mentorId: input.mentor.id,
      status: GroupStatus.ACTIVE,
    },
  });
  return { record, created: true };
}

/**
 * Studentni guruhga faol a'zo qiladi. Studentning faol a'zoligi (istalgan guruhda) bo'lsa —
 * hech narsa qilinmaydi: bitta faol guruh qoidasi (S-02, `uq_group_members_active_student`).
 * @returns yangi a'zolik yaratildimi
 */
export async function ensureActiveMembership(
  prisma: PrismaClient,
  group: Group,
  student: User,
): Promise<boolean> {
  const active = await prisma.groupMember.findFirst({
    where: { studentId: student.id, leftAt: null },
  });
  if (active) {
    return false;
  }
  await prisma.groupMember.create({ data: { groupId: group.id, studentId: student.id } });
  return true;
}
