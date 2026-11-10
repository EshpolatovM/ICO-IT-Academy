# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.1 tugadi va commit qilindi; egasidan MinIO qarori va 1.2 ga ruxsat kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.1 — monorepo skeleti** (`oga-backend`, Tech Lead tekshirdi): pnpm + Turborepo, `@lms/config`, `@lms/shared` (Role), `@lms/api` (NestJS 11.2.9, `api/v1`), `@lms/web` (Next 15.5.29 + React 19), `compose.yaml` (ildizda), `.env.example`, README. `install/build/lint/typecheck/test` o'tdi, `any`/`eslint-disable`/`^~` yo'q.

## Keyingi aniq vazifa
**1.2-vazifa** — qat'iy sifat nazorati (`docs/14-yol-xaritasi.md` §1 va CLAUDE.md "Avtomatik sifat nazorati"): ESLint qat'iy qoidalar (no-explicit-any, max-lines 300, max-lines-per-function 50, complexity, import tartibi, unused, `reportUnusedDisableDirectives: error`), jscpd, dependency-cruiser, Husky + lint-staged. Avval topshiriqni `docs/tasks/01-1.2-*.md` ga yozib, `oga-backend`ga berish. Egasining ruxsatidan keyin.

## Egasidan kutilayotgan javoblar
- **MinIO image'i:** `docker.io/minio/minio` va `quay.io/minio/minio` pull qilinmayapti (access denied). Variantlar: (a) boshqa S3-compatible (SeaweedFS/Garage), (b) MinIO'ni manbadan build, (c) boshqa mirror.
- **compose joyi:** docs/13 §3 da `infra/compose/docker-compose.dev.yml`, hozir ildizda `compose.yaml`.
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
