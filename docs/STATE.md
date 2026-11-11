# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-11 18:35 (haqiqiy vaqt)

> Hamkorlik (Boltavoy, Drive xatlari, taqsimot, agentlar) — **`docs/HAMKORLIK.md`**. Yangi sessiya ikkala faylni ham o'qiydi.

## ⚠️ SESSIYA TO'XTADI (2026-11-11 ~18:35, Claude limiti tugadi) — YANGI SESSIYA SHU YERDAN BOSHLAYDI
Limit tugashi oldidan ikki agent ishlab turgan edi. Ularning ishi diskda qolgan bo'lishi mumkin, lekin **commit qilinmagan**:
- **2.6b TAYYOR** (22:55): Playwright 23/23 yashil (eski 17 + 3d + guruhlar g1–g4 + mentor m1), `pnpm check` yashil. 18:50 dagi 11 ta yiqilish kod sababli emas edi: Tech Lead va agent bir vaqtda Playwright yurgizdi (port 3200, `test-results` umumiy). **Qoida: Playwright faqat bitta jarayonda yuriladi.** Parent exchange rate-limit 10/15 daqiqa/IP: to'liq suite 15 daqiqada ko'pi bilan 2 marta.
- **2.5b-2: TAYYOR va commit qilingan** (18:40; web 280 test, Playwright admin 13/13). Eslatma: Playwright'ni ikki agent parallel yurgizmasin (port, DB, test-results umumiy).

