# PROJECT_STATE — Agentlar o'rtasidagi vazifa taqsimoti

> Ikki agent uchun umumiy holat jadvali. Batafsil Tech Lead holati: [`docs/STATE.md`](docs/STATE.md), tarix: [`docs/PROGRESS.md`](docs/PROGRESS.md), aloqa: [`AGENT_BUS.md`](AGENT_BUS.md).

**Oxirgi yangilanish:** 2026-11-11 14:31 +05 — Claude-1 (Backend)

## Agentlar

| Agent        | Rol                           | Soha (faqat shu papkalarga yozadi)                                                                         |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Claude-1** | Bosh arxitektor, Backend Lead | `apps/api/**`, `apps/api/prisma/**`, `packages/shared/**` (egasi), `docs/11-database.md`, `docs/12-api.md` |
| **Agent-2**  | Frontend                      | `apps/web/**` (sahifalar, feature'lar, `components/ui`, e2e Playwright)                                    |

Umumiy fayllar (`CLAUDE.md`, `docs/STATE.md`, `docs/PROGRESS.md`, ildiz konfiglari) — o'zgartirishdan oldin `AGENT_BUS.md` da kelishiladi.

## Status belgilari

`TODO` · `IN_PROGRESS` · `READY` (bajarildi, ikkinchi agent ishlata oladi) · `BLOCKED` · `DONE` (review + test o'tgan)

## Joriy bosqich: 2 — Admin asosi (foydalanuvchilar va guruhlar)

Branch: `feature/02-admin-asosi` · Reja: [`docs/tasks/02-reja.md`](docs/tasks/02-reja.md)

### Backend / DB / API — Claude-1

| #    | Vazifa                                                                                                                                                                    | Spec                                | Status      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------- |
| 2.1  | Baza: `learning_paths`, `groups`, `group_members`, dev seed                                                                                                               | `docs/tasks/02-2.1-baza.md`         | DONE        |
| 2.2  | Foydalanuvchilar API: `/super/admins`, `/admin/mentors`, `/admin/students` CRUD, deaktivatsiya, vaqtinchalik parol, CSV import, audit                                     | `docs/tasks/02-2.2-users.md`        | IN_PROGRESS |
| 2.3  | Guruhlar API: `/admin/groups` CRUD, mentor biriktirish, a'zolar; `StudentScopeResolver`; `/mentor/groups*`, `/mentor/students/:id`; mentor reset-password va parent-token | `docs/tasks/02-2.3-groups-scope.md` | TODO        |
| 2.6a | API e2e + RBAC matritsasi (2-bosqich endpointlari)                                                                                                                        | `docs/tasks/02-reja.md`             | TODO        |

### Frontend — Agent-2

| #    | Vazifa                                                                                                          | Bog'liqlik  | Status                        |
| ---- | --------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------- |
| 2.4  | UI komponentlar: Table, Pagination, Select, SearchInput, Dialog, Badge, Tabs, Textarea, FileInput, SecretReveal | —           | DONE                          |
| 2.5a | Admin: Studentlar, Mentorlar, Adminlar (SA) — ro'yxat, forma, CSV import                                        | 2.2 `READY` | TODO (skelet boshlash mumkin) |
| 2.5b | Admin: Guruhlar (ro'yxat, tafsilot, mentor biriktirish, a'zolar)                                                | 2.3 `READY` | TODO                          |
| 2.5c | Mentor: Guruhlar, Guruh tafsiloti, Student profili (parol tiklash, ota-ona tokenlari)                           | 2.3 `READY` | TODO                          |
| 2.6b | Playwright: admin student/mentor/guruh yaratadi, mentor o'z studentini ko'radi va token beradi                  | 2.5         | TODO                          |

### Umumiy

| #   | Vazifa                                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| 2.7 | Review → tuzatishlar → yakuniy test (`pnpm check`, `build`, api e2e, Playwright) → `main` ga merge (egasi ruxsati bilan) | TODO   |

## Keyingi bosqichlar (docs/14-yol-xaritasi.md)

3 Ilm yo'li va darslar · 4 Savollar bazasi · 5 XP/coin/streak/bildirishnomalar · 6 Takrorlash va missiya · 7 Portfolio · 8 Kod maydoni · 9 Bellashuv · 10 Mentor sahifasi · 11 Blog · 12 Reyting/liga · 13 Shop · 14 Ota-ona paneli

## Ochiq to'siqlar

- Agent-2 boshqa kompyuterda: fayllar git remote orqali sinxronlanadi — remote repo hali sozlanmagan (`docs/STATE.md` → "GitHub repo").
