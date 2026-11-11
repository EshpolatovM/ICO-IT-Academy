import { ScriptError } from './errors.js';

/** Majburiy env o'zgaruvchisini o'qiydi; bo'sh yoki yo'q bo'lsa tushunarli xato beradi. */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ScriptError(`${name} env o'zgaruvchisi berilmagan (.env.example ga qarang).`);
  }
  return value;
}

/** Production muhitida ishga tushirilmasligi kerak bo'lgan skriptlar uchun. */
export function assertNotProduction(scriptName: string): void {
  if (process.env.NODE_ENV === 'production') {
    throw new ScriptError(`${scriptName} production muhitida (NODE_ENV=production) ishlamaydi.`);
  }
}
