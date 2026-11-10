# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.11a commit qilindi (WIP: 1 ta e2e yiqilmoqda); keyingisi — shu testni tuzatish, so'ng 1.11b frontend (`docs/tasks/01-1.11b-review-tuzatish-frontend.md`), yakuniy to'liq test |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | **2026-11-11 kechasi: avtonom** — egasi uxlayapti, savol so'ralmaydi, Tech Lead o'zi hal qiladi; 1-bosqich oxirigacha (1.8c → 1.8d → 1.9 → 1.10 + tuzatishlar), har vazifadan keyin commit; oxirida bitta hisobot `docs/HISOBOT-2026-11-11.md`. `main` ga merge, 2-bosqich, baza o'chirish — QILINMAYDI. Egasi qaytgach rejim yana "sekin". |

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
**1.11a — review tuzatishlari, backend** (`oga-backend`): H1–H5, M1–M5, L1–L3, L5, L7, L8, L10, UUID xato formati, turbo passThroughEnv, `next-env.d.ts` gitignore + `next typegen`. `pnpm check` yashil (api 319, web 94). Tech Lead qayta yurgizganda api e2e: 169/170 — `test/auth-login.e2e-spec.ts` "noto'g'ri parol, noma'lum telefon va INACTIVE — bir xil 401" testida 429 keldi (ehtimol yangi IP umumiy login limiti `auth:login-ip:*` ketma-ket ishga tushirishlarda to'planadi; agent 3 marta yashil ko'rgan). Limit tugagani uchun commit WIP sifatida qilindi.

## Keyingi aniq vazifa
1. `oga-backend`: `auth-login.e2e-spec.ts` dagi 429 ni tuzatish (suite boshida/test oldidan `auth:login-ip:*` va `auth:login:*` kalitlarini tozalash yoki testga alohida `X-Forwarded-For` IP berish), `pnpm --filter @lms/api test:e2e` ni 2 marta ketma-ket yashil qilish.
2. `docs/tasks/01-1.11b-review-tuzatish-frontend.md` oxiridagi "1.11a natijasi" bo'limini to'ldirib `birchka-frontend`ga berish (REFRESH_SUPERSEDED, logout CSRF, strict sxemalar, UUID VALIDATION_ERROR, next typegen — PROGRESS.md 1.11a yozuvida).
3. Yakuniy: `pnpm check`, `pnpm format:check`, `pnpm test:e2e` (api + Playwright), `docs/HISOBOT-2026-11-11.md` ni yakunlash.

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
