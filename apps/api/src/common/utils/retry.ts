import { setTimeout as sleep } from 'node:timers/promises';

export interface RetryOptions {
  /** Jami urinishlar soni (birinchisi bilan). */
  attempts: number;
  /** Chiziqli backoff: `n`-urinishdan keyin `n * backoffMs` kutiladi. */
  backoffMs: number;
}

/** `action` ni xatosiz bajarilguncha qayta urinadi; oxirgi urinish xatosi uzatiladi. */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      if (attempt >= options.attempts) {
        throw error;
      }
      await sleep(attempt * options.backoffMs);
    }
  }
}
