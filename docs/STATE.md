# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.7 tugadi va commit qilindi; egasi `/design-preview` ni ko'rib chiqishi va 1.8 (birchka-frontend) ga ruxsat kutilmoqda |
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
**1.7 — design token'lar va UI** (`rassom-dizayner`, Tech Lead tekshirdi): Tailwind 4.3.3 (`@tailwindcss/postcss`), `src/styles/tokens.css` (`@theme static`, Tailwind standart klasslari `initial` bilan bloklangan), semantik klasslar (`bg-primary`, `text-text-muted`, `border-border`, `bg-danger-bg` ...), `components/ui` (Button, Input, PasswordInput, Label, FormField, Card*, Alert, Spinner, Heading, Text, Container, Stack, AppShell, TopBar, Sidebar, NavItem, EmptyState, `classes.ts`), `src/lib/cn.ts`, `/design-preview` (production'da 404, `ENABLE_DESIGN_PREVIEW`), ESLint: palitra klasslari, hex/rgb/oklch, `style`, arbitrary qiymatlar taqiqi. Vitest + Testing Library: 26 test.

## Keyingi aniq vazifa
**1.8 — frontend: auth sahifalari va panellar** (`birchka-frontend`): api client (access token xotirada, refresh bitta so'rovga yig'iladi, `X-Requested-With`), TanStack Query, `stores/auth.store.ts` (Zustand), login sahifalari (staff, student, parent `/parent?t=` + kod kiritish), majburiy parol almashtirish, rol bo'yicha route guard'lar, bo'sh layout'lar (student/mentor/admin/super admin/parent) `AppShell` bilan. Faqat `components/ui` va token'lar. Topshiriq `docs/tasks/01-1.8-frontend-auth.md` ga yoziladi.

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- Asosiy rang: `#2563EB` (egasi bergan, Tailwind v3 blue-600) qolsinmi yoki v4 blue-600 (`oklch(54.6% 0.245 262.881)` ≈ `#155DFC`)?
- Danger tugma uchun alohida `--color-danger-hover` / `--color-danger-fg` token'lari kerakmi (hozir `hover:opacity-90`)?
- `/design-preview` ni ko'rib, wireframe ko'rinishini tasdiqlash.
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
