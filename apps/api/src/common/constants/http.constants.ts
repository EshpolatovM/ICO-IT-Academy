/** Maxfiy qiymat (xom token, vaqtinchalik parol) qaytaradigan javoblar keshlanmaydi. */
export const NO_STORE = { name: 'Cache-Control', value: 'no-store' } as const;

/** Ota-ona exchange javobi (docs/02 §5: "Token oshkor bo'lishi"). */
export const NO_REFERRER = { name: 'Referrer-Policy', value: 'no-referrer' } as const;
