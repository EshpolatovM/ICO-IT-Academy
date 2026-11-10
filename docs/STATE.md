# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.4 — backend poydevori: `oga-backend`ga berildi (`docs/tasks/01-1.4-backend-poydevori.md`), bajarilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- Dev Postgres host porti **5433** (`.env.example`), chunki host'da tizim PostgreSQL 5432 ni band qilgan. Dev baza `down -v` bilan tozalanib, qayta migrate + seed qilindi (egasi "ha", 2026-11-10).
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.3 — 1-bosqich bazasi** (`usta-baza`, Tech Lead tekshirdi): Prisma 7.10.1 (`prisma.config.ts`, `@prisma/adapter-pg`), 7 model (`users`, `refresh_tokens`, `parent_access_tokens`, `parent_access_logs`, `audit_logs`, `system_settings`, `files`), migratsiya `20261110152528_init_foundation` (+ qo'lda: `student_code_seq` 10001, CHECK `chk_users_login_by_role`, pg_trgm GIN, partial index, identity id'lar; drift yo'q). Client `apps/api/src/infra/prisma/generated/` (gitignore). Seed: `create-super-admin` CLI (Argon2id, E.164), idempotent `db:seed` (1 mentor, `ST-10001`), production'da rad etadi. Umumiy kod `apps/api/prisma/seed/lib/`.

## Keyingi aniq vazifa
**1.4 — backend poydevori** (`oga-backend`): docs/14 §1 "Backend" qatoridan birinchi qism — PrismaService (`PrismaPg` adapter, soft delete extension `users.deleted_at`), BaseRepository (umumiy CRUD, pagination, soft delete), Redis moduli, ConfigModule + env validatsiya (zod), global exception filter va xatolik formati (docs/12), pino logger, health check endpoint. DRY: `seed/lib` dagi parol hash, parol siyosati, telefon normalizatsiyasi, `nextStudentCode` ni `src` dagi umumiy joyga / `@lms/shared` (zod) ga ko'chirib, seed'larni shundan import qildirish. Auth/guard'lar — 1.5+. Topshiriq: `docs/tasks/01-1.4-backend-poydevori.md`.

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
