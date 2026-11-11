# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-11 19:10

> Hamkorlik (Boltavoy, Drive xatlari, taqsimot, agentlar) — **`docs/HAMKORLIK.md`**. Yangi sessiya ikkala faylni ham o'qiydi.

| Maydon | Qiymat |
|---|---|
| Joriy modul | 2-bosqich: Admin asosi — foydalanuvchilar va guruhlar (reja: `docs/tasks/02-reja.md`) |
| Joriy bosqich | 2.1, 2.2, 2.4, **2.5a** tayyor; 2.3 — Boltavoyda (IN_PROGRESS); 2.5b/2.5c — 2.3 READY'dan keyin |
| Joriy git branch | `feature/02-admin-asosi` |
| Ish rejimi | **To'liq avtonom** (Qo'ziboy; Boltavoy o'z egasi bilan sekin rejimda) (egasi 2026-11-11: savol berma, tasdiq kutma, Tech Lead o'zi qaror qiladi; faqat haqiqiy xavfli amallarda to'xtash). Har vazifadan keyin commit + STATE/PROGRESS; hisobot `docs/HISOBOT-*.md` |

## Hamkorlik (2026-11-11, egasi "ha")
- Ikkinchi Claude sessiyasi — **Boltavoy** (bu sessiya — Qo'ziboy). Back/front bo'linmasi yo'q; vazifani egasi + Qo'ziboy taqsimlaydi.
- Aloqa: Google Drive papkasidagi `XAT — ...md` fayllari (git'dagi AGENT_BUS ishlatilmaydi).
- GitHub remote: `origin` = `EshpolatovM/ICO-IT-Academy`. `feature/02-admin-asosi` push qilindi; ikkala sessiya shu bitta branch'da ishlaydi (`git pull --rebase`, force push yo'q, `main` ga merge faqat egasi ruxsati bilan).
- Taqsimot (egasi "ha", 2026-11-11 17:35): **Boltavoy → 2.3** (guruhlar API + mentor scope, `apps/api/**`); **Qo'ziboy → 2.5a** (admin: Studentlar, Mentorlar, Adminlar sahifalari, `apps/web/**`, vazifa `docs/tasks/02-2.5a-admin-users-ui.md`).
- Koordinatsiya: har qadamdan oldin/keyin Drive papkasi + `git fetch` tekshiriladi; IN_PROGRESS/READY xatlar; umumiy fayllar (shared, STATE, PROGRESS, root config, lockfile) oldidan ogohlantirish. Boltavoy o'z holatini `docs/boltavoy/HOLAT.md` da yuritadi.

## Tech Lead qarorlari (2026-11-11, egasi "o'zing tanla")
- Sidebar'dagi "Foydalanuvchilar" bandi `/admin/students`, `/admin/mentors`, `/admin/admins` da faol ko'rinadi (`NavEntry` ga active prefix). 2.5b bilan birga qilinadi.
- `/admin/mentors/[id]` alohida sahifa hozircha QILINMAYDI: tahrirlash Dialog orqali. Mentorning guruhlari va studentlari kerak bo'lsa, 2.5b da qayta ko'riladi.
- CSV import limitlari: Boltavoydan `@lms/shared` ga konstanta so'raldi. Kelguncha klientda bloklanmaydi, faqat hint ko'rsatiladi.

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
**2.1 — baza** (`usta-baza`, Tech Lead tekshirdi): `ContentStatus`, `GroupStatus`, `learning_paths`, `groups` (soft delete), `group_members` (partial unique `uq_group_members_active_student`, partial IX), migratsiya `20261111090000_groups_and_paths`, idempotent seed (yo'l `frontend`, "Dev guruh", seed mentor, `ST-10001`). Relation'lar: `User.mentoredGroups`, `User.groupMemberships`, `Group.path/mentor/members`. Ikkinchi faol guruh → P2002 `uq_group_members_active_student` (servis domen xatosiga aylantirishi kerak). Test user'lar guruhga qo'shilsa `deleteTestUsers` avval `group_members` ni o'chirishi kerak.

**2.4 — UI** (`rassom-dizayner`, Tech Lead tekshirdi): Table/TableHead (saralash, `aria-sort`), Pagination (`getPageCount`), Select, SearchInput (debounce feature'da), Textarea, FileInput, Badge, DescriptionList, Dialog + ConfirmDialog (Radix dialog 1.3.1; `onConfirm` oynani o'zi yopmaydi), Tabs (Radix 1.2.1), SecretReveal (+`useCopyToClipboard`), `toneClasses`. Web 144 test.

**2.2 — backend: foydalanuvchilar** (`oga-backend`, Tech Lead tekshirdi): `modules/admin-users` — `/super/admins` (SA), `/admin/mentors`, `/admin/students` (SA A): CRUD, qidiruv (pg_trgm), filtr, saralash, pagination, vaqtinchalik parol bir marta, deaktivatsiya/aktivatsiya (token_version, refresh, parent tombstone), CSV import (`firstName,lastName[,groupName]`, hammasi yoki hech narsa, o'z RFC 4180 parser), audit. `modules/groups` boshlandi (repository'lar, `GroupEnrollmentService`). Yangi kodlar: `STUDENT_ALREADY_IN_GROUP` (409), `PAYLOAD_TOO_LARGE` (413). api unit 380, e2e 283.

## Keyingi aniq vazifa
**2.5a — TAYYOR** (2026-11-11, birchka-frontend; Tech Lead tekshirdi: `pnpm check` yashil, web 40 fayl / 189 test, api 380). `/admin/students` (+`[id]`, `import`), `/admin/mentors`, `/admin/admins` (SA). Guruh filtri disabled placeholder.
**2.5d TAYYOR** (17:10): `NavEntry.activePrefixes`; "Foydalanuvchilar" students+mentors da faol, `/admin/admins` da faqat alohida "Adminlar" bandi faol (ikki band birdan yonmasin — Tech Lead qarori).
**2.6a TAYYOR** (17:30): Playwright admin users yashil. Ochiq: CSV import bug (Boltavoyda); 3d test matni `docs/tasks/02-2.6a-playwright-admin-users.md` da, bug tuzatilgach qaytarib yurgiziladi.
**Eski yozuv:** 2.6a Playwright admin users (sinchkov-tester, `docs/tasks/02-2.6a-playwright-admin-users.md`). Tugagach: tekshirish → commit/push → HAMKORLIK + Boltavoyga READY. 20:03 da Boltavoyning 2.3 READY xati tekshiriladi.
**Keyingi:** Boltavoy 2.3 READY yozishini kutish → 2.5b (Guruhlar sahifalari) + 2.5c (Mentor paneli) birchka-frontend'ga; student guruh filtri/tanlovini ulash. UX savollari hal qilindi (yuqoridagi "Tech Lead qarorlari").

Eski yozuv:
**2.3 — backend: guruhlar, mentor scope** (`oga-backend`, `docs/tasks/02-2.3-groups-scope.md` tayyor) — egasi ruxsat berganda. Keyin 2.3, 2.5, 2.6, 2.7 (`docs/tasks/02-reja.md`).

## 2-bosqich uchun eslatmalar
- `RoleBasedStudentScopeResolver` MENTOR tarmog'i → `group_members` asosida (scope tashqarisi 404).
- Parent `children[].groupName` ni to'ldirish.
- Student deaktivatsiyada `parent_token:*:valid` keshini tozalash (hozir TTL 300 s).
- Frontend: refresh so'rovlarini bitta so'rovga yig'ish (parallel refresh → reuse detection).

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
