import type { AccountRole, GroupRef, Role, UserSort, UserStatus } from '@lms/shared';

/** Boshqaruv endpointlari orqali boshqariladigan rollar. SUPER_ADMIN — faqat CLI (S-13). */
export type ManagedRole = typeof Role.ADMIN | typeof Role.MENTOR | typeof Role.STUDENT;

/** Xodim rollari (telefon bilan kiradi). */
export type ManagedStaffRole = typeof Role.ADMIN | typeof Role.MENTOR;

/** Boshqaruv uchun akkaunt (repository'dan; Prisma tiplari tashqariga chiqmaydi). */
export interface UserAccountRecord {
  id: string;
  role: AccountRole;
  phone: string | null;
  studentCode: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
  mustChangePassword: boolean;
  bio: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  /** Mentorning faol guruhlari (boshqa rollarda — bo'sh). */
  mentoredGroups: GroupRef[];
  /** Studentning faol guruhi (S-02: bittadan ko'p emas). */
  activeGroup: GroupRef | null;
}

/** O'zgartirilishi mumkin bo'lgan maydonlar (PATCH). */
export interface AccountChanges {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: UserStatus;
}

export interface NewStaffData {
  role: ManagedStaffRole;
  phone: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdById: string;
}

export interface NewStudentData {
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdById: string;
}

export interface CreatedStudentRecord {
  id: string;
  studentCode: string;
}

/** Ro'yxat qidiruvi (`q` dan tayyorlangan). `namePattern` — `LIKE` uchun ekranlangan, kichik harfda. */
export interface UserSearchTerm {
  namePattern: string;
  /** To'liq student kodi (`ST-10245`) — aniq moslik. */
  studentCode: string | null;
  /** Telefon raqamlari bo'yicha `LIKE` naqshi (faqat xodimlar uchun). */
  phonePattern: string | null;
}

export interface UserSearchCriteria {
  role: ManagedRole;
  status?: UserStatus;
  groupId?: string;
  search: UserSearchTerm | null;
  sort: UserSort;
  page: number;
  pageSize: number;
}

export interface UserSearchPage {
  ids: string[];
  total: number;
}

/** Ro'yxat so'rovi (validatsiyadan keyin, `@lms/shared` sxemalari natijasi). */
export interface UserListQuery {
  q?: string;
  status?: UserStatus;
  groupId?: string;
  sort: UserSort;
  page: number;
  pageSize: number;
}

/** Yuklangan fayl (multer, xotirada) — faqat kerakli maydonlar. */
export interface UploadedCsvFile {
  buffer: Buffer;
  size: number;
  originalname: string;
}
