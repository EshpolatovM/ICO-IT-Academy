import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../../src/infra/prisma/generated/client.js';

import { requireEnv } from './env.js';

/** Skriptlar (seed, CLI) uchun Prisma klienti. Ilovaning PrismaService'i 1.4 da alohida yoziladi. */
export function createScriptPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: requireEnv('DATABASE_URL') });
  return new PrismaClient({ adapter });
}
