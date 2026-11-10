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
