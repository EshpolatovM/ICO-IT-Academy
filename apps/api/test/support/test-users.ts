import { randomBytes, randomInt } from 'node:crypto';

import type { PrismaClient } from '../../src/infra/prisma/generated/client.js';

/** Test foydalanuvchilarining umumiy paroli (`@lms/shared` parol siyosatiga mos). */
export const TEST_PASSWORD = 'E2eParol123';

const PHONE_PREFIX = '+99877';
const PHONE_SUFFIX_MAX = 10_000_000;
const PHONE_SUFFIX_DIGITS = String(PHONE_SUFFIX_MAX - 1).length;
const CODE_BYTES = 4;

/** Tasodifiy test telefoni (`+99877XXXXXXX`) — dev yozuvlari bilan to'qnashmaydi. */
export function randomTestPhone(): string {
  return `${PHONE_PREFIX}${String(randomInt(PHONE_SUFFIX_MAX)).padStart(PHONE_SUFFIX_DIGITS, '0')}`;
}

/** `E2E-` prefiksli student kodi — `student_code_seq` sarflanmaydi. */
export function randomTestStudentCode(): string {
  return `E2E-${randomBytes(CODE_BYTES).toString('hex').toUpperCase()}`;
}

/**
 * Berilgan yo'llardagi progress va enrollment'lar (3.3 lazy enrollment). `Restrict` FK tartibi:
 * `lesson_progress` → `topic_progress` → `student_path_enrollments` (keyin yo'l/foydalanuvchi).
 */
export async function deletePathProgress(
  db: PrismaClient,
  pathIds: readonly string[],
): Promise<void> {
  const inPaths = { in: [...pathIds] };
  await db.lessonProgress.deleteMany({
    where: { lesson: { topic: { section: { pathId: inPaths } } } },
  });
  await db.topicProgress.deleteMany({ where: { topic: { section: { pathId: inPaths } } } });
  await db.studentPathEnrollment.deleteMany({ where: { pathId: inPaths } });
}

/**
 * Berilgan test foydalanuvchilari va ularga bog'langan yozuvlarni o'chiradi (dars/mavzu progressi,
 * enrollment'lar, guruh a'zoliklari, audit, ota-ona tokenlari va loglari, refresh tokenlar).
 * Boshqa yozuvlarga tegilmaydi.
 */
export async function deleteTestUsers(db: PrismaClient, userIds: readonly string[]): Promise<void> {
  const ids = { in: [...userIds] };
  await db.lessonProgress.deleteMany({ where: { studentId: ids } });
  await db.topicProgress.deleteMany({ where: { studentId: ids } });
  await db.studentPathEnrollment.deleteMany({ where: { studentId: ids } });
  await db.groupMember.deleteMany({ where: { studentId: ids } });
  await db.auditLog.deleteMany({ where: { OR: [{ actorId: ids }, { entityId: ids }] } });
  await db.parentAccessLog.deleteMany({ where: { studentId: ids } });
  const tokens = await db.parentAccessToken.findMany({
    where: { OR: [{ studentId: ids }, { createdById: ids }, { revokedById: ids }] },
    select: { id: true },
  });
  await db.auditLog.deleteMany({ where: { entityId: { in: tokens.map((token) => token.id) } } });
  await db.parentAccessToken.deleteMany({ where: { id: { in: tokens.map((token) => token.id) } } });
  await db.refreshToken.updateMany({ where: { userId: ids }, data: { replacedById: null } });
  await db.refreshToken.deleteMany({ where: { userId: ids } });
  await db.user.deleteMany({ where: { id: ids } });
}

/** Test guruhlari va ularning yo'llari (a'zoliklar, progress bilan) — faqat berilgan id'lar. */
export async function deleteTestGroups(
  db: PrismaClient,
  groupIds: readonly string[],
  pathIds: readonly string[],
): Promise<void> {
  await db.groupMember.deleteMany({ where: { groupId: { in: [...groupIds] } } });
  await db.group.deleteMany({ where: { id: { in: [...groupIds] } } });
  await deletePathProgress(db, pathIds);
  await db.learningPath.deleteMany({ where: { id: { in: [...pathIds] } } });
}
