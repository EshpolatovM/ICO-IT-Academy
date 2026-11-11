/** Belgilangan vaqtda tugamagan va'da uchun xato. */
export class TimeoutError extends Error {
  override readonly name = 'TimeoutError';
}

/** `promise` `timeoutMs` ichida tugamasa — `TimeoutError` bilan rad etiladi. */
export async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new TimeoutError(`${timeoutMs} ms ichida javob kelmadi`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
