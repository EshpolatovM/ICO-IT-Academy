import { HttpStatus } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';

import { ALL_ACTORS } from './rbac-actors.js';

import type { Actor, ActorKind, RbacActors } from './rbac-actors.js';

/**
 * RBAC matritsasi uchun umumiy tiplar va qator yordamchilari (`rbac-matrix.e2e-spec.ts`).
 * Har bir bosqich o'z endpointlarini alohida faylda (`rbac-*-cases.ts`) shu tiplar bilan yozadi.
 */

export interface Expectation {
  status: number;
  code?: ErrorCode;
}

/** `multipart/form-data` fayl (masalan CSV import). */
export interface RequestAttachment {
  field: string;
  content: Buffer;
  filename: string;
}

export interface RequestSpec {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  path: string;
  body?: object;
  csrf?: boolean;
  attach?: RequestAttachment;
}

export interface EndpointCase {
  endpoint: string;
  build: (actor: Actor, actors: RbacActors) => Promise<RequestSpec>;
  expected: Record<ActorKind, Expectation>;
  /** Muvaffaqiyatli javobda yaratilgan foydalanuvchilar (`id`, `students[].id`) tozalanadi. */
  createsUsers?: boolean;
  /** Muvaffaqiyatli javobda yaratilgan guruh (`id`) tozalanadi. */
  createsGroup?: boolean;
  /** Muvaffaqiyatli javobda yaratilgan kontent (`id`: yo'l yoki ko'nikma) tozalanadi. */
  createsContent?: 'path' | 'skill';
}

export const UNAUTHORIZED: Expectation = { status: 401, code: ErrorCode.UNAUTHORIZED };
export const FORBIDDEN: Expectation = { status: 403, code: ErrorCode.FORBIDDEN };
export const MCP_BLOCKED: Expectation = { status: 403, code: ErrorCode.PASSWORD_CHANGE_REQUIRED };
export const NOT_FOUND: Expectation = { status: 404, code: ErrorCode.NOT_FOUND };
export const ok = (status: number): Expectation => ({ status });
export const OK = ok(HttpStatus.OK);
export const CREATED = ok(HttpStatus.CREATED);

/** Ustunlar tartibi: anonim, SA, A, M, S, S(mcp), P. */
export function row(...cells: [Expectation, ...Expectation[]]): Record<ActorKind, Expectation> {
  return Object.fromEntries(ALL_ACTORS.map((kind, index) => [kind, cells[index]])) as Record<
    ActorKind,
    Expectation
  >;
}

/** SA A M S — akkauntli rollar (ota-ona — 403, mcp=true — 403 PASSWORD_CHANGE_REQUIRED). */
export const accountOnly = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, success, success, MCP_BLOCKED, FORBIDDEN);

/**
 * SA A M — xodimning studentga oid amallari. Matritsada nishon — mentorning guruhida bo'lmagan
 * yangi student, shuning uchun M — 404 (scope'dan tashqari, docs/12 §0). O'z guruhi studenti
 * uchun muvaffaqiyat — `groups.e2e-spec.ts`.
 */
export const staffStudentAccess = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, NOT_FOUND, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** Faqat SA (adminlarni boshqarish, S-11 A). */
export const superAdminOnly = (success: Expectation) =>
  row(UNAUTHORIZED, success, FORBIDDEN, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** SA va A (mentor/student/guruh boshqaruvi, docs/12 §2). */
export const adminsOnly = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** SA A M — kontent o'qish (`GET /admin/paths`, `/tree`; docs/12 §3, M4). */
export const contentReaders = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, success, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** Faqat M (mentor sahifasi, docs/12 §12). */
export const mentorOnly = (success: Expectation) =>
  row(UNAUTHORIZED, FORBIDDEN, FORBIDDEN, success, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** Faqat S (student ilm yo'li, docs/12 §4). */
export const studentOnly = (success: Expectation) =>
  row(UNAUTHORIZED, FORBIDDEN, FORBIDDEN, FORBIDDEN, success, MCP_BLOCKED, FORBIDDEN);

/** Studentga oid endpoint nishoni: student — o'zi, ota-ona — farzandi, qolganlar — yangi student. */
export async function targetStudent(actor: Actor, actors: RbacActors): Promise<string> {
  return actor.ownStudentId ?? (await actors.newUser(Role.STUDENT)).id;
}

export const resolved = (spec: RequestSpec) => () => Promise.resolve(spec);
