/** Versiya hisoblagichi bilan himoyalangan kesh kaliti (masalan mentor scope: `:gen` + `:studentIds`). */
export interface VersionedKey {
  versionKey: string;
  dataKey: string;
}

/** `RedisService.replaceSetIfVersion` argumenti. */
export interface VersionedSetWrite {
  key: string;
  versionKey: string;
  /** O'qishdan oldingi versiya; kalit yo'q bo'lgan bo'lsa — `''`. */
  expectedVersion: string;
  members: readonly string[];
  ttlSeconds: number;
}
