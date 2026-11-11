/** E2E serverlar portlari — dev serverlar (3000/3001) bilan to'qnashmaydi. */
export const E2E_WEB_PORT = 3200;
export const E2E_API_PORT = 3201;
export const E2E_WEB_URL = `http://localhost:${String(E2E_WEB_PORT)}`;
export const E2E_API_URL = `http://localhost:${String(E2E_API_PORT)}`;

/** Global setup yaratgan foydalanuvchilar worker'larga shu env orqali uzatiladi. */
export const E2E_USERS_ENV = 'LMS_E2E_USERS';
