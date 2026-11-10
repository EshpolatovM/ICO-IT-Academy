/** Ota-ona panelidagi farzand (docs/12 §1: exchange javobi). */
export interface ParentChild {
  studentId: string;
  firstName: string;
  lastName: string;
  /** Guruh nomi. Guruhlar 2-bosqichda qo'shiladi — hozircha har doim `null`. */
  groupName: string | null;
}

/** `POST /auth/parent/exchange` — 200 (session `ps` va `parent_tokens` cookie'larida). */
export interface ParentExchangeResponse {
  children: ParentChild[];
}

/** `GET /auth/me` — ota-ona sessiyasi uchun (akkaunt yo'q: faqat farzandlar ro'yxati). */
export interface ParentMeResponse {
  role: 'PARENT';
  children: ParentChild[];
}

/** Token yaratish/qayta yaratish javobi (docs/12 §2). `token` va `link` — FAQAT shu javobda bir marta. */
export interface ParentTokenCreatedResponse {
  id: string;
  token: string;
  link: string;
  prefix: string;
  label: string | null;
  createdAt: string;
}

/** Faol token (ro'yxat uchun): xom token va hash qaytmaydi, faqat `prefix`. */
export interface ParentTokenSummary {
  id: string;
  prefix: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  useCount: number;
  expiresAt: string | null;
}

/** `GET /students/:id/parent-tokens` — 200. */
export interface ParentTokensListResponse {
  items: ParentTokenSummary[];
}
