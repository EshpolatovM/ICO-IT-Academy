# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.6 tugadi va commit qilindi — 1-bosqich backend qismi yakunlandi; keyingisi 1.7 (rassom-dizayner: token'lar + components/ui), egasining ruxsati kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- MinIO image'i yo'q → dev muhitda S3-compatible **SeaweedFS** ishlatiladi (egasi "ha"; 1.2b da bajarildi).
- ESLint `max-params` = 5, jscpd faqat 3% chegara oshganda xato (egasi "ha", 2026-11-10).
- Dev Postgres host porti **5433** (`.env.example`), chunki host'da tizim PostgreSQL 5432 ni band qilgan. Dev baza `down -v` bilan tozalanib, qayta migrate + seed qilindi (egasi "ha", 2026-11-10).
- depcruise `src/infra/` istisnosi tasdiqlandi; `/ready` deploy bosqichiga qoldirildi (egasi "ha", 2026-11-10).
- Dev bazadagi sinov yozuvlarini (mentor `+998900000098`, `ST-10002`) o'chirish egasi tomonidan RAD ETILDI — tegilmaydi.
- S-12 tasdiqlandi (access 15 daq, refresh student 30 kun / staff 7 kun). Parollar qora ro'yxati kerak (~1000 ta, ochiq manba) — 1.6 ga kiritildi. Login uchun fixed window yetarli, progressiv kechikish yo'q (egasi "ha", 2026-11-10).
- `compose.yaml` ildizda qoladi; docs/13 §3 shunga moslab tuzatiladi.
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
**1.6 — parent auth, parol tiklash, audit, RBAC** (`oga-backend`, Tech Lead tekshirdi): `modules/parent-access` (token CRUD + regenerate, HMAC pepper, limit config'da, `FOR UPDATE`), `POST /auth/parent/exchange` (`ps` JWT `aud=parent-session`, AES-256-GCM `parent_tokens` cookie, merge/body'siz, `FixedWindowRateLimiter` umumlashtirildi), JwtAuthGuard Bearer yoki `ps`, parent `me`/logout, global `ParentReadOnlyGuard` + `@ParentWriteAllowed`, `StudentScopeResolver` + `@StudentScope` (mentor hozircha 403, 2-bosqichda group_members), `modules/password-reset` (student/staff), `modules/audit`, parollar qora ro'yxati (SecLists 10k, MIT, siyosatga mos 340 ta). 252 unit + 26 e2e.

## Keyingi aniq vazifa
**1.7 — dizayn token'lar va UI komponentlar** (`rassom-dizayner`): egasi tasdiqlagan wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, faqat yorug' tema) — Tailwind o'rnatish, token'lar CSS o'zgaruvchilari, `components/ui` (Button, Input, Label, FormField, Card, Alert, Spinner, Layout karkas elementlari), `/design-preview` sahifasi. Keyin 1.8 `birchka-frontend` (api client + TanStack Query, auth store, login sahifalari staff/student/parent, parol almashtirish, rol bo'yicha route guard'lar, bo'sh layout'lar). So'ng `sinchkov-tester`, `domla-reviewer`. Topshiriq `docs/tasks/01-1.7-ui-tokenlar.md` ga yoziladi.

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
