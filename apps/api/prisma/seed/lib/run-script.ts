import { ScriptError } from './errors.js';
import { createScriptPrismaClient } from './prisma.js';

import type { PrismaClient } from '../../../src/infra/prisma/generated/client.js';

type ScriptMain = (prisma: PrismaClient) => Promise<void>;

/**
 * Skriptni Prisma klienti bilan ishga tushiradi: `preflight` (bazaga ulanishdan oldingi tekshiruv),
 * so'ng `main`; oxirida ulanishni yopadi. `ScriptError` bo'lsa faqat xabar chiqariladi, jarayon
 * xato kodi bilan tugaydi.
 */
export async function runScript(main: ScriptMain, preflight?: () => void): Promise<void> {
  let prisma: PrismaClient | undefined;
  try {
    preflight?.();
    prisma = createScriptPrismaClient();
    await main(prisma);
  } catch (error) {
    process.exitCode = 1;
    if (error instanceof ScriptError) {
      console.error(`Xato: ${error.message}`);
      return;
    }
    console.error(error);
  } finally {
    await prisma?.$disconnect();
  }
}
