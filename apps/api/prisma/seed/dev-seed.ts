/**
 * Dev seed (faqat NODE_ENV !== 'production'): 1 mentor va 1 student.
 * Qiymatlar `.env` dagi `SEED_*` o'zgaruvchilaridan olinadi (.env.example). Idempotent:
 * mentor telefon bo'yicha, student ism-familiya bo'yicha tekshiriladi — mavjud bo'lsa qayta yaratilmaydi.
 *
 * `system_settings` uchun boshlang'ich kalitlar docs'da yo'q — hozircha seed qilinmaydi.
 */
import { Role } from '../../src/infra/prisma/generated/client.js';

import { assertNotProduction, requireEnv } from './lib/env.js';
import { runScript } from './lib/run-script.js';
import { createStaffUser, createStudentUser, findUserByPhone } from './lib/users.js';

import type { PrismaClient } from '../../src/infra/prisma/generated/client.js';

async function seedMentor(prisma: PrismaClient): Promise<void> {
  const phone = requireEnv('SEED_MENTOR_PHONE');
  const existing = await findUserByPhone(prisma, phone);
  if (existing) {
    console.log(`Mentor allaqachon mavjud: ${existing.phone ?? ''} — o'tkazib yuborildi.`);
    return;
  }
  const mentor = await createStaffUser(prisma, {
    role: Role.MENTOR,
    phone,
    password: requireEnv('SEED_MENTOR_PASSWORD'),
    firstName: requireEnv('SEED_MENTOR_FIRST_NAME'),
    lastName: requireEnv('SEED_MENTOR_LAST_NAME'),
  });
  console.log(`Mentor yaratildi: ${mentor.phone ?? ''}.`);
}

async function seedStudent(prisma: PrismaClient): Promise<void> {
  const firstName = requireEnv('SEED_STUDENT_FIRST_NAME');
  const lastName = requireEnv('SEED_STUDENT_LAST_NAME');
  const existing = await prisma.user.findFirst({
    where: { role: Role.STUDENT, firstName, lastName },
  });
  if (existing) {
    console.log(`Student allaqachon mavjud: ${existing.studentCode ?? ''} — o'tkazib yuborildi.`);
    return;
  }
  const student = await createStudentUser(prisma, {
    firstName,
    lastName,
    password: requireEnv('SEED_STUDENT_PASSWORD'),
  });
  console.log(
    `Student yaratildi: ${student.studentCode ?? ''} (birinchi kirishda parol almashtiriladi).`,
  );
}

async function seedDevData(prisma: PrismaClient): Promise<void> {
  await seedMentor(prisma);
  await seedStudent(prisma);
}

void runScript(seedDevData, () => {
  assertNotProduction('Dev seed');
});
