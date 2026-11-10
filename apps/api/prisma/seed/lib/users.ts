import { Prisma, Role, UserStatus } from '../../../src/infra/prisma/generated/client.js';

import { hashPassword, normalizePhone } from './credentials.js';
import { ScriptError } from './errors.js';

import type { PrismaClient, User } from '../../../src/infra/prisma/generated/client.js';

/** Student kodi prefiksi (docs/02 §2, docs/11 §1). */
const STUDENT_CODE_PREFIX = 'ST-';
/** Prisma unique constraint buzilishi kodi. */
const UNIQUE_VIOLATION = 'P2002';

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

/** Keyingi student kodini `student_code_seq` dan oladi (poyga holatisiz, docs/02 §2). */
async function nextStudentCode(tx: Prisma.TransactionClient): Promise<string> {
  const [row] = await tx.$queryRaw<
    { value: bigint }[]
  >`SELECT nextval('student_code_seq') AS value`;
  if (!row) {
    throw new ScriptError('student_code_seq dan qiymat olinmadi.');
  }
  return `${STUDENT_CODE_PREFIX}${row.value.toString()}`;
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
        studentCode: await nextStudentCode(tx),
        passwordHash,
        mustChangePassword: true,
        firstName: input.firstName,
        lastName: input.lastName,
        status: UserStatus.ACTIVE,
      },
    }),
  );
}
