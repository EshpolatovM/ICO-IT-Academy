# ICO IT Academy — LMS

Onlayn, o'yinlashtirilgan IT ta'lim platformasi. Loyiha hujjatlari: [`docs/`](docs/README.md), jarayon qoidalari: [`CLAUDE.md`](CLAUDE.md).

## Tuzilma

| Papka             | Paket         | Tavsif                                                    |
| ----------------- | ------------- | --------------------------------------------------------- |
| `apps/api`        | `@lms/api`    | NestJS backend (prefiks `/api/v1`)                        |
| `apps/web`        | `@lms/web`    | Next.js (App Router) frontend                             |
| `packages/shared` | `@lms/shared` | Front va back uchun umumiy tiplar, enum'lar, zod sxemalar |
| `packages/config` | `@lms/config` | Umumiy `tsconfig` va ESLint konfiguratsiyasi              |

## Talablar

- Node.js 22 (`.nvmrc`)
- pnpm 10.34.9 (`packageManager` maydonida)
- Podman + `podman compose` (yoki Docker Compose)

## Ishga tushirish

```bash
pnpm install
cp .env.example .env          # qiymatlarni o'zgartiring
podman compose up -d          # PostgreSQL, Redis, SeaweedFS S3 (compose.yaml, ildizda)
pnpm dev                      # api: http://localhost:3001/api/v1, web: http://localhost:3000
```

### Reverse proxy va mijoz IP'si (`TRUST_PROXY`)

API rate limit, sessiyalar, audit va `parent_access_logs` uchun `req.ip` dan foydalanadi. Ilova proksi ortida bo'lsa (dev'da Next.js rewrites, production'da Nginx/LB) `TRUST_PROXY` orqali ishonchli proksi ko'rsatiladi: dev — `loopback`, production — faqat o'z proksingiz manzili/subneti (masalan `10.0.0.5` yoki `10.0.0.0/24`) yoki hop soni (`1`).

> **Ogohlantirish:** `TRUST_PROXY` keragidan kengroq bo'lsa (proksi yo'q joyda hop soni, mijozlar ham kiradigan subnet), har kim `X-Forwarded-For` sarlavhasini soxtalashtirib o'z IP'sini almashtira oladi va IP bo'yicha rate limit/blokni chetlab o'tadi, audit'ga soxta IP yoziladi. Proksi yo'q bo'lsa — `false`.

**Zanjir misoli (production): brauzer → Nginx → Next.js (web) → API.** Brauzer faqat web origin'ga murojaat qiladi, Next `rewrites` `/api/v1/*` ni API'ga uzatadi. Har bir proksi `X-Forwarded-For` ga o'zidan oldingi manzilni qo'shadi, shuning uchun API'ga sarlavha `<mijoz IP>, <Nginx IP>` ko'rinishida, TCP ulanish esa Next'dan keladi:

```
mijoz 203.0.113.7 ──► Nginx 10.0.0.5 ──► Next 10.0.0.6 ──► API
X-Forwarded-For (API'da): "203.0.113.7, 10.0.0.5"     req.socket: 10.0.0.6
```

- Hop soni bilan: `TRUST_PROXY=2` (Next + Nginx) — o'ngdan 2 ta manzil proksi deb tashlanadi, `req.ip = 203.0.113.7`. Faqat API'ga tashqaridan to'g'ridan-to'g'ri kirib bo'lmasa xavfsiz (aks holda hujumchi soxta `X-Forwarded-For` bilan bitta hop'ni "sotib oladi").
- Manzillar bilan (afzal): `TRUST_PROXY=10.0.0.5,10.0.0.6` (yoki ikkalasi bitta subnetda bo'lsa `10.0.0.0/29`) — faqat shu manzillar qo'shgan yozuvlarga ishoniladi.
- Next va API bitta hostda bo'lsa: `TRUST_PROXY=loopback,10.0.0.5`.
- Nginx `X-Forwarded-For` ni `$proxy_add_x_forwarded_for` bilan to'ldiradi (mijoz yuborgan qiymat ustiga qo'shadi) — shuning uchun API faqat ishonchli hop'larni o'ngdan sanaydi; `true` ataylab qabul qilinmaydi.

### Baza (PostgreSQL + Prisma)

