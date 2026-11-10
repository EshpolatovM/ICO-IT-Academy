# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.2 tugadi va commit qilindi; keyingisi 1.2b (SeaweedFS + compose docs), egasining ruxsati kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (Tech Lead tavsiyasi, egasi "ha"). 1.2 tugagach alohida kichik vazifa: compose + .env.example + docs/13 yangilanadi.
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.2 — avtomatik sifat nazorati** (`oga-backend`, Tech Lead tekshirdi): ESLint `strictTypeChecked` + qat'iy limitlar (`QUALITY_LIMITS`: max-lines 300, fn 50, complexity 10, depth 4, params 5), `noInlineConfig` + `--max-warnings 0`, import-x tartibi, magic numbers, web'da `../../` taqiqi; jscpd (3%), dependency-cruiser (qatlamlar, Prisma faqat repository, features izolyatsiyasi, sikl); Husky + lint-staged; `.github/workflows/ci.yml`; `pnpm check`. Barcha qoidalar buzilgan namunalar bilan isbotlangan.

## Keyingi aniq vazifa
**1.2b — dev S3: MinIO → SeaweedFS** (`oga-backend`): `compose.yaml` da `minio` servisini SeaweedFS (`weed server -s3`, aniq pin tag) bilan almashtirish, healthcheck, nomlangan volume; `.env.example` S3 o'zgaruvchilari; README; `docs/13-arxitektura-va-stack.md` §3 da compose joyi (`compose.yaml` ildizda) va SeaweedFS. Tekshiruv: `podman compose config` va image pull ishlashi. Undan keyin **1.3** (docs/14 §1 bo'yicha: Prisma + baza).

## Egasidan kutilayotgan javoblar
- **max-params:** 5 qoldirilsinmi (NestJS DI uchun) yoki 4?
- **jscpd:** faqat 3% chegara oshganda xato (hozir) yoki har bir klonda?
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
