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
podman compose up -d          # PostgreSQL, Redis, MinIO
pnpm dev                      # api: http://localhost:3001/api/v1, web: http://localhost:3000
```

## Skriptlar (ildizdan, Turborepo orqali)

| Buyruq           | Vazifa                         |
| ---------------- | ------------------------------ |
| `pnpm build`     | Barcha paketlarni build qilish |
| `pnpm dev`       | Dev rejimda ishga tushirish    |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | TypeScript tekshiruvi          |
| `pnpm test`      | Unit testlar                   |
| `pnpm format`    | Prettier bilan formatlash      |

API'ni build'dan keyin ishga tushirish: `pnpm --filter @lms/api start` (ildizdagi `.env` o'qiladi).