Sxema: `apps/api/prisma/schema.prisma` (manba: `docs/11-database.md`), migratsiyalar: `apps/api/prisma/migrations/`, Prisma CLI konfiguratsiyasi: `apps/api/prisma.config.ts` (ildizdagi `.env` ni o'qiydi). Prisma Client `src/infra/prisma/generated/` ga generatsiya qilinadi (git'da yo'q; `build`/`typecheck`/`lint`/`test` dan oldin turbo avtomatik `db:generate` ni ishga tushiradi).

```bash
podman compose up -d postgres                       # faqat PostgreSQL
pnpm --filter @lms/api db:migrate:deploy            # migratsiyalarni qo'llash
pnpm --filter @lms/api db:seed                      # dev seed: mentor, student, yo'l, guruh, yo'l kontenti (SEED_* env, production'da ishlamaydi)
pnpm --filter @lms/api create-super-admin -- --phone +998901234567 --first-name Ali --last-name Valiyev
```

- `create-super-admin`: parol `SUPER_ADMIN_PASSWORD` env'dan olinadi, bo'lmasa terminalda ko'rinmas holda ikki marta so'raladi. Telefon band bo'lsa xato beradi.
- Jadvallar (migratsiyalar): `init_foundation` — `users`, `refresh_tokens`, `parent_access_tokens`, `parent_access_logs`, `audit_logs`, `system_settings`, `files`; `groups_and_paths` — `learning_paths` (`ContentStatus`), `groups` (`GroupStatus`, soft delete, bitta yo'l va bitta mentor — S-01, S-03), `group_members` (a'zolik tarixi; student bir vaqtda faqat bitta faol guruhda — partial unique `uq_group_members_active_student`, S-02).
  - `path_content_and_progress` — kontent: `path_sections`, `topics`, `lessons` (har darajada `ContentStatus`, DB default yo'q), `path_chests` (bitta mavzudan keyin bitta sandiq, `reward` jsonb), `skills`, `topic_skills`; progress: `student_path_enrollments` (`(student_id, path_id)` unique — lazy enrollment idempotentligi, backfill yo'q), `topic_progress` (`TopicStatus`), `lesson_progress` (`LessonProgressStatus`). Kontent ierarxiyasida `ON DELETE CASCADE`, progress/enrollment'dan kontentga va `users` ga `RESTRICT` (progressi bor kontent o'chmaydi → `ARCHIVED`), `path_chests.after_topic_id` → `NO ACTION`. Soft delete yo'q.
  - Qo'lda SQL: tartib unique'lari `uq_path_sections_path_id_order`, `uq_topics_section_id_order`, `uq_lessons_topic_id_order` — `DEFERRABLE INITIALLY IMMEDIATE` (bitta statementda tartib almashtirish o'tadi; ko'p statementli tranzaksiyada `SET CONSTRAINTS <nom> DEFERRED`); CHECK'lar `chk_topic_progress_status_not_locked` (`LOCKED` yozilmaydi — qator yo'q = locked), `chk_topic_progress_completed_at`, `chk_lesson_progress_completed_at` (`completed_at` faqat va albatta `COMPLETED` da). Raw SQL'da ustun `"order"` qo'shtirnoqda yoziladi.
- Dev seed idempotent: qayta ishga tushirilganda mavjud yozuvlar qayta yaratilmaydi va o'zgartirilmaydi. Yaratiladi: mentor (`SEED_MENTOR_*`), student (`SEED_STUDENT_*`; kodi `student_code_seq` dan — `ST-10001`, ..., birinchi kirishda parolni almashtirish majburiy), `PUBLISHED` yo'l (`SEED_PATH_SLUG`, `SEED_PATH_TITLE`), guruh (`SEED_GROUP_NAME`, seed mentor biriktirilgan) va seed studentning shu guruhdagi faol a'zoligi (student allaqachon biror faol guruhda bo'lsa o'tkazib yuboriladi). Yo'l kontenti (`apps/api/prisma/seed/data/dev-path-content.ts`): 2 bo'lim, 3 mavzu, 6 dars (bittasida kod bloki va `https:` video havola), 1 sandiq (1-mavzudan keyin, `xp 50` / `coin 30`, `min = max`) va 2 ko'nikma, hammasi `PUBLISHED`; ko'nikmalar nomi bo'yicha, kontent esa yo'lda hali bo'lim bo'lmasagina yaratiladi. Enrollment va progress seed qilinmaydi — student xaritani birinchi ochganda backend o'zi yaratadi.
- Boshqa buyruqlar: `db:migrate` (yangi migratsiya, `prisma migrate dev --name <nom>`), `db:generate`, `db:studio`.
- Mavjud migratsiya fayllari tahrirlanmaydi, faqat yangisi qo'shiladi.

