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