**12-noyabr: Boltavoy ishlamaydi (B17).** Uning ruxsati bilan Qo'ziboy `apps/api` va `packages/shared` dagi bug'larni (2.6b) hamda 2.7 review topilmalarini o'zi tuzatadi. **Har bir shunday o'zgarish `docs/boltavoy/QOZIBOY-OZGARISHLARI.md` ga yoziladi:** vaqt, hash, fayllar, sabab, oldin→keyin, testlar, API kontrakti (o'zgarsa `docs/12-api.md` ham). Kun oxirida Boltavoyga "sening sohangda shular o'zgardi" xati yoziladi. `main` ga merge faqat Boltavoy qaytgach, ikkala ega bilan.

**Ochiq kichik ishlar (2.7 dan oldin yoki uning ichida):**
- UI: `components/ui/ComboboxListbox` multiple rejimda tanlovdan keyin ochiq qoladi va pastdagi "Qo'shish" tugmasini yopib qo'yadi → rassom-dizayner (tashqariga bosilganda yopilsin yoki tugmani yopmasin).
- Test tozalash: dev bazada `e2e-` prefiksli arxivlangan guruhlar yig'ilyapti (API'da guruhni o'chirish yo'q). Taklif: `apps/api/test/support/web-e2e-users.ts` ga `delete-groups` buyrug'i (`deleteTestGroups` tayyor) + `apps/web/e2e/support/users-script.ts` da `deleteGroups`. Bu Boltavoy sohasi: qilinsa `docs/boltavoy/QOZIBOY-OZGARISHLARI.md` ga yoziladi.
- GitHub push: SSH orqali ishlaydi (HTTPS token o'chirilgan).

**2.7 TAYYOR (23:25):** review `docs/reviews/02-admin-asosi-review.md` — blocker yo'q; web 🟡 va docs 🟡 tuzatildi; check, build, api e2e 416/416, Playwright 23/23 yashil. **2-bosqich `main` ga qo'shishga TAYYOR — faqat ikkala ega ruxsati qoldi** (Boltavoy qaytgach). Boltavoy sohasida kod o'zgarmadi; (A) 🟢 tavsiyalar unga qoldirildi. **23:25:** 3.4a UI (rassom-dizayner, `docs/tasks/03-3.4a-ui.md`: ProgressBar, NodeStatusBadge, PathNode, PathSection, TreeList) — `feature/03-ilm-yoli` da. **23:20:** 3-modul rejasining frontend review'i tayyor (`docs/reviews/03-reja-frontend-izoh.md`): hozircha YO'Q, Boltavoyga Q-1…Q-9 savollari yuborildi, Tech Lead qarorlari (Q-10/Q-11) o'sha faylda. Web 🟢 polish commit qilindi (FilterField, a'zo variantlarida joriy guruh), `pnpm check` yashil; **to'liq Playwright merge'dan oldin qayta yurgiziladi**. **Push:** remote SSH ga o'tkazildi (`git@github.com:EshpolatovM/ICO-IT-Academy.git`), hammasi push qilingan (23:30).

**Yangi sessiya qiladigan ishlar:**
1. `git status` va `git diff --stat`: qaysi fayllar bor, ko'rib chiq.
2. Vazifa fayllaridagi tayyorlik mezoni bo'yicha nima chala qolganini aniqla. Chala bo'lsa, o'sha agentni o'sha vazifa fayli bilan qayta ishga tushir: "diskda chala ish bor, davom ettir".
3. `pnpm check` va `apps/web` ichida `pnpm exec playwright test` yashil bo'lgach commit qil (`git diff --cached` ni tekshirib), keyin push.
4. Drive'ni tekshir (Boltavoy xatlari), `docs/HAMKORLIK.md` ni yangila, Boltavoyga READY xatini yoz.
5. Keyin **2.7**: Qo'ziboyning Domlasi `apps/web` ni review qiladi, Boltavoyning Domlasi `apps/api` + `shared` ni. Keyin egadan "main ga qo'shaymi?" deb so'raladi.

| Maydon | Qiymat |
|---|---|
| Joriy modul | 2-bosqich: Admin asosi — foydalanuvchilar va guruhlar (reja: `docs/tasks/02-reja.md`) |
| Joriy bosqich | 2.1, 2.2, 2.4, **2.5a** tayyor; 2.3 — Boltavoyda (IN_PROGRESS); 2.5b/2.5c — 2.3 READY'dan keyin |
| Joriy git branch | `feature/03-ilm-yoli` (2026-11-11 23:25, **stacked**: `feature/02-admin-asosi` ustidan; 02 hali main'ga qo'shilmagan, egalar ruxsatini kutmoqda. 02 merge bo'lgach 03 `main` ustiga rebase qilinadi). 2-bosqich tuzatishlari kerak bo'lsa → `feature/02-admin-asosi` ga o'tib qilinadi |
| Ish rejimi | **To'liq avtonom** (Qo'ziboy; Boltavoy o'z egasi bilan sekin rejimda) (egasi 2026-11-11: savol berma, tasdiq kutma, Tech Lead o'zi qaror qiladi; faqat haqiqiy xavfli amallarda to'xtash). Har vazifadan keyin commit + STATE/PROGRESS; hisobot `docs/HISOBOT-*.md` |

## Hamkorlik (2026-11-11, egasi "ha")
- Ikkinchi Claude sessiyasi — **Boltavoy** (bu sessiya — Qo'ziboy). Back/front bo'linmasi yo'q; vazifani egasi + Qo'ziboy taqsimlaydi.
- Aloqa: Google Drive papkasidagi `XAT — ...md` fayllari (git'dagi AGENT_BUS ishlatilmaydi).
- GitHub remote: `origin` = `EshpolatovM/ICO-IT-Academy`. `feature/02-admin-asosi` push qilindi; ikkala sessiya shu bitta branch'da ishlaydi (`git pull --rebase`, force push yo'q, `main` ga merge faqat egasi ruxsati bilan).
- Taqsimot (egasi "ha", 2026-11-11 17:35): **Boltavoy → 2.3** (guruhlar API + mentor scope, `apps/api/**`); **Qo'ziboy → 2.5a** (admin: Studentlar, Mentorlar, Adminlar sahifalari, `apps/web/**`, vazifa `docs/tasks/02-2.5a-admin-users-ui.md`).
- Koordinatsiya: har qadamdan oldin/keyin Drive papkasi + `git fetch` tekshiriladi; IN_PROGRESS/READY xatlar; umumiy fayllar (shared, STATE, PROGRESS, root config, lockfile) oldidan ogohlantirish. Boltavoy o'z holatini `docs/boltavoy/HOLAT.md` da yuritadi.

## Egasining kelajakdagi rejasi (2026-11-11, HOZIR EMAS — egasi oxirida o'zi aytadi)
- Frontend route'lari va sahifa tarkibi keyin o'zgarishi mumkin. Masalan, **"Bugungi missiya" (`/today`) "Ilm yo'li" (`/path`) sahifasiga qo'shilishi** mumkin.
- **Shunga tayyor turish qoidasi (hozirdan):**
  - har bir bo'lim alohida feature komponent bo'lsin (masalan `features/daily-mission` → `<DailyMissionPanel/>`), u sahifaga bog'lanmasin va istalgan sahifaga qo'yila olsin;
  - `app/**/page.tsx` faqat yupqa o'ram bo'lsin: faqat feature komponentni chaqiradi, mantiq yo'q (hozir shunday);
  - yo'llar faqat konstantalarda (`*-paths.ts`) va menyu faqat `features/shell/config/nav.config.ts` da turadi, sahifalarda qattiq yozilgan URL bo'lmasin.
- O'zgartirish vaqti kelganda yangilanadiganlar: `nav.config.ts`, yo'l konstantalari, eski URL'dan redirect, Playwright testlari, `docs/03-sahifalar.md`.

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
**2.6a TAYYOR** (17:17): Playwright admin users yashil. Ochiq: CSV import bug (Boltavoyda); 3d test matni `docs/tasks/02-2.6a-playwright-admin-users.md` da, bug tuzatilgach qaytarib yurgiziladi.
**Eski yozuv:** 2.6a Playwright admin users (sinchkov-tester, `docs/tasks/02-2.6a-playwright-admin-users.md`). Tugagach: tekshirish → commit/push → HAMKORLIK + Boltavoyga READY. Boltavoyning 2.3 READY'i ≈ 21:30 (21:33 da tekshiriladi); erta push (shared + docs/12) bo'lsa 2.5b darhol boshlanadi.
**2.4b TAYYOR** (17:45): Checkbox, Combobox (single/multiple, o'z WAI-ARIA yechimi, `value` = option obyekti — Tech Lead tasdiqladi), StatCard, PageHeader; `joinIds` umumiylashtirildi. Web 43 fayl yashil. **2.5e** (chaqqon-tuzatkich): admin-users sahifalaridagi takroriy sarlavhalarni PageHeader'ga o'tkazish. 3-bosqich qoralama rejasi: `docs/tasks/03-reja.md`.
**2.5b TAYYOR (kod):** `/admin/groups`, `/admin/groups/[id]` (mentor biriktirish, a'zolar, arxivlash), 37 test, `pnpm check` yashil. Haqiqiy API bilan sinov 2.3 READY'dan keyin (ro'yxat `docs/tasks/02-2.5b-admin-groups-ui.md` oxirida).
**2.5f + 2.4c TAYYOR:** umumiy kod `@/lib/hooks`, `@/lib/format`, `@/lib/api` (`withQuery`, `itemPath`, `errorMessage`), `@/components/shared` (QueryErrorAlert, ListSearchField, StatusFilterSelect, ListPagination, UserStatusBadge) — yangi feature'lar shulardan foydalanadi. `DateInput` (components/ui). Web jscpd klonlari 0.
**2.5c TAYYOR** (18:30): `/mentor/groups`, `/mentor/groups/[id]`, `/mentor/students/[id]` (parol tiklash, ota-ona tokenlari), umumiy `components/shared` (ConfirmSecretAction, QueryView, QueryLoadError, HeadedTable, SecretResultDialog, ResetPasswordAction), `lib/hooks/useSecretMutation`. check + build yashil, web 269 test. **Hozir parallel:** 2.6b Playwright (guruh + mentor, jonli 2.3 API bilan; 3d test qaytariladi) va 2.5b-2. **Eslatma:** `7f79fc2` tasodifan ko'chirilgan fayllarning yangi nusxalarini olib ketgan edi; keyingi commitda eski yo'llar o'chirildi. Commitdan oldin `git diff --cached` tekshiriladi. **Keyin:** 2.5b-2 (student guruh filtri va tanlovi, guruh formasiga DateInput, CSV klient limiti) — 2.5c tugagach, chunki admin-users fayllari to'qnashadi.
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