### Fayl saqlash (S3)

Ilova faqat S3-compatible API bilan ishlaydi (`S3_*` o'zgaruvchilari, S-61). Dev muhitda `compose.yaml` dagi `s3` servisi — [SeaweedFS](https://github.com/seaweedfs/seaweedfs) (`weed server -s3`), S3 API `http://localhost:${S3_PORT}` (faqat `127.0.0.1`). Production'da istalgan S3-compatible xizmat ishlatiladi, faqat env qiymatlari o'zgaradi.

Bucket bir marta yaratiladi (curl ≥ 7.75, SigV4 imzo bilan):

```bash
set -a; . ./.env; set +a
curl --fail-with-body --aws-sigv4 "aws:amz:${S3_REGION}:s3" --user "${S3_ACCESS_KEY}:${S3_SECRET_KEY}" \
  -X PUT "${S3_ENDPOINT}/${S3_BUCKET}"
```

Bucket allaqachon bo'lsa `409 BucketAlreadyOwnedByYou` qaytadi — bu normal. `podman compose down -v` ma'lumotlarni (va bucket'ni) o'chiradi.

## Skriptlar (ildizdan, Turborepo orqali)

| Buyruq           | Vazifa                         |
| ---------------- | ------------------------------ |
| `pnpm build`     | Barcha paketlarni build qilish |
| `pnpm dev`       | Dev rejimda ishga tushirish    |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | TypeScript tekshiruvi          |
| `pnpm test`      | Unit testlar                   |
| `pnpm dup`       | Takroriy kod (jscpd)           |
| `pnpm depcheck`  | Arxitektura qoidalari          |
| `pnpm check`     | Hamma tekshiruvlar birdaniga   |
| `pnpm format`    | Prettier bilan formatlash      |

API'ni build'dan keyin ishga tushirish: `pnpm --filter @lms/api start` (ildizdagi `.env` o'qiladi).

## Sifat nazorati

Commit qilishdan oldin `pnpm check` (lint + typecheck + dup + depcheck + test) xatosiz o'tishi shart. Qoidalarni o'chirish yoki chetlab o'tish (`eslint-disable` va h.k.) faqat loyiha egasining ruxsati bilan.

| Vosita                                         | Konfiguratsiya                                | Nimani tekshiradi                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint (`typescript-eslint` strictTypeChecked) | `packages/config/eslint.config.base.mjs`      | `any` taqiqi, fayl ≤ 300 qator, funksiya ≤ 50 qator, complexity ≤ 10, max-depth 4, max-params 5, import tartibi, ishlatilmagan kod, magic number. Inline `eslint-disable` ishlamaydi (`noInlineConfig`). `apps/web` da `../../` importlar taqiqlangan (`@/...` alias'lar). |
| jscpd                                          | `.jscpd.json`                                 | Takroriy kod: `apps` + `packages`, chegara 3%.                                                                                                                                                                                                                             |
| dependency-cruiser                             | `.dependency-cruiser.cjs`                     | controller → service → repository; Prisma faqat `*.repository.ts` va `src/infra/prisma/**` da; `features/X` boshqa feature'ga faqat `index.ts` orqali; `apps/web` ↔ `apps/api` importi yo'q; sikl taqiqi; orphan ogohlantirishi.                                           |
| Husky + lint-staged                            | `.husky/pre-commit`, `lint-staged.config.mjs` | Commitdan oldin o'zgargan fayllarga `eslint --fix` + `prettier`, so'ng `pnpm typecheck`.                                                                                                                                                                                   |
| GitHub Actions                                 | `.github/workflows/ci.yml`                    | Har bir push/PR: install, lint, typecheck, dup, depcheck, test, build.                                                                                                                                                                                                     |

Limitlar bitta joyda (`QUALITY_LIMITS`, `packages/config/eslint.config.base.mjs`) saqlanadi. Test fayllarida (`*.spec.ts`, `*.e2e-spec.ts`) `max-lines-per-function`, `max-nested-callbacks` va `no-magic-numbers` o'chirilgan: `describe` bloklari tabiiy ravishda uzun, kutilgan qiymatlar esa aniq raqamlar bilan yoziladi.
