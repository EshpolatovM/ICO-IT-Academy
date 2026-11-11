import { passwordSchema, phoneSchema } from '@lms/shared';

import { Argon2PasswordHasher } from '../../../src/common/security/argon2-password-hasher.js';
import { Prisma, Role, UserStatus } from '../../../src/infra/prisma/generated/client.js';
import { StudentCodeRepository } from '../../../src/modules/users/repositories/student-code.repository.js';

import { ScriptError } from './errors.js';
import { parseOrFail } from './validate.js';

import type { PrismaClient, User } from '../../../src/infra/prisma/generated/client.js';

/** Prisma unique constraint buzilishi kodi. */
const UNIQUE_VIOLATION = 'P2002';

const passwordHasher = new Argon2PasswordHasher();
const studentCodes = new StudentCodeRepository();

type StaffRole = typeof Role.SUPER_ADMIN | typeof Role.ADMIN | typeof Role.MENTOR;

interface PersonName {
  firstName: string;
  lastName: string;
}

export interface CreateStaffInput extends PersonName {
  role: StaffRole;
  phone: string;
  password: string;
}

export interface CreateStudentInput extends PersonName {
  password: string;
}

/** Telefonni normalizatsiya qiladi va E.164 ni tekshiradi (`@lms/shared` `phoneSchema`). */
export function normalizePhone(rawPhone: string): string {
  return parseOrFail(phoneSchema, rawPhone, `Telefon "${rawPhone}"`);
}

/** Parol siyosatini tekshiradi (`@lms/shared` `passwordSchema`, docs/02 §6). */
export function assertPasswordPolicy(password: string): void {
  parseOrFail(passwordSchema, password, 'Parol');
}

async function hashPassword(password: string): Promise<string> {
  assertPasswordPolicy(password);
  return passwordHasher.hash(password);
}

export function findUserByPhone(prisma: PrismaClient, rawPhone: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { phone: normalizePhone(rawPhone) } });
}

/** Xodim (super admin, admin, mentor) yaratadi. Telefon band bo'lsa — tushunarli xato. */
export async function createStaffUser(
  prisma: PrismaClient,
  input: CreateStaffInput,
): Promise<User> {
  const phone = normalizePhone(input.phone);
  const passwordHash = await hashPassword(input.password);
  try {
    return await prisma.user.create({
      data: {
        role: input.role,
        phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        status: UserStatus.ACTIVE,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION) {
      throw new ScriptError(`${phone} telefon raqami bilan foydalanuvchi allaqachon mavjud.`);
    }
    throw error;
  }
}

/** Student yaratadi: kod sequence'dan, birinchi kirishda parolni almashtirish majburiy (docs/02 §2). */
export async function createStudentUser(
  prisma: PrismaClient,
  input: CreateStudentInput,
): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) =>
    tx.user.create({
      data: {
        role: Role.STUDENT,
        studentCode: await studentCodes.next(tx),
        passwordHash,
        mustChangePassword: true,
        firstName: input.firstName,
        lastName: input.lastName,
        status: UserStatus.ACTIVE,
      },
    }),
  );
}
