import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

/** Kiritilgan belgilarni ekranga chiqarmaydigan oqim (parol uchun). */
const silentOutput = new Writable({
  write(_chunk, _encoding, callback): void {
    callback();
  },
});

/** Terminaldan parolni ko'rsatmasdan so'raydi. */
export async function promptHidden(question: string): Promise<string> {
  // Avval interfeys (terminal raw rejimga o'tadi, aks-sado o'chadi), so'ng savol.
  const readline = createInterface({ input: process.stdin, output: silentOutput, terminal: true });
  process.stdout.write(question);
  try {
    return await readline.question('');
  } finally {
    readline.close();
    process.stdout.write('\n');
  }
}
