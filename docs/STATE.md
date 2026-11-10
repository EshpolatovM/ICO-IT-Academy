# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.8 tugadi va commit qilindi; keyingisi 1.8b (backend tuzatishlari: trust proxy, exchange failure, parent logout), egasining ruxsati kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- Dev Postgres host porti **5433** (`.env.example`), chunki host'da tizim PostgreSQL 5432 ni band qilgan. Dev baza `down -v` bilan tozalanib, qayta migrate + seed qilindi (egasi "ha", 2026-11-10).
- depcruise `src/infra/` istisnosi tasdiqlandi; `/ready` deploy bosqichiga qoldirildi (egasi "ha", 2026-11-10).
- Dev bazadagi sinov yozuvlarini (mentor `+998900000098`, `ST-10002`) o'chirish egasi tomonidan RAD ETILDI — tegilmaydi.
- S-12 tasdiqlandi (access 15 daq, refresh student 30 kun / staff 7 kun). Parollar qora ro'yxati kerak (~1000 ta, ochiq manba) — 1.6 ga kiritildi. Login uchun fixed window yetarli, progressiv kechikish yo'q (egasi "ha", 2026-11-10).
- Dizayn (2026-11-11, egasi "ha"): primary `#2563EB` qoladi; danger tugma hozirgi `hover:opacity-90` bilan; wireframe ko'rinishi va rassom-dizayner o'lchamlari ma'qul.
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.8 — frontend auth va panellar** (`birchka-frontend`, Tech Lead tekshirdi): Next rewrites `/api/v1` → `API_INTERNAL_URL`; `src/lib/api` (ApiError, single-flight refresh, 401 retry), `src/lib/query`, `src/lib/forms`; `stores/auth.store.ts`, `stores/parent-session.store.ts`; `features/auth`, `features/parent-access`, `features/shell`; sahifalar `/login`, `/login/staff`, `/change-password`, `/parent`, `/parent/[studentId]`, `/path`, `/mentor`, `/admin` + menyu bo'limlari ("Tez orada"); client route guard (`resolveAccess`). Web 80 test. Headless Chrome bilan 14 qadamli oqim sinalgan. `next.config.ts` da `NEXT_DIST_DIR` (ixtiyoriy).

## Keyingi aniq vazifa
**1.8b — backend tuzatishlari** (`oga-backend`, 1.8 hisobotidan):
1. `trust proxy` (env bilan sozlanadigan, dev default `loopback`) — aks holda rewrites ortida barcha IP 127.0.0.1, rate limit/blok global bo'ladi.
2. Cookie'siz body'siz `POST /auth/parent/exchange` failure hisoblanmasin (saqlangan token yo'q = xato emas).
3. `POST /auth/logout` sessiyasiz ham parent cookie'larini (`ps`, `parent_tokens`) tozalasin (yoki alohida `@Public` parent logout).
Keyin **1.8c** (`rassom-dizayner`): `NavItem` disabled holati, `TextLink`, mobil `AppShell`/`Sidebar` (ota-ona paneli mobile-first, docs/10 §5). So'ng **1.9** `sinchkov-tester` (Playwright e2e + RBAC matritsasi), **1.10** `domla-reviewer`.

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- **S-69 (yangi):** docs/03 da student "Mentor sahifasi" `/mentor` va mentor paneli dashboard'i `/mentor` — bir xil yo'l. Taklif: mentor paneli `/mentor/*` qoladi, student sahifasi `/my-mentor`. Hozir student menyusida "Mentor" bandi disabled.
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
