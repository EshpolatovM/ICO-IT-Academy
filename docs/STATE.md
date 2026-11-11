# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 2-bosqich: Admin asosi — foydalanuvchilar va guruhlar (reja: `docs/tasks/02-reja.md`) |
| Joriy bosqich | 1-bosqich `main` ga merge qilindi (2026-11-11); 2.1 baza (`usta-baza`) boshlanmoqda |
| Joriy git branch | `feature/02-admin-asosi` |
| Ish rejimi | **To'liq avtonom** (egasi 2026-11-11: savol berma, tasdiq kutma, Tech Lead o'zi qaror qiladi; faqat haqiqiy xavfli amallarda to'xtash). Har vazifadan keyin commit + STATE/PROGRESS; hisobot `docs/HISOBOT-*.md` |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- Dev Postgres host porti **5433** (`.env.example`), chunki host'da tizim PostgreSQL 5432 ni band qilgan. Dev baza `down -v` bilan tozalanib, qayta migrate + seed qilindi (egasi "ha", 2026-11-10).
- depcruise `src/infra/` istisnosi tasdiqlandi; `/ready` deploy bosqichiga qoldirildi (egasi "ha", 2026-11-10).
- Dev bazadagi sinov yozuvlarini (mentor `+998900000098`, `ST-10002`) o'chirish egasi tomonidan RAD ETILDI — tegilmaydi.
- S-12 tasdiqlandi (access 15 daq, refresh student 30 kun / staff 7 kun). Parollar qora ro'yxati kerak (~1000 ta, ochiq manba) — 1.6 ga kiritildi. Login uchun fixed window yetarli, progressiv kechikish yo'q (egasi "ha", 2026-11-10).
- Dizayn (2026-11-11, egasi "ha"): primary `#2563EB` qoladi; danger tugma hozirgi `hover:opacity-90` bilan; wireframe ko'rinishi va rassom-dizayner o'lchamlari ma'qul.
- S-69 (2026-11-11): mentor paneli `/mentor/*`, student mentor sahifasi `/my-mentor` (docs/03 §2.11 yangilandi). Frontend menyusida "Mentor" bandini `/my-mentor` ("Tez orada") ga yoqish — 1.8c dan keyin birchka-frontend'ga kichik vazifa.
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**S-70** — ota-ona havolasi `#t=` (backend `buildParentLink`, shared `parseParentLinkFragment`, frontend fragmentdan o'qib `history.replaceState` bilan tozalaydi, `?t=` orqaga moslik). **1-bosqich `main` ga merge qilindi** (`--no-ff`). S-01 B, S-02 A, S-03 A — Tech Lead qarori.

## Keyingi aniq vazifa
**2.1 — baza** (`usta-baza`, `docs/tasks/02-2.1-baza.md`): `learning_paths`, `groups`, `group_members`, dev seed (1 yo'l, 1 guruh, seed mentor, `ST-10001`). Keyin 2.2–2.7 (`docs/tasks/02-reja.md`).

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
