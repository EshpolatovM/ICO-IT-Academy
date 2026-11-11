import type { Env } from './env.schema.js';

/**
 * Tiplangan konfiguratsiya. Qiymatlar ishga tushishda bir marta validatsiya qilinadi
 * (`AppConfigModule`), kodda `process.env` ga to'g'ridan-to'g'ri murojaat qilinmaydi.
 */
export class AppConfigService {
  constructor(private readonly env: Readonly<Env>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }
}
