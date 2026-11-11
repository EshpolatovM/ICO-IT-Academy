/** ioredis klienti uchun DI token. */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/**
 * Ulanish uzilganda buyruqlar navbatda osilib qolmasin — darhol xato (health 503, kesh fallback).
 * Ulanish `onModuleInit` da kutiladi, shuning uchun ishga tushishda navbat kerak emas.
 */
export const REDIS_MAX_RETRIES_PER_REQUEST = 1;
