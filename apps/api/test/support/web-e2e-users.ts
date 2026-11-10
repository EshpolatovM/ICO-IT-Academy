/**
 * Web (Playwright) e2e uchun test foydalanuvchilari — API orqali emas, to'g'ridan-to'g'ri bazaga
 * (seed kutubxonasi bilan). Dev seed foydalanuvchilariga tegilmaydi.
 *
 *   tsx test/support/web-e2e-users.ts create        → stdout: WebE2eUsers JSON
 *   tsx test/support/web-e2e-users.ts delete <id>…  → faqat shu id'lar va bog'liq yozuvlar o'chiriladi
 */
import { ScriptError } from '../../prisma/seed/lib/errors.js';
import { runScript } from '../../prisma/seed/lib/run-script.js';
import { createStaffUser } from '../../prisma/seed/lib/users.js';
import { Argon2PasswordHasher } from '../../src/common/security/argon2-password-hasher.js';
import { Role, UserStatus } from '../../src/infra/prisma/generated/client.js';

import {
  deleteTestUsers,
  randomTestPhone,
  randomTestStudentCode,
  TEST_PASSWORD,
} from './test-users.js';

import type { PrismaClient } from '../../src/infra/prisma/generated/client.js';

/** `process.argv` dagi birinchi foydalanuvchi argumenti indeksi. */
const SCRIPT_ARGS_START = 2;
const USAGE = 'Foydalanish: web-e2e-users create | delete <id...>';

interface E2eUser {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
}

type StaffRole = typeof Role.SUPER_ADMIN | typeof Role.ADMIN | typeof Role.MENTOR;

async function createStaff(prisma: PrismaClient, role: StaffRole): Promise<E2eUser> {
  const user = await createStaffUser(prisma, {
    role,
    phone: randomTestPhone(),
    password: TEST_PASSWORD,
    firstName: 'E2E',
    lastName: role,
  });
  return {
    id: user.id,
    login: user.phone ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

async function createStudent(
  prisma: PrismaClient,
  lastName: string,
  mustChangePassword: boolean,
): Promise<E2eUser> {
  const user = await prisma.user.create({
    data: {
      role: Role.STUDENT,
      studentCode: randomTestStudentCode(),
      passwordHash: await new Argon2PasswordHasher().hash(TEST_PASSWORD),
      mustChangePassword,
      firstName: 'E2E',
      lastName,
      status: UserStatus.ACTIVE,
    },
  });
  return { id: user.id, login: user.studentCode ?? '', firstName: user.firstName, lastName };
}

async function createAll(prisma: PrismaClient): Promise<void> {
  const users = {
    password: TEST_PASSWORD,
    superAdmin: await createStaff(prisma, Role.SUPER_ADMIN),
    admin: await createStaff(prisma, Role.ADMIN),
    mentor: await createStaff(prisma, Role.MENTOR),
    newStudent: await createStudent(prisma, 'Yangi', true),
    child: await createStudent(prisma, 'Farzand', false),
  };
  process.stdout.write(JSON.stringify(users));
}

async function main(prisma: PrismaClient): Promise<void> {
  const [command, ...ids] = process.argv.slice(SCRIPT_ARGS_START);
  if (command === 'create') {
    await createAll(prisma);
    return;
  }
  if (command === 'delete' && ids.length > 0) {
    await deleteTestUsers(prisma, ids);
    return;
  }
  throw new ScriptError(USAGE);
}

void runScript(main);
