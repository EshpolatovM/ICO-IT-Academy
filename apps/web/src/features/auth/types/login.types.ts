/** Login turi: student (ID + parol) yoki staff (telefon + parol), docs/02 §1. */
export type LoginKind = 'student' | 'staff';

/** Ikkala login formasining umumiy qiymatlari: `login` — student ID yoki telefon raqam. */
export interface LoginFormValues {
  login: string;
  password: string;
}
