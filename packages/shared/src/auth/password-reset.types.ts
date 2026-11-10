/**
 * `POST /students/:id/reset-password`, `POST /staff/:id/reset-password` — 200 (docs/02 §4.3).
 * Vaqtinchalik parol FAQAT shu javobda bir marta ko'rsatiladi.
 */
export interface PasswordResetResponse {
  temporaryPassword: string;
}
