/** `users.first_name` / `users.last_name` uzunligi (docs/11 §1: varchar(64)). */
export const PERSON_NAME_MAX_LENGTH = 64;

/** Ro'yxatdagi qidiruv satri (`?q=`) chegarasi. */
export const USER_SEARCH_MAX_LENGTH = 64;

/**
 * Admin jadvallaridagi saralash (docs/12 §0: `?sort=-createdAt`). `-` — kamayish tartibi.
 * Minimal to'plam: yaratilgan vaqt (standart, yangilari birinchi) va familiya.
 */
export const UserSort = {
  CREATED_AT_DESC: '-createdAt',
  CREATED_AT_ASC: 'createdAt',
  LAST_NAME_ASC: 'lastName',
  LAST_NAME_DESC: '-lastName',
} as const;

export type UserSort = (typeof UserSort)[keyof typeof UserSort];

export const USER_SORT_DEFAULT: UserSort = UserSort.CREATED_AT_DESC;

/**
 * Studentlarni CSV orqali import qilish (S-21, docs/12 §2): birinchi qator — sarlavha, ustunlar
 * nomi bo'yicha aniqlanadi (tartib ixtiyoriy). `groupName` ustuni ixtiyoriy.
 */
export const StudentImportColumn = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  GROUP_NAME: 'groupName',
} as const;

export type StudentImportColumn = (typeof StudentImportColumn)[keyof typeof StudentImportColumn];

export const STUDENT_IMPORT_REQUIRED_COLUMNS: readonly StudentImportColumn[] = [
  StudentImportColumn.FIRST_NAME,
  StudentImportColumn.LAST_NAME,
];

/** `multipart/form-data` dagi fayl maydoni nomi. */
export const STUDENT_IMPORT_FILE_FIELD = 'file';
