/** Parol hash'lash abstraksiyasi (docs/02 §1: Argon2id). Servislar shu interfeys orqali ishlaydi. */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(passwordHash: string, plainPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
