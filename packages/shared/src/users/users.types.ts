import type { UserStatus } from '../enums/user-status.js';
import type { FieldErrorDetail } from '../errors/error-code.js';
import type { GroupRef } from '../groups/group.types.js';

/** Boshqariladigan akkauntning umumiy maydonlari (docs/12 §2). Vaqtlar — ISO-8601 UTC. */
export interface ManagedUserBase {
  id: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  /** `true` — hali birinchi kirishda parolni almashtirmagan (vaqtinchalik parol). */
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Xodim (admin, mentor) — telefon bilan kiradi. */
export interface StaffAccount extends ManagedUserBase {
  phone: string;
}

/** `GET /super/admins` elementi va `PATCH /super/admins/:id` javobi. */
export type AdminUserListItem = StaffAccount;

/** `GET /admin/mentors` elementi: mentorning faol guruhlari va profil matni. */
export interface MentorListItem extends StaffAccount {
  bio: string | null;
  groups: GroupRef[];
}

/** `GET/PATCH /admin/mentors/:id`. */
export type MentorDetail = MentorListItem;

/** `GET /admin/students` elementi: studentning faol guruhi (S-02: bittadan ko'p emas). */
export interface StudentListItem extends ManagedUserBase {
  studentCode: string;
  group: GroupRef | null;
}

/** `GET/PATCH /admin/students/:id`. */
export type StudentDetail = StudentListItem;

/**
 * Yaratish javobi — 201. `temporaryPassword` FAQAT shu javobda bir marta (parol berilmagan bo'lsa
 * tizim yaratgan); parol admin tomonidan berilgan bo'lsa — `null`.
 */
export interface CreatedUserResponse {
  id: string;
  temporaryPassword: string | null;
  mustChangePassword: boolean;
}

/** `POST /super/admins`, `POST /admin/mentors` — 201. */
export interface CreatedStaffResponse extends CreatedUserResponse {
  phone: string;
}

/** `POST /admin/students` — 201 (docs/12 §2 namunasi). */
export interface CreatedStudentResponse extends CreatedUserResponse {
  studentCode: string;
}

/** CSV importda yaratilgan student. `temporaryPassword` — FAQAT import javobida bir marta. */
export interface ImportedStudent {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  groupName: string | null;
  temporaryPassword: string;
}

/** `POST /admin/students/import` — 201. */
export interface StudentImportResult {
  count: number;
  students: ImportedStudent[];
}

/**
 * Import validatsiyasi xatosi (`400 VALIDATION_ERROR`, `details[]`): `row` — fayldagi qator raqami
 * (1 — sarlavha; butun faylga oid xatoda `0`).
 */
export interface ImportRowError extends FieldErrorDetail {
  row: number;
}
