/** Rate limit qoidasi: `keyPrefix + subject` kaliti bo'yicha `windowSeconds` ichida `maxHits` ta. */
export interface RateLimitPolicy {
  keyPrefix: string;
  maxHits: number;
  windowSeconds: number;
  /** Berilsa — limitga yetgach kalit shuncha soniyaga bloklanadi. */
  blockSeconds?: number;
}

/** IP aniqlanmaganda kalitdagi o'rinbosar. */
export const UNKNOWN_IP = 'unknown';
