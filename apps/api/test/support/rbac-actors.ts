import { Role } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { PrismaService } from '../../src/infra/prisma/prisma.service.js';

import { login } from './auth-fixtures.js';
import {
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
} from './parent-fixtures.js';

import type { AuthFixtures, TestUser } from './auth-fixtures.js';
import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import type { App } from 'supertest/types.js';

const HTTP_OK = 200;

/**
 * RBAC matritsasidagi "kim" (docs/01 §2.1, docs/02 §7, docs/12 §1): anonim, akkauntli rollar,
 * `mustChangePassword = true` bo'lgan student va ota-ona (token → `ps` sessiyasi).
 */
export const ActorKind = {
  ANON: 'ANON',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
  STUDENT_MCP: 'STUDENT_MCP',
  PARENT: 'PARENT',
} as const;
export type ActorKind = (typeof ActorKind)[keyof typeof ActorKind];

export const ALL_ACTORS: readonly ActorKind[] = Object.values(ActorKind);

/** So'rov qiluvchi: o'z autentifikatsiyasini so'rovga qo'yadi. */
export interface Actor {
  kind: ActorKind;
  /** Akkauntli aktyor (anonim va ota-onada — `null`). */
  user: TestUser | null;
  /** Aktyorning "o'z" studenti: student uchun — o'zi, ota-ona uchun — farzandi. */
  ownStudentId: string | null;
  authorize: (req: request.Test) => request.Test;
}

const ACCOUNT_ROLE_OF: Readonly<Partial<Record<ActorKind, AccountRole>>> = {
  [ActorKind.SUPER_ADMIN]: Role.SUPER_ADMIN,
  [ActorKind.ADMIN]: Role.ADMIN,
  [ActorKind.MENTOR]: Role.MENTOR,
  [ActorKind.STUDENT]: Role.STUDENT,
  [ActorKind.STUDENT_MCP]: Role.STUDENT,
};

/**
 * Har bir matritsa katagi uchun yangi aktyor va nishon yozuvlarini yaratadi (katak natijasi
 * boshqasiga ta'sir qilmasin: parol almashtirish, chiqish, token limiti). Barcha yozuvlar
 * `AuthFixtures` orqali — `cleanup()` faqat shularni o'chiradi.
 */
export class RbacActors {
  private adminToken: string | null = null;

  constructor(
    private readonly app: INestApplication<App>,
    private readonly fixtures: AuthFixtures,
  ) {}

  async create(kind: ActorKind): Promise<Actor> {
    if (kind === ActorKind.ANON) {
      return { kind, user: null, ownStudentId: null, authorize: (req) => req };
    }
    if (kind === ActorKind.PARENT) {
      return this.createParent();
    }
    return this.createAccount(kind);
  }

  newUser(role: AccountRole): Promise<TestUser> {
    return this.fixtures.createUser({ role });
  }

  /** Admin nomidan studentga ota-ona tokeni (API orqali, audit bilan). */
  async issueToken(studentId: string): Promise<string> {
    return (await issueParentToken(this.app, await this.issuerToken(), studentId)).id;
  }

  /** Foydalanuvchining joriy sessiyasi (refresh token oilasi) id'si. */
  async sessionIdOf(userId: string): Promise<string> {
    const row = await this.app.get(PrismaService).db.refreshToken.findFirstOrThrow({
      where: { userId, revokedAt: null },
      select: { familyId: true },
    });
    return row.familyId;
  }

  private async createAccount(kind: ActorKind): Promise<Actor> {
    const role = ACCOUNT_ROLE_OF[kind];
    if (!role) {
      throw new Error(`Akkauntsiz aktyor: ${kind}`);
    }
    const user = await this.fixtures.createUser({
      role,
      mustChangePassword: kind === ActorKind.STUDENT_MCP,
    });
    const { accessToken } = await login(this.app, user);
    return {
      kind,
      user,
      ownStudentId: role === Role.STUDENT ? user.id : null,
      authorize: (req) => req.auth(accessToken, { type: 'bearer' }),
    };
  }

  private async createParent(): Promise<Actor> {
    const child = await this.newUser(Role.STUDENT);
    const issued = await issueParentToken(this.app, await this.issuerToken(), child.id);
    await resetParentExchangeLimits(this.app);
    const session = await exchange(this.app, { tokens: [issued.token] }).expect(HTTP_OK);
    const psCookie = pairOf(session, 'ps');
    return {
      kind: ActorKind.PARENT,
      user: null,
      ownStudentId: child.id,
      authorize: (req) => req.set('Cookie', psCookie),
    };
  }

  private async issuerToken(): Promise<string> {
    if (!this.adminToken) {
      const admin = await this.newUser(Role.ADMIN);
      this.adminToken = (await login(this.app, admin)).accessToken;
    }
    return this.adminToken;
  }
}
