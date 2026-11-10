# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.2b tugadi va commit qilindi; keyingisi 1.3 (baza: Prisma schema, `usta-baza`), egasining ruxsati kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.2b — dev S3: MinIO → SeaweedFS** (`oga-backend`, Tech Lead tekshirdi): `compose.yaml` da `s3` servisi (`chrislusf/seaweedfs:4.51`, `weed server -s3`, kalitlar env'dan, faqat 127.0.0.1:8333), `.env.example` S3_* bloki, README "Fayl saqlash (S3)" bo'limi (bucket `curl --aws-sigv4` bilan), docs/13 §1/§3/§4 va docs/14 §1 yangilandi. Haqiqiy S3 so'rovlari (create/list/put/get, 403, 409) o'tdi; konteyner va volume tozalandi.

## Keyingi aniq vazifa
**1.3 — 1-bosqich bazasi** (`usta-baza`): docs/14 §1 "Baza" qatori — `users`, `refresh_tokens`, `parent_access_tokens`, `parent_access_logs`, `audit_logs`, `files`, `system_settings`, `student_code_seq`; seed: super admin (CLI) + dev seed (1 mentor, 1 student). Manba: `docs/11-database.md`, `docs/01`, `docs/02`, `docs/13`. Avval topshiriqni `docs/tasks/01-1.3-baza.md` ga yozib, egasiga qisqa reja ko'rsatib, "ha"dan keyin `usta-baza`ga berish. Postgres `podman compose up -d postgres` bilan ko'tariladi.

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
