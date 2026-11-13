import { randomBytes } from 'node:crypto';

import request from 'supertest';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, Role, UserStatus } from '@lms/shared';
import type { AccountRole, LoginResponse } from '@lms/shared';

import { PASSWORD_HASHER } from '../../src/common/security/password-hasher.interface.js';
import { PrismaService } from '../../src/infra/prisma/prisma.service.js';

import {
  deleteTestGroups,
  deleteTestUsers,
  randomTestPhone,
  randomTestStudentCode,
  TEST_PASSWORD,
} from './test-users.js';

import type { PasswordHasher } from '../../src/common/security/password-hasher.interface.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

export const API = '/api/v1';
export { TEST_PASSWORD };
const HTTP_OK = 200;

const GROUP_SUFFIX_BYTES = 4;

export interface TestGroup {
  id: string;
  name: string;
  pathId: string;
}

interface CreateGroupOptions {
  name?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  mentorId?: string | null;
  /** Faol a'zolar (to'g'ridan-to'g'ri bazaga). */
  studentIds?: readonly string[];
  /** Mavjud yo'l (tozalashni uning egasi qiladi); berilmasa — yangi `PUBLISHED` bo'sh yo'l. */
  pathId?: string;
}

export interface TestUser {
  id: string;
  role: AccountRole;
  phone: string | null;
  studentCode: string | null;
}

interface CreateUserOptions {
  role: AccountRole;
  status?: UserStatus;
  mustChangePassword?: boolean;
}

/**
 * Test foydalanuvchilarini yaratadi va faqat o'zi yaratganlarini o'chiradi (dev seed'ga tayanmaydi,
 * mavjud yozuvlarga tegmaydi). Telefon/kod — tasodifiy, `E2E-` prefiksli kod sequence'ni sarflamaydi.
 */
export class AuthFixtures {
  private readonly createdIds: string[] = [];
  private readonly groupIds: string[] = [];
  private readonly pathIds: string[] = [];
  /** Foydalanuvchilardan OLDIN bajariladigan tozalashlar (progress/kontent — `users` ga `Restrict`). */
  private readonly beforeCleanupHooks: (() => Promise<void>)[] = [];

  constructor(private readonly app: INestApplication<App>) {}

  /** Qo'shimcha fixture (masalan `ContentFixtures`) o'z yozuvlarini shu yerda tozalaydi. */
  beforeCleanup(hook: () => Promise<void>): void {
    this.beforeCleanupHooks.push(hook);
  }

  async createUser(options: CreateUserOptions): Promise<TestUser> {
    const isStudent = options.role === Role.STUDENT;
    const hasher = this.app.get<PasswordHasher>(PASSWORD_HASHER);
    const user = await this.prisma().dbIncludingDeleted.user.create({
      data: {
        role: options.role,
        phone: isStudent ? null : randomTestPhone(),
        studentCode: isStudent ? randomTestStudentCode() : null,
        passwordHash: await hasher.hash(TEST_PASSWORD),
        mustChangePassword: options.mustChangePassword ?? false,
        firstName: 'E2E',
        lastName: options.role,
        status: options.status ?? UserStatus.ACTIVE,
      },
      select: { id: true, role: true, phone: true, studentCode: true },
    });
    this.createdIds.push(user.id);
    return user;
  }

  /** API orqali yaratilgan foydalanuvchini tozalash ro'yxatiga qo'shadi. */
  track(userId: string): void {
    this.createdIds.push(userId);
  }

  /** Test guruhi (o'z yo'li bilan): `E2E-` prefiksli nom, holat — standart ACTIVE. */
  async createGroup(options: CreateGroupOptions = {}): Promise<TestGroup> {
    const suffix = randomBytes(GROUP_SUFFIX_BYTES).toString('hex');
    const db = this.prisma().dbIncludingDeleted;
    const pathId = options.pathId ?? (await this.createGroupPath(suffix));
    const group = await db.group.create({
      data: {
        name: options.name ?? `E2E-${suffix}`,
        pathId,
        status: options.status ?? 'ACTIVE',
        mentorId: options.mentorId ?? null,
      },
      select: { id: true, name: true, pathId: true },
    });
    this.groupIds.push(group.id);
    await db.groupMember.createMany({
      data: (options.studentIds ?? []).map((studentId) => ({ groupId: group.id, studentId })),
    });
    return group;
  }

  private async createGroupPath(suffix: string): Promise<string> {
    const path = await this.prisma().dbIncludingDeleted.learningPath.create({
      data: { title: `E2E ${suffix}`, slug: `e2e-${suffix}`, status: 'PUBLISHED' },
      select: { id: true },
    });
    this.pathIds.push(path.id);
    return path.id;
  }

  /** API orqali yaratilgan guruhni tozalash ro'yxatiga qo'shadi. */
  trackGroup(groupId: string): void {
    this.groupIds.push(groupId);
  }

  /** Faqat shu fixture yaratgan foydalanuvchilar, guruhlar va ularga bog'langan yozuvlar o'chiriladi. */
  async cleanup(): Promise<void> {
    for (const hook of this.beforeCleanupHooks) {
      await hook();
    }
    const db = this.prisma().dbIncludingDeleted;
    await deleteTestUsers(db, this.createdIds);
    await deleteTestGroups(db, this.groupIds, this.pathIds);
  }

  private prisma(): PrismaService {
    return this.app.get(PrismaService);
  }
}

export function http(app: INestApplication<App>) {
  return request(app.getHttpServer());
}

export function loginRequest(app: INestApplication<App>, user: TestUser, password = TEST_PASSWORD) {
  return user.role === Role.STUDENT
    ? http(app).post(`${API}/auth/student/login`).send({ studentCode: user.studentCode, password })
    : http(app).post(`${API}/auth/staff/login`).send({ phone: user.phone, password });
}

export interface LoggedIn {
  accessToken: string;
  /** `rt=...` — keyingi so'rovlarning `Cookie` sarlavhasi uchun. */
  cookie: string;
  body: LoginResponse;
}

/** `Set-Cookie` dan `rt` cookie'ning to'liq satri (atributlari bilan). */
export function refreshSetCookie(response: request.Response): string | undefined {
  const raw: unknown = response.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? (raw as string[]) : [];
  return cookies.find((cookie) => cookie.startsWith('rt='));
}

export function cookiePair(setCookie: string | undefined): string {
  return (setCookie ?? '').split(';')[0] ?? '';
}

export async function login(app: INestApplication<App>, user: TestUser): Promise<LoggedIn> {
  const response = await loginRequest(app, user).expect(HTTP_OK);
  const body = response.body as LoginResponse;
  return { accessToken: body.accessToken, cookie: cookiePair(refreshSetCookie(response)), body };
}

export function refreshRequest(app: INestApplication<App>, cookie: string) {
  return http(app)
    .post(`${API}/auth/refresh`)
    .set('Cookie', cookie)
    .set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
}

/** Parallel so'rovlar natijasi: HTTP holati → nechta javob (rate limit testlari uchun). */
export function statusCounts(responses: readonly request.Response[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const { status } of responses) {
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

/** Berilgan roldagi yangi test foydalanuvchisi nomidan access token (suite `beforeAll` i uchun). */
export async function accessTokenFor(
  app: INestApplication<App>,
  fixtures: AuthFixtures,
  role: AccountRole,
): Promise<string> {
  return (await login(app, await fixtures.createUser({ role }))).accessToken;
}
