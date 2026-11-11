/** `parent_access_tokens` yozuvi (hash tashqariga chiqmaydi). */
export interface ParentTokenRecord {
  id: string;
  studentId: string;
  tokenPrefix: string;
  label: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
  useCount: number;
  expiresAt: Date | null;
}

export interface NewParentTokenData {
  studentId: string;
  tokenHash: string;
  tokenPrefix: string;
  label: string | null;
  createdById: string;
}

/** Amaldagi token va unga bog'langan faol student (exchange va session tekshiruvi uchun). */
export interface ParentGrant {
  tokenId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  /** Studentning faol guruhi nomi (guruhsiz — `null`). */
  groupName: string | null;
}

export interface ParentGrantWithHash extends ParentGrant {
  tokenHash: string;
}

/** `parent_access_logs` uchun mijoz ma'lumotlari (ustunlar NOT NULL). */
export interface ParentAccessLogMeta {
  ip: string;
  userAgent: string;
}

/** Bekor qilish/qayta yaratish kim tomonidan. */
export interface RevokeData {
  tokenId: string;
  studentId: string;
  revokedById: string;
  at: Date;
}

export interface RegeneratedTokens {
  revoked: ParentTokenRecord;
  created: ParentTokenRecord;
}

/** Yangi yaratilgan xom token (faqat bir marta javobga chiqadi). */
export interface GeneratedParentToken {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
}
