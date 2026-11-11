import type { Request } from 'express';

/** `cookie-parser` o'qigan cookie qiymati; yo'q yoki bo'sh bo'lsa — `undefined`. */
export function readCookie(request: Request, name: string): string | undefined {
  const value: unknown = request.cookies[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
