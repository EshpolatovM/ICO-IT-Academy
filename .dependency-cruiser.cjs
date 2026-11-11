/**
 * dependency-cruiser: arxitektura (qatlamlar) qoidalari.
 * CLAUDE.md "Avtomatik sifat nazorati", docs/13-arxitektura-va-stack.md §3.
 *
 * Ishga tushirish: `pnpm depcheck`.
 */

const API_SRC = '^apps/api/src/';
const WEB_SRC = '^apps/web/src/';
const WEB_FEATURES = '^apps/web/src/features/';

/** Controller import qilishi mumkin bo'lgan ichki fayllar (service/dto/guard/decorator va yordamchilar). */
const CONTROLLER_ALLOWED_TARGETS = [
  '\\.service\\.ts$',
  '\\.dto\\.ts$',
  '/dto/',
  '\\.guard\\.ts$',
  '\\.decorator\\.ts$',
  '\\.pipe\\.ts$',
  '\\.interceptor\\.ts$',
  '\\.constants\\.ts$',
  '\\.types\\.ts$',
];

/** `@prisma/client` (yoki generatsiya qilingan `.prisma`) — o'rnatilgan yoki hali o'rnatilmagan holda ham. */
const PRISMA_CLIENT = [
  '^@prisma/client',
  'node_modules/@prisma/client/',
  'node_modules/\\.prisma/',
];

/** Prisma bilan to'g'ridan-to'g'ri ishlashga ruxsat berilgan joylar. */
const PRISMA_ALLOWED_FROM = [
  '\\.repository\\.ts$',
  '\\.repository\\.spec\\.ts$',
  `${API_SRC}infra/prisma/`,
];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: "Sikl (circular) bog'liqliklar taqiqlangan.",
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: "Hech kim import qilmaydigan fayl — keraksiz kod bo'lishi mumkin.",
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '\\.(spec|e2e-spec|test)\\.tsx?$',
          `${API_SRC}(main|worker)\\.ts$`,
          `${WEB_SRC}app/`,
          '(^|/)[^/]+\\.config\\.(js|cjs|mjs|ts)$',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Import qilingan modul topilmadi.',
      from: {},
      to: { couldNotResolve: true, pathNot: PRISMA_CLIENT },
    },
    {
      name: 'web-api-isolation',
      severity: 'error',
      comment:
        "apps/web va apps/api bir-birini import qilmaydi — umumiy narsa faqat @lms/shared'da.",
      from: { path: '^apps/web/' },
      to: { path: '^apps/api/' },
    },
    {
      name: 'api-web-isolation',
      severity: 'error',
      comment:
        "apps/api va apps/web bir-birini import qilmaydi — umumiy narsa faqat @lms/shared'da.",
      from: { path: '^apps/api/' },
      to: { path: '^apps/web/' },
    },
    {
      name: 'shared-not-to-apps',
      severity: 'error',
      comment: "@lms/shared ilovalarga bog'liq bo'lmaydi.",
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'controller-not-to-repository',
      severity: 'error',
      comment: "Controller → Service → Repository: controller repository'ni chaqirmaydi.",
      from: { path: '\\.controller\\.ts$' },
      to: { path: '\\.repository\\.ts$' },
    },
    {
      name: 'controller-only-allowed-layers',
      severity: 'error',
      comment:
        'Controller faqat service, dto, guard, decorator (va pipe/interceptor/constants/types) import qiladi.',
      from: { path: `${API_SRC}.+\\.controller\\.ts$` },
      to: {
        path: API_SRC,
        pathNot: CONTROLLER_ALLOWED_TARGETS,
      },
    },
    {
      name: 'service-not-to-controller',
      severity: 'error',
      comment: "Service controller'ga bog'liq bo'lmaydi.",
      from: { path: '\\.service\\.ts$' },
      to: { path: '\\.controller\\.ts$' },
    },
    {
      name: 'repository-not-to-upper-layers',
      severity: 'error',
      comment:
        "Repository faqat baza bilan ishlaydi: domen service yoki controller'ni import qilmaydi. Istisno — infra adapter servislari (src/infra/**: PrismaService va h.k.), repository aynan ular orqali bazaga ulanadi.",
      from: { path: '\\.repository\\.ts$' },
      to: { path: '\\.(service|controller)\\.ts$', pathNot: `${API_SRC}infra/` },
    },
    {
      name: 'prisma-only-in-repository',
      severity: 'error',
      comment:
        "@prisma/client faqat *.repository.ts va src/infra/prisma/** da ishlatiladi (controller/service Prisma'ga murojaat qilmaydi).",
      from: { path: API_SRC, pathNot: PRISMA_ALLOWED_FROM },
      to: { path: PRISMA_CLIENT },
    },
    {
      name: 'prisma-service-only-in-repository',
      severity: 'error',
      comment:
        "Prisma servisi (src/infra/prisma/**) faqat repository'lar va *.module.ts (DI ro'yxatdan o'tkazish) orqali ishlatiladi.",
      from: {
        path: API_SRC,
        pathNot: [...PRISMA_ALLOWED_FROM, '\\.module\\.ts$'],
      },
      to: { path: `${API_SRC}infra/prisma/` },
    },
    {
      name: 'features-isolation',
      severity: 'error',
      comment:
        'features/X boshqa features/Y ning ichki fayllarini import qilmaydi — faqat features/Y/index.ts orqali.',
      from: { path: `${WEB_FEATURES}([^/]+)/` },
      to: {
        path: WEB_FEATURES,
        pathNot: [`${WEB_FEATURES}$1/`, `${WEB_FEATURES}[^/]+/index\\.tsx?$`],
      },
    },
  ],
  options: {
    // Prisma Client (`prisma generate` natijasi, git'da yo'q) — ichiga kirilmaydi, lekin unga
    // qilingan importlar `prisma-service-only-in-repository` qoidasi bilan tekshiriladi.
    doNotFollow: { path: ['node_modules', `${API_SRC}infra/prisma/generated/`] },
    exclude: { path: ['^(apps|packages)/[^/]+/(dist|\\.next|\\.turbo|coverage)/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.depcruise.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.mjs', '.cjs', '.json'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
