/**
 * Dev seed (faqat NODE_ENV !== 'production'): 1 mentor, 1 student, 1 yo'l (`PUBLISHED`) va
 * 1 guruh (seed mentor biriktirilgan, seed student faol a'zo).
 * Qiymatlar `.env` dagi `SEED_*` o'zgaruvchilaridan olinadi (.env.example). Idempotent:
 * mentor telefon bo'yicha, student ism-familiya bo'yicha, yo'l slug bo'yicha, guruh nomi va yo'li
 * bo'yicha tekshiriladi — mavjud bo'lsa qayta yaratilmaydi. Boshqa yozuvlarga tegilmaydi.
 *
 * `system_settings` uchun boshlang'ich kalitlar docs'da yo'q — hozircha seed qilinmaydi.
 */
import { Role } from '../../src/infra/prisma/generated/client.js';

import { assertNotProduction, requireEnv } from './lib/env.js';
import { ensureActiveMembership, ensureGroup, ensureLearningPath } from './lib/groups.js';
import { runScript } from './lib/run-script.js';
import { createStaffUser, createStudentUser, findUserByPhone } from './lib/users.js';

import type { PrismaClient, User } from '../../src/infra/prisma/generated/client.js';

async function seedMentor(prisma: PrismaClient): Promise<User> {
  const phone = requireEnv('SEED_MENTOR_PHONE');
  const existing = await findUserByPhone(prisma, phone);
  if (existing) {
    console.log(`Mentor allaqachon mavjud: ${existing.phone ?? ''} — o'tkazib yuborildi.`);
    return existing;
  }
  const mentor = await createStaffUser(prisma, {
    role: Role.MENTOR,
    phone,
    password: requireEnv('SEED_MENTOR_PASSWORD'),
    firstName: requireEnv('SEED_MENTOR_FIRST_NAME'),
    lastName: requireEnv('SEED_MENTOR_LAST_NAME'),
  });
  console.log(`Mentor yaratildi: ${mentor.phone ?? ''}.`);
  return mentor;
}

async function seedStudent(prisma: PrismaClient): Promise<User> {
  const firstName = requireEnv('SEED_STUDENT_FIRST_NAME');
  const lastName = requireEnv('SEED_STUDENT_LAST_NAME');
  const existing = await prisma.user.findFirst({
    where: { role: Role.STUDENT, firstName, lastName },
  });
  if (existing) {
    console.log(`Student allaqachon mavjud: ${existing.studentCode ?? ''} — o'tkazib yuborildi.`);
    return existing;
  }
  const student = await createStudentUser(prisma, {
    firstName,
    lastName,
    password: requireEnv('SEED_STUDENT_PASSWORD'),
  });
  console.log(
    `Student yaratildi: ${student.studentCode ?? ''} (birinchi kirishda parol almashtiriladi).`,
  );
  return student;
}

/** Yo'l, guruh (mentor biriktirilgan) va studentning faol a'zoligi. */
async function seedGroup(prisma: PrismaClient, mentor: User, student: User): Promise<void> {
  const path = await ensureLearningPath(prisma, {
    slug: requireEnv('SEED_PATH_SLUG'),
    title: requireEnv('SEED_PATH_TITLE'),
  });
  console.log(`Yo'l "${path.record.slug}": ${path.created ? 'yaratildi' : 'allaqachon mavjud'}.`);
  const group = await ensureGroup(prisma, {
    name: requireEnv('SEED_GROUP_NAME'),
    path: path.record,
    mentor,
  });
  console.log(
    `Guruh "${group.record.name}": ${group.created ? 'yaratildi' : 'allaqachon mavjud'}.`,
  );
  const joined = await ensureActiveMembership(prisma, group.record, student);
  console.log(
    joined
      ? `Student ${student.studentCode ?? ''} guruhga qo'shildi.`
      : `Student ${student.studentCode ?? ''} allaqachon faol guruhda — o'tkazib yuborildi.`,
  );
}

async function seedDevData(prisma: PrismaClient): Promise<void> {
  const mentor = await seedMentor(prisma);
  const student = await seedStudent(prisma);
  await seedGroup(prisma, mentor, student);
}

void runScript(seedDevData, () => {
  assertNotProduction('Dev seed');
});
