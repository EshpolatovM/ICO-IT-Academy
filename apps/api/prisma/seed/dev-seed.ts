/**
 * Dev seed (faqat NODE_ENV !== 'production'): 1 mentor, 1 student, 1 yo'l (`PUBLISHED`),
 * 1 guruh (seed mentor biriktirilgan, seed student faol a'zo) va yo'l kontenti
 * (`data/dev-path-content.ts`: bo'limlar, mavzular, darslar, sandiq, ko'nikmalar).
 * Qiymatlar `.env` dagi `SEED_*` o'zgaruvchilaridan olinadi (.env.example). Idempotent:
 * mentor telefon bo'yicha, student ism-familiya bo'yicha, yo'l slug bo'yicha, guruh nomi va yo'li
 * bo'yicha tekshiriladi — mavjud bo'lsa qayta yaratilmaydi. Ko'nikmalar nomi bo'yicha; yo'l
 * kontenti yo'lda bo'lim bo'lmasagina yaratiladi. Boshqa yozuvlarga tegilmaydi.
 * Enrollment va progress seed qilinmaydi: student xaritani birinchi ochganda lazy yaratiladi (TL Q-5).
 *
 * `system_settings` uchun boshlang'ich kalitlar docs'da yo'q — hozircha seed qilinmaydi.
 */
import { Role } from '../../src/infra/prisma/generated/client.js';

import { DEV_PATH_SECTIONS, DEV_SKILLS } from './data/dev-path-content.js';
import { assertNotProduction, requireEnv } from './lib/env.js';
import { ensureActiveMembership, ensureGroup, ensureLearningPath } from './lib/groups.js';
import { ensurePathContent, ensureSkills } from './lib/path-content.js';
import { runScript } from './lib/run-script.js';
import { createStaffUser, createStudentUser, findUserByPhone } from './lib/users.js';

import type { LearningPath, PrismaClient, User } from '../../src/infra/prisma/generated/client.js';

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

async function seedPath(prisma: PrismaClient): Promise<LearningPath> {
  const path = await ensureLearningPath(prisma, {
    slug: requireEnv('SEED_PATH_SLUG'),
    title: requireEnv('SEED_PATH_TITLE'),
  });
  console.log(`Yo'l "${path.record.slug}": ${path.created ? 'yaratildi' : 'allaqachon mavjud'}.`);
  return path.record;
}

/** Ko'nikmalar va yo'l kontenti (bo'limlar, mavzular, darslar, sandiq, `topic_skills`). */
async function seedPathContent(prisma: PrismaClient, path: LearningPath): Promise<void> {
  const skills = await ensureSkills(prisma, DEV_SKILLS);
  for (const skill of skills) {
    console.log(
      `Ko'nikma "${skill.record.name}": ${skill.created ? 'yaratildi' : 'allaqachon mavjud'}.`,
    );
  }
  const skillsByName = new Map(skills.map(({ record }) => [record.name, record]));
  const created = await ensurePathContent(prisma, path, DEV_PATH_SECTIONS, skillsByName);
  console.log(
    created
      ? `Yo'l "${path.slug}" kontenti yaratildi.`
      : `Yo'l "${path.slug}" da bo'limlar allaqachon bor — kontent o'tkazib yuborildi.`,
  );
}

/** Guruh (mentor biriktirilgan) va studentning faol a'zoligi. */
async function seedGroup(
  prisma: PrismaClient,
  path: LearningPath,
  mentor: User,
  student: User,
): Promise<void> {
  const group = await ensureGroup(prisma, {
    name: requireEnv('SEED_GROUP_NAME'),
    path,
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
  const path = await seedPath(prisma);
  await seedGroup(prisma, path, mentor, student);
  await seedPathContent(prisma, path);
}

void runScript(seedDevData, () => {
  assertNotProduction('Dev seed');
});
