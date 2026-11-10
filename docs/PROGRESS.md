# PROGRESS — ish jurnali

Yangi yozuvlar pastga qo'shiladi.

---

## 2026-11-10 — Tahlil hujjatlari
- **Nima qilindi:** loyiha tavsifi `CLAUDE.md` ga saqlandi. 00–14, 99 va README tahlil hujjatlari yozildi.
- **Fayllar:** `CLAUDE.md`, `docs/00…14-*.md`, `docs/99-ochiq-savollar.md`, `docs/README.md`.

## 2026-11-10 — 0-qadam: agentlar va jarayon
- **Nima qilindi:**
  - 6 ta subagent yaratildi (database-engineer, backend-developer, ui-designer, frontend-developer, qa-tester, code-reviewer). Har birida umumiy qoidalar to'liq: kod sifati, frontend state, avtomatik sifat nazorati, wireframe dizayn qoidasi, to'xtash qoidalari, hisobot formati.
  - `CLAUDE.md` ga Tech Lead jarayon qoidalari qo'shildi.
  - Egasining javoblari hujjatlarga kiritildi: S-15 (har farzandga alohida token, havola + kod orqali kirish, token brauzerda `HttpOnly` cookie'da saqlanadi), S-30 (kunlik limit admin sozlamasidan), S-45 (LiveKit), S-61 (hosting'ga bog'lanmagan arxitektura).
  - Yangi savollar: S-67 (ota-ona kodi formati), S-68 (Podman/Docker).
  - Mermaid tekshiruvi: 46 diagramma, 1 ta xato tuzatildi (`01` dagi `@Roles`), qolganlari xatosiz.
  - Git repozitoriy ishga tushirildi, boshlang'ich commit `main` ga qilindi.
- **Fayllar:** `.claude/agents/*.md`, `CLAUDE.md`, `docs/01, 02, 05, 08, 10, 12, 13, 99`, `docs/STATE.md`, `docs/PROGRESS.md`, `.gitignore`.
- **Testlar:** kod hali yo'q.
- **Keyingi qadam:** Claude Code'ni qayta ishga tushirish, 1-bosqich rejasini tasdiqlash.

## 2026-11-10 — 1-bosqich boshlandi
- **Nima qilindi:**
  - Egasi rejani tasdiqladi. Dizayn oddiy standart token'lar bilan qilinadi.
  - S-67 (kod = token) va S-68 (Podman) qarorlari yozildi.
  - pnpm 10.34.9 `~/.local` ga o'rnatildi.
  - `feature/01-poydevor` branch'i ochildi.
  - 1.1 topshirig'i `docs/tasks/` ga saqlandi.
  - `backend-developer` agenti hali yuklanmagan (Claude Code qayta ishga tushirilishi kerak).
- **Fayllar:** `docs/99-ochiq-savollar.md`, `docs/STATE.md`, `docs/PROGRESS.md`, `docs/tasks/01-1.1-monorepo-skeleti.md`.

## 2026-11-10 — Agentlarga ism berildi, muloqot ohangi
- **Nima qilindi:**
  - Agentlarga ism berildi: `usta-baza`, `oga-backend`, `rassom-dizayner`, `birchka-frontend`, `sinchkov-tester`, `domla-reviewer` (fayllar va barcha havolalar yangilandi).
  - `CLAUDE.md` ga samimiy muloqot ohangi qo'shildi.
  - `podman compose` ishlashi tasdiqlandi.
- **Fayllar:** `.claude/agents/*.md`, `CLAUDE.md`, `docs/STATE.md`, `docs/tasks/01-1.1-monorepo-skeleti.md`.

## 2026-11-10 — 1.1: monorepo skeleti
- **Nima qilindi:** pnpm workspaces + Turborepo 2.11.10; `packages/config` (tsconfig strict, ESLint flat bazasi), `packages/shared` (Role enum, zod 4.6.7), `apps/api` (NestJS 11.2.9, prefiks `api/v1`, smoke test 2/2), `apps/web` (Next 15.5.29, React 19.3.1, alias'lar), `compose.yaml` (Postgres 16, Redis 7, MinIO; faqat 127.0.0.1), `.env.example`, README. Barcha versiyalar aniq pin.
- **Fayllar:** ildiz konfiglari, `apps/api/**`, `apps/web/**`, `packages/{config,shared}/**`, `.gitignore`.
- **Testlar:** install, build, lint, typecheck, test — Tech Lead qayta tekshirdi, hammasi o'tdi. `podman compose config` o'tdi.
- **Qarorlar:** TS 5.9.3 va ESLint 9 (typescript-eslint/Next mosligi uchun); compose ildizda; Redis paroli bilan; `.prettierignore` da docs.
- **Muammolar:** MinIO image'i registry'dan pull qilinmayapti — egasi qarori kerak.

## 2026-11-10 — 1.2: avtomatik sifat nazorati
- **Nima qilindi:** ESLint qat'iy rejim (`strictTypeChecked`, `QUALITY_LIMITS`, `noInlineConfig`, `--max-warnings 0`, import-x, no-magic-numbers, web `../../` taqiqi; testlarda fn-uzunligi/magic yumshatilgan), jscpd (threshold 3%), dependency-cruiser (controller→service→repository, Prisma faqat repository/infra, features izolyatsiyasi, web↔api, shared→apps, sikl), Husky + lint-staged pre-commit, GitHub Actions CI, `pnpm check`/`dup`/`depcheck`, README bo'limi.
- **Fayllar:** `.dependency-cruiser.cjs`, `tsconfig.depcruise.json`, `.jscpd.json`, `lint-staged.config.mjs`, `.husky/pre-commit`, `.github/workflows/ci.yml`, `packages/config/*`, `apps/*/eslint.config.mjs`, `*/package.json`, `pnpm-lock.yaml`, `README.md`.
- **Testlar:** `pnpm check`, `build`, `format:check` — Tech Lead qayta tekshirdi, o'tdi. Qoidalar buzilgan namunalar bilan isbotlandi (any, disable-komment, magic number — qo'lda ham tekshirildi).
- **Versiyalar:** eslint-plugin-import-x 4.17.1, jscpd 5.4.2, dependency-cruiser 18.7.0, husky 9.1.7, lint-staged 17.6.0.
- **Savollar:** max-params 5 yoki 4; jscpd chegarasi.

## 2026-11-10 — 1.2b: dev S3 MinIO → SeaweedFS
- **Nima qilindi:** `compose.yaml` da `minio` o'rniga `s3` (SeaweedFS 4.51, `weed server -s3`, kalitlar `AWS_*` env orqali, port faqat 127.0.0.1); `.env.example` S3_* bloki; README "Fayl saqlash (S3)"; docs/13 (dev compose ildizda, SeaweedFS, Docker/Podman) va docs/14 §1.
- **Fayllar:** `compose.yaml`, `.env.example`, `README.md`, `docs/13-arxitektura-va-stack.md`, `docs/14-yol-xaritasi.md`, `docs/tasks/01-1.2b-seaweedfs.md`.
- **Testlar:** `podman compose config`, haqiqiy S3 so'rovlari (create/list/put/get/403/409), `pnpm check`, `format:check` — o'tdi.
- **Ochiq:** prod compose joyi (`infra/compose/prod.yml`) keyinroq tasdiqlanadi.

## 2026-11-10 — 1.3: 1-bosqich bazasi
- **Nima qilindi:** Prisma 7.10.1 schema (7 jadval, 4 enum, snake_case map, uuid(7), timestamptz, idx_/uq_ nomlar), `init_foundation` migratsiyasi + qo'lda SQL (student_code_seq, CHECK, pg_trgm, partial index, identity), `create-super-admin` CLI va idempotent dev seed (Argon2id), db:* skriptlar, turbo `db:generate`, README "Baza" bo'limi.
- **Fayllar:** `apps/api/prisma/**`, `apps/api/prisma.config.ts`, `apps/api/{package.json,tsconfig*.json,eslint.config.mjs}`, `turbo.json`, `.dependency-cruiser.cjs`, `.gitignore`, `.prettierignore`, `.env.example`, `README.md`, `pnpm-lock.yaml`.
- **Testlar:** toza bazada migrate deploy, CHECK rad etishi, CLI xato holatlari, seed idempotentligi, production rad etishi, parollar hash — usta-baza; `pnpm check`, `build`, `format:check` — Tech Lead qayta tekshirdi, o'tdi.
- **Qarorlar:** `Role` enum'ida PARENT yo'q (virtual); onDelete — Prisma standarti (docs'da yo'q); `parent_access_logs.ip/user_agent` NOT NULL; parol siyosati S-19 taxmini (≥8, harf+raqam).
- **Savollar:** host 5432 band; dev bazani tozalash.

## 2026-11-10 — Dev muhit: Postgres porti va bazani tozalash
- **Nima qilindi:** `.env.example` da `POSTGRES_PORT`/`DATABASE_URL` 5433 ga (host 5432 band). Egasi ruxsati bilan `podman compose down -v`, so'ng toza bazaga `db:migrate:deploy` + `db:seed` (mentor, `ST-10001`) — o'tdi. 1.4 topshirig'i yozildi va `oga-backend`ga berildi.
- **Fayllar:** `.env.example`, `docs/STATE.md`, `docs/tasks/01-1.4-backend-poydevori.md`.

## 2026-11-10 — 1.4: backend poydevori
- **Nima qilindi:** zod env config, PrismaService + soft delete extension, BaseRepository (pagination), Redis moduli, global exception filter (docs/12 formati, Prisma xatolari mapper), zod validatsiya pipe, pino logger (requestId, redact), health endpoint (DB+Redis), seed logikasining DRY ko'chirilishi (`@lms/shared` sxemalari, `PasswordHasher`, `StudentCodeRepository`), e2e infratuzilmasi va CI service konteynerlari.
- **Fayllar:** `apps/api/src/{common,infra,modules}/**`, `apps/api/test/**`, `apps/api/prisma/seed/**`, `packages/shared/src/{auth,errors,health,pagination}/**`, `.dependency-cruiser.cjs`, `.github/workflows/ci.yml`, `.env.example`, `turbo.json`, `package.json`, `pnpm-lock.yaml`.
- **Testlar:** 87 unit, 4 e2e — Tech Lead qayta yurgizdi (`pnpm check`, `build`, `format:check`, `test:e2e`), hammasi o'tdi.
- **Qarorlar:** `@nestjs/config`, terminus, nestjs-zod o'rniga kichik o'z yechimlar; pagination `pageSize` (docs/12), default 20 / max 100; e2e alohida `test:e2e`.
- **Savollar:** depcruise istisnosi, `/ready`, dev bazadagi sinov yozuvlari.

## 2026-11-10 — 1.5: auth backend
- **Nima qilindi:** staff/student login, refresh rotation + reuse detection (family), logout, me, change-password, sessions; global JwtAuth/PasswordChangeRequired/Roles guard'lar, CSRF header guard, dekoratorlar; token_version Redis keshi; Redis login rate limiter; auth zod sxemalari va tiplari `@lms/shared` da; CI'da e2e oldidan migrate.
- **Fayllar:** `apps/api/src/modules/auth/**`, `apps/api/src/common/{decorators,guards,auth}/**`, `apps/api/src/modules/users/**`, `apps/api/test/**`, `packages/shared/src/auth/**`, `.env.example`, `.github/workflows/ci.yml`, `pnpm-lock.yaml`.
- **Testlar:** 152 unit, 16 e2e — Tech Lead qayta yurgizdi, hammasi o'tdi.
- **Qarorlar:** `@nestjs/jwt` 11.0.2 (12.x ESM-only); throttler o'rniga o'z limiter (muvaffaqiyatsiz urinishlar sanaladi); refresh sliding; eski parol xato → 400; S-12 qiymatlari env'da docs taxmini bo'yicha.
- **Savollar:** S-12 tasdig'i, parollar qora ro'yxati, progressiv kechikish, proxy ortida IP (hosting bilan).

## 2026-11-10 — 1.6: parent auth, parol tiklash, audit, RBAC
- **Nima qilindi:** parent token CRUD/regenerate, parent exchange (shifrlangan cookie, sliding session), parent autentifikatsiyasi va revoke, ParentReadOnlyGuard, StudentScope karkasi, student/staff reset-password, AuditService, umumiy FixedWindowRateLimiter, parollar qora ro'yxati (SecLists 10k → siyosatga mos 340 ta).
- **Fayllar:** `apps/api/src/modules/{parent-access,password-reset,audit,auth}/**`, `apps/api/src/common/{scope,rate-limit,security,guards,decorators,config}/**`, `apps/api/test/**`, `packages/shared/src/{auth,parent,audit,enums}/**`, `.env.example`, `.github/workflows/ci.yml`.
- **Testlar:** 252 unit, 26 e2e — Tech Lead qayta yurgizdi, o'tdi. Dev baza holati o'zgarmagan (4 user, 0 token, 0 audit).
- **Qarorlar:** qora ro'yxat 10k'dan filtrlangan (top-1000 dan faqat 12 tasi mos edi); mentor hozircha 403 (2-bosqichda scope → 404); token prefix 6 belgi (docs/02 §4.4); parent `me` = `{role, children}`; parent JWT `aud` bilan ajratilgan; exchange'da max 10 token (taxmin).

## 2026-11-11 — 1.7: design token'lar va UI komponentlar
- **Nima qilindi:** Tailwind v4, yagona `tokens.css` (egasi tasdiqlagan wireframe qiymatlari, standart Tailwind klasslari bloklangan), 17 ta `components/ui` komponenti, `cn` util, `/design-preview` (production'da yopiq), sahifalarda xom stil uchun ESLint taqiqlari, Vitest + Testing Library (26 test).
- **Fayllar:** `apps/web/{postcss.config.mjs,vitest.config.mts,vitest.setup.ts,eslint.config.mjs,package.json,tsconfig.json}`, `apps/web/src/{styles,components/ui,lib,app}/**`, `pnpm-lock.yaml`.
- **Testlar:** `pnpm check` (api 252, web 26), `format:check` — Tech Lead qayta yurgizdi, o'tdi; `/design-preview` dev'da 200, prod build'da 404 (agent tekshirdi).
- **Savollar:** primary `#2563EB` vs v4 blue-600; danger hover/fg token'lari.

## 2026-11-11 — 1.8: frontend auth va panellar
- **Nima qilindi:** rewrites, API client (single-flight refresh), TanStack Query, Zustand auth/parent store'lari, RHF + shared zod sxemalari (uz locale), login (student/staff), majburiy parol almashtirish, ota-ona kirishi (`?t=` tozalanadi, merge, chiqish), 4 ta rol layout'i, "Tez orada" bo'limlari, client route guard'lar. `changePasswordFormSchema` shared'ga qo'shildi. S-69 ochiq savol qo'shildi.
- **Fayllar:** `apps/web/src/{lib,stores,features,app}/**`, `apps/web/{next.config.ts,package.json,vitest.setup.ts}`, `packages/shared/src/auth/auth.schemas.ts`, `.env.example`, `docs/99-ochiq-savollar.md`, `pnpm-lock.yaml`.
- **Testlar:** `pnpm check` (api 252, web 80), `format:check`, `next build` (alohida distDir) — Tech Lead qayta yurgizdi, o'tdi.
- **Topilgan backend muammolari:** trust proxy yo'q, cookie'siz exchange failure sanaladi, parent logout sessiyasiz ishlamaydi → 1.8b.
- **UI yetishmovchiliklari:** NavItem disabled, TextLink, mobil AppShell → 1.8c.

## 2026-11-11 — S-69 va 1.8b: backend tuzatishlari
- **S-69:** mentor paneli `/mentor/*`, student mentor sahifasi `/my-mentor` (docs/03, docs/99).
- **Nima qilindi:** `TRUST_PROXY` (zod sxema, `configureApp` da), cookie'siz exchange failure sanalmaydi, `POST /auth/parent/logout` (public, CSRF header). README "Reverse proxy va mijoz IP'si", docs/12 §1.
- **Fayllar:** `apps/api/src/{main.ts,app.setup.ts}`, `apps/api/src/common/config/{env.schema,trust-proxy.schema}*.ts`, `apps/api/src/modules/auth/{controllers/parent-auth.controller,services/parent-exchange.service}*.ts`, `apps/api/test/**`, `.env.example`, `README.md`, `docs/{03,12,99}*.md`.
- **Testlar:** 276 unit, 31 e2e — Tech Lead qayta yurgizdi, o'tdi.

## 2026-11-11 — 1.8c: UI qo'shimchalari (avtonom rejim)
- **Nima qilindi:** NavItem disabled + hint, TextLink, mobil AppShell/Sidebar (menyu tugmasi, panel, Esc, fokus), design-preview namunalari, testlar.
- **Fayllar:** `apps/web/src/components/ui/{NavItem,AppShell,AppShellContext,MenuToggleButton,useMobileNav,Sidebar,TopBar,TextLink,index}.ts(x)`, testlar, `apps/web/src/app/design-preview/_components/LayoutSection.tsx`; `docs/tasks/01-1.8c…, 01-1.8d…, 01-1.9…`.
- **Testlar:** `pnpm check` (web 89), `format:check` — o'tdi.

## 2026-11-11 — 1.8d: frontend ulashlari (avtonom rejim)
- **Nima qilindi:** NavItem disabled, TextLink, `/my-mentor`, parent logout yangi endpoint, ShellTopBar mobil.
- **Fayllar:** `apps/web/src/app/{page.tsx,(auth)/login/**}`, `apps/web/src/features/{parent-access,shell}/**`.
- **Testlar:** `pnpm check` (web 94), `format:check` — o'tdi.
