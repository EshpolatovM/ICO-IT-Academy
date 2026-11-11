/**
 * Super admin yaratish CLI (docs/02 §4.3, S-13; docs/14 §1 "seed: super admin (CLI)").
 *
 *   pnpm --filter @lms/api create-super-admin -- --phone +998901234567 --first-name Ali --last-name Valiyev
 *
 * Parol `SUPER_ADMIN_PASSWORD` env'dan olinadi, bo'lmasa terminalda (ko'rinmas holda) ikki marta so'raladi.
 * Kodda hech qanday telefon yoki parol yo'q.
 */
import { parseArgs } from 'node:util';

import { Role } from '../../src/infra/prisma/generated/client.js';

import { ScriptError } from './lib/errors.js';
import { promptHidden } from './lib/prompt.js';
import { runScript } from './lib/run-script.js';
import { assertPasswordPolicy, createStaffUser } from './lib/users.js';

import type { PrismaClient } from '../../src/infra/prisma/generated/client.js';

const PASSWORD_ENV = 'SUPER_ADMIN_PASSWORD';
/** `process.argv` dagi birinchi foydalanuvchi argumenti indeksi (`node`, skript yo'lidan keyin). */
const SCRIPT_ARGS_START = 2;
const USAGE =
  'Foydalanish: create-super-admin --phone <+998XXXXXXXXX> --first-name <ism> --last-name <familiya>';

interface SuperAdminArgs {
  phone: string;
  firstName: string;
  lastName: string;
}

/** `pnpm <script> -- --phone ...` argumentlar oldiga `--` qo'shadi — u olib tashlanadi. */
function cliArgs(): string[] {
  const args = process.argv.slice(SCRIPT_ARGS_START);
  return args[0] === '--' ? args.slice(1) : args;
}

const CLI_OPTIONS = {
  phone: { type: 'string' },
  'first-name': { type: 'string' },
  'last-name': { type: 'string' },
} as const;

/** Argumentlarni o'qiydi; noma'lum yoki noto'g'ri argument bo'lsa — foydalanish yo'riqnomasi. */
function readCliOptions(): Partial<SuperAdminArgs> {
  try {
    const { values } = parseArgs({ args: cliArgs(), options: CLI_OPTIONS });
    return {
      phone: values.phone?.trim(),
      firstName: values['first-name']?.trim(),
      lastName: values['last-name']?.trim(),
    };
  } catch (_error) {
    throw new ScriptError(USAGE);
  }
}

function parseCliArgs(): SuperAdminArgs {
  const { phone, firstName, lastName } = readCliOptions();
  if (!phone || !firstName || !lastName) {
    throw new ScriptError(USAGE);
  }
  return { phone, firstName, lastName };
}

async function readPassword(): Promise<string> {
  const fromEnv = process.env[PASSWORD_ENV];
  if (fromEnv) {
    return fromEnv;
  }
  if (!process.stdin.isTTY) {
    throw new ScriptError(
      `Parolni ${PASSWORD_ENV} env orqali bering yoki skriptni terminalda ishga tushiring.`,
    );
  }
  const password = await promptHidden('Parol: ');
  assertPasswordPolicy(password);
  if ((await promptHidden('Parolni takrorlang: ')) !== password) {
    throw new ScriptError('Parollar mos kelmadi.');
  }
  return password;
}

async function createSuperAdmin(prisma: PrismaClient): Promise<void> {
  const args = parseCliArgs();
  const password = await readPassword();
  const user = await createStaffUser(prisma, { ...args, role: Role.SUPER_ADMIN, password });
  console.log(`Super admin yaratildi: ${user.phone ?? ''} (id ${user.id}).`);
}

void runScript(createSuperAdmin);
