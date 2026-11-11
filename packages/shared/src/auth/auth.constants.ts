/**
 * CSRF himoyasi (docs/02 §6): `POST /auth/refresh` shu sarlavhani talab qiladi.
 * Frontend api client refresh so'roviga aynan shu qiymatni qo'yadi.
 */
export const CSRF_HEADER_NAME = 'X-Requested-With';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';
