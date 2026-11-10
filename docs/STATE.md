# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.5 tugadi va commit qilindi; keyingisi 1.6 (parent auth, ScopeGuard, audit, reset-password), egasining ruxsati kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- Dev Postgres host porti **5433** (`.env.example`), chunki host'da tizim PostgreSQL 5432 ni band qilgan. Dev baza `down -v` bilan tozalanib, qayta migrate + seed qilindi (egasi "ha", 2026-11-10).
- depcruise `src/infra/` istisnosi tasdiqlandi; `/ready` deploy bosqichiga qoldirildi (egasi "ha", 2026-11-10).
- Dev bazadagi sinov yozuvlarini (mentor `+998900000098`, `ST-10002`) o'chirish egasi tomonidan RAD ETILDI — tegilmaydi.
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.5 — auth backend** (`oga-backend`, Tech Lead tekshirdi): `modules/auth` — staff/student login, refresh rotation (`family_id` bo'yicha reuse detection, `rt` cookie, `X-Requested-With` → `CsrfHeaderGuard`), logout, me, change-password (atomar, token_version++), sessions (id = family_id). Global guard'lar: JwtAuth → PasswordChangeRequired → Roles; `@Public`, `@Roles`, `@CurrentUser`, `@ClientMeta`, `@AllowPendingPasswordChange`. `token_version` Redis keshi (`user:ver:{id}`). O'z `LoginRateLimiter` (Redis, ip+login, muvaffaqiyatsiz urinishlar). Muddat/limitlar env'da (soniyalarda). 152 unit + 16 e2e.

## Keyingi aniq vazifa
**1.6 — parent auth va RBAC qolgan qismi** (`oga-backend`): docs/02 §4.3–4.5, §5, §5.1, docs/12 §1 va §16 (parent) — `POST /auth/parent/exchange` (HMAC-SHA256 pepper, `ps` session cookie, shifrlangan `parent_tokens` cookie, body'siz yangilash, merge), `ParentReadOnlyGuard`, `ScopeGuard` karkasi (mentor → o'z guruhlari; guruhlar 2-bosqichda, hozir interfeys + stub), parent token CRUD + regenerate (admin/super admin; mentor scope 2-bosqichda), `POST /students/:id/reset-password`, `POST /staff/:id/reset-password`, audit servisi (`audit_logs`), parent exchange rate limit. Topshiriq `docs/tasks/01-1.6-parent-auth.md` ga yoziladi.

## Egasidan kutilayotgan javoblar
- Parollar qora ro'yxati (docs/02 §6) — kerakmi, qaysi manba?
- Login uchun progressiv kechikish kerakmi yoki 5/15 daqiqa fixed window yetarlimi?
- **S-12** token muddatlari: hozir env'da docs taxmini (access 15 daqiqa, refresh student 30 kun / staff 7 kun) — tasdiqlash kerak.
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
