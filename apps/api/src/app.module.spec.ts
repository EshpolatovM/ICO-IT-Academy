import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { METHOD_METADATA } from '@nestjs/common/constants.js';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { Role } from '@lms/shared';

import { AppModule } from './app.module.js';
import { STAFF_ROLES } from './common/constants/roles.constants.js';
import { ANY_AUTHENTICATED_KEY } from './common/decorators/any-authenticated.decorator.js';
import { IS_PUBLIC_KEY } from './common/decorators/public.decorator.js';
import { ROLES_KEY } from './common/decorators/roles.decorator.js';

/**
 * Kompilyatsiya uchun `.env.example` qiymatlari (to'g'ri formatdagi namuna; ulanish `init` da bo'ladi,
 * bu yerda emas). Yangi env o'zgaruvchisi `.env.example` ga qo'shilsa — shu yerga avtomatik tushadi.
 */
const TEST_ENV = parseEnv(
  readFileSync(path.resolve(__dirname, '..', '..', '..', '.env.example'), 'utf8'),
);

describe('AppModule (smoke)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...TEST_ENV };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('modul xatosiz kompilyatsiya qilinadi', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    await moduleRef.close();
  });

  it("noto'g'ri env bilan modul ishga tushmaydi", async () => {
    process.env = { ...originalEnv, ...TEST_ENV, DATABASE_URL: '' };

    await expect(Test.createTestingModule({ imports: [AppModule] }).compile()).rejects.toThrow(
      /DATABASE_URL/,
    );
  });

  it("xodim rollari @lms/shared dagi Role'dan olinadi va student/ota-onani o'z ichiga olmaydi", () => {
    expect(STAFF_ROLES).toEqual([Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR]);
    expect(STAFF_ROLES).not.toContain(Role.STUDENT);
    expect(STAFF_ROLES).not.toContain(Role.PARENT);
  });
});

/** RBAC metadata kalitlari: har bir route'da kamida bittasi bo'lishi shart (deny-by-default). */
const ACCESS_KEYS = [IS_PUBLIC_KEY, ROLES_KEY, ANY_AUTHENTICATED_KEY] as const;

/** docs/12 da `PUB` deb belgilangan endpointlar — yangi public endpoint shu ro'yxatga ongli qo'shiladi. */
const EXPECTED_PUBLIC_ROUTES = [
  'AuthController.refresh',
  'AuthController.staffLogin',
  'AuthController.studentLogin',
  'HealthController.check',
  'ParentAuthController.exchange',
  'ParentAuthController.logout',
];

interface RouteAccess {
  route: string;
  access: string[];
}

/** Ilovadagi BARCHA HTTP route'lar (controller metodlari) va ulardagi RBAC metadata'si. */
async function collectRouteAccess(): Promise<RouteAccess[]> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, DiscoveryModule],
  }).compile();
  const reflector = moduleRef.get(Reflector);
  const scanner = moduleRef.get(MetadataScanner);
  const routes = moduleRef
    .get(DiscoveryService)
    .getControllers()
    .flatMap(({ instance, metatype }) => {
      if (!instance || !metatype) {
        return [];
      }
      const prototype = Object.getPrototypeOf(instance) as Record<string, unknown>;
      return scanner.getAllMethodNames(prototype).flatMap((name) => {
        const handler = prototype[name] as object;
        if (Reflect.getMetadata(METHOD_METADATA, handler) === undefined) {
          return [];
        }
        const targets = [handler as () => void, metatype];
        const access = ACCESS_KEYS.filter(
          (key) => reflector.getAllAndOverride<unknown>(key, targets) !== undefined,
        );
        return [{ route: `${metatype.name}.${name}`, access }];
      });
    });
  await moduleRef.close();
  return routes;
}

describe('RBAC deny-by-default — barcha route metadata (docs/13 §8)', () => {
  const originalEnv = process.env;
  let routes: RouteAccess[];

  beforeAll(async () => {
    process.env = { ...originalEnv, ...TEST_ENV };
    routes = await collectRouteAccess();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("route'lar topiladi (HTTP metod metadata'si bo'yicha)", () => {
    expect(routes.length).toBeGreaterThan(EXPECTED_PUBLIC_ROUTES.length);
    expect(routes.map((route) => route.route)).toContain('AccountController.me');
  });

  it("har bir route'da @Public, @Roles yoki @AnyAuthenticated bor (aks holda RolesGuard 403 beradi)", () => {
    expect(routes.filter((route) => route.access.length === 0).map((route) => route.route)).toEqual(
      [],
    );
  });

  it('@Public faqat docs/12 dagi PUB endpointlarda', () => {
    const publicRoutes = routes
      .filter((route) => route.access.includes(IS_PUBLIC_KEY))
      .map((route) => route.route)
      .sort();

    expect(publicRoutes).toEqual(EXPECTED_PUBLIC_ROUTES);
  });
});
