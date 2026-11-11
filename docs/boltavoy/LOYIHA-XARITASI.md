# LOYIHA XARITASI (Boltavoy eslatmalari)

> 2026-11-11 da Boltavoy (Claude-1) tomonidan o'rganib yozildi. Faqat o'qib chiqildi, kod o'zgartirilmagan. Manba: repo `main` (`b8c747f`).

## Mahsulot qisqacha
- IT yo'nalishidagi onlayn LMS: matnli darslar, gamifikatsiya (XP, coin, streak, liga, bellashuv).
- Rollar: Super admin (SA), Admin (A), Mentor (M), Student (S), Ota-ona (P, akkauntsiz, faqat o'qiydi).
- Auth: SA/A/M — telefon + parol; S — `ST-10001` + parol (birinchi kirishda almashtirish); P — token (`#t=` havola, hash'da saqlanadi, har farzandga alohida). JWT: access 15 daq, refresh S 30 kun / staff 7 kun.
- Asosiy qoidalar: XP va coin alohida, faqat ledger orqali; barcha raqamlar sozlamalardan; savollar bazasi bitta; RBAC deny-by-default; scope tashqarisi → 404.

## Roadmap (`docs/14-yol-xaritasi.md`)
1 Poydevor (DONE, `6f1175e`) · 2 Admin asosi (jarayonda) · 3 Ilm yo'li · 4 Savollar · 5 XP/coin/streak/bildirishnoma · 6 Takrorlash/missiya · 7 Portfolio · 8 Kod maydoni · 9 Bellashuv · 10 Mentor sahifasi · 11 Blog · 12 Liga · 13 Shop · 14 Ota-ona paneli · 15 AI mentor.

## Monorepo tuzilmasi
- `apps/api` — NestJS 11 + Prisma 7
- `apps/web` — Next.js 15
- `packages/shared` — `@lms/shared`: zod sxemalar, tiplar, enum'lar, xato kodlari
- `packages/config` — umumiy ESLint/tsconfig
- Ildiz: `compose.yaml` (Postgres 5433, Redis, SeaweedFS), `turbo.json`, `.dependency-cruiser.cjs`, `.jscpd.json`, `lint-staged.config.mjs`, `.husky/`, `.github/workflows/ci.yml`
- Jarayon: `CLAUDE.md`, `docs/`, `.claude/agents/` (6 agent), `AGENT_BUS.md`, `PROJECT_STATE.md`

## apps/api/src
**modules/**
| Modul | Nima qiladi |
|---|---|
| `auth` | login (staff/student), refresh rotation + reuse detection, logout, me, change-password, sessiyalar, ota-ona exchange; rate limiter'lar |
| `admin-users` | `/super/admins`, `/admin/mentors`, `/admin/students` CRUD, CSV import, status, vaqtinchalik parol |
| `groups` | **chala**: o'qish repository'lari + `GroupEnrollmentService` (faqat AdminUsersModule ichida) |
| `parent-access` | `/students/:id/parent-tokens` CRUD, regenerate |
| `password-reset` | `/students/:id/reset-password`, `/staff/:id/reset-password` |
| `users` | `UsersRepository`, `StudentCodeRepository` (controller yo'q) |
| `audit` | `AuditService`, `AuditLogsRepository` |
| `health` | health check |

**common/**: `BaseRepository` / `SoftDeletableBaseRepository`, guard'lar (`roles` — deny-by-default, `password-change-required`, `parent-read-only`, `student-scope`, `csrf-header`), decorator'lar (`Roles`, `Public`, `AnyAuthenticated`, `StaffStudentAccess`, `StudentScope`, `Actor`, `NoStore`...), `all-exceptions.filter`, `zod-validation.pipe`, `scope/role-based-student-scope.resolver.ts`, `transaction/unit-of-work.ts`, `security/` (argon2, AES-GCM), `rate-limit/`, `csv/`, `config/` (env zod).

**infra/**: `prisma` (soft-delete extension, `PrismaUnitOfWork`, exception mapper), `redis`, `logger` (pino).

**Prisma** (`apps/api/prisma/schema.prisma`): User, RefreshToken, ParentAccessToken, ParentAccessLog, AuditLog, Group, GroupMember, LearningPath, SystemSetting, File. Migratsiyalar: `20261110152528_init_foundation`, `20261111090000_groups_and_paths`. Seed: `prisma/seed/`.

## apps/web/src
- `app/`: `(auth)` login, login/staff, change-password · `(admin)/admin` · `(mentor)/mentor` · `(student)` · `(parent)/parent` · `design-preview`
- `features/`: `auth`, `parent-access`, `shell` (RoleShell, nav.config, ComingSoon)
- `components/ui/` (~40): Button, Input, Table, Pagination, Dialog, ConfirmDialog, Tabs, Select, SearchInput, SecretReveal, FileInput, Badge, Card, AppShell, Sidebar, TopBar...
- `stores/`: `auth.store.ts`, `parent-session.store.ts`
- `lib/`: `api/` (api-client, refresh-session, refresh-lock), `query/`, `forms/`

## Sifat nazorati
- ESLint: max-lines 300, max-lines-per-function 50, complexity 10, max-params 5, no-explicit-any, no-magic-numbers, `noInlineConfig: true`. Web'da ranglar/inline style/`../../` taqiqlangan.
- jscpd: 3%, minTokens 50.
- dependency-cruiser: qatlamlar, prisma faqat repository'da, features izolyatsiyasi.
- Husky pre-commit: lint-staged + typecheck.
- CI: audit, lint, typecheck, jscpd, depcruise, unit, migrate, Playwright, e2e, build.

## Testlar
api unit 66 fayl, api e2e 10 fayl, web vitest 29 fayl, Playwright 5 fayl. (STATE bo'yicha: unit 380, e2e 283, web 144, Playwright 9.)
