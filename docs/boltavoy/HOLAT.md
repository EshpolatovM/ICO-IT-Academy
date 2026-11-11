# HOLAT (Boltavoy, 2026-11-11)

## 1. Sessiya boshida o'qish tartibi
1. `CLAUDE.md`
2. `docs/STATE.md` (Qo'ziboy yuritadi)
3. `docs/HAMKORLIK.md` (Qo'ziboy yuritadi; pull qilinmaguncha lokalda bo'lmasligi mumkin)
4. Shu fayl (`docs/boltavoy/HOLAT.md`)
5. `docs/PROGRESS.md` ning oxirgi yozuvlari

Keyin: Drive papkasi `ICO_IT_Academy_Bus` (id `1NFba5lKcrnqpOJJM_cL8Xf5CUXgDAavW`) dagi yangi xatlarni ko'rish va `git fetch`.

## 2. Kim kim
- **Boltavoy** — shu sessiya, egamiz Asadbek kompyuteridagi Tech Lead.
- **Qo'ziboy** — hamkor sessiya, do'stning kompyuterida. Egamiz ba'zan "Teshaboy" deydi.
- Kanal: Drive papkasidagi alohida "XAT — ..." md fayllari. Faqat yangi fayl yaratiladi, mavjudlari tahrirlanmaydi. Git'dagi AGENT_BUS/PROJECT_STATE fayllari ishlatilmaydi.

## 3. Egamizning qarorlari (2026-11-11)
- Boltavoy qo'lda kod yozmaydi va o'zi hech narsa qilmaydi; har bir vazifa agentlarga beriladi. Egaga faqat qisqa, o'zbekcha, samimiy hisobot.
- Qo'ziboy vazifalari faqat ega roziligi bilan bajariladi. Ega joriy vazifalarni bajarishni aytgan.
- Ega tasdiqlagan: pnpm o'rnatish va `pnpm install`; 2.3 ustida ishlash; Qo'ziboy bilan kelishib takroriy agentlarni o'chirish.
- Har bir ishdan keyin Drive tekshiriladi va Qo'ziboyga hisobot xati yoziladi ("dosim" deb murojaat).

### Yangi qarorlar (2026-11-11, ~17:30)
- shared + docs ni erta push qilish — HA.
- Review tuzatishlarini parallel qilish — HA.
- M4: mentor `GET /admin/paths` ni faqat o'qish uchun ko'ra oladi.
- "Qo'ziboy bilan kelishib, shoshilmasdan ishlanglar."

### Tech Lead qarori
- CSV import paytida guruh arxivlangan bo'lsa → 409 `GROUP_ARCHIVED` (`details.groups`), hech kim yaratilmaydi.

## 4. Hamkorlik qoidalari (kelishilgan)
- Bitta umumiy branch: `feature/02-admin-asosi`, GitHub `origin` (`EshpolatovM/ICO-IT-Academy`).
- Har push oldidan `git pull --rebase`. Force push yo'q. `main` ga merge faqat egalar ruxsati bilan.
- Har qadam uchun IN_PROGRESS / READY xati, xatlarda commit hash'lari.
- Umumiy fayllarga (`packages/shared/**`, `docs/STATE.md`, root config'lar, `pnpm-lock.yaml`) tegishdan oldin Qo'ziboy ogohlantiriladi.
- `docs/STATE.md` va `docs/HAMKORLIK.md` — Qo'ziboyniki. Biz `docs/boltavoy/HOLAT.md` ni yuritamiz va `docs/PROGRESS.md` oxiriga faqat qo'shamiz.
- Ish rejimi: sekin va nazorat ostida.
- **Kelishuv (Qo'ziboy (20), roziman):** shared'ga enum yoki kod qo'shilsa, unga bog'liq barcha `Record` map'lar bilan birga push qilinadi. Har qanday qisman/erta push oldidan o'sha commit toza worktree'da tekshiriladi (`pnpm typecheck`, iloji bo'lsa `pnpm check`). Sabab: `85345ba` branch'da typecheck'ni sindirdi, `af3a56b` da tuzatildi.

## 5. Agentlar (9 ta, repo `.claude/agents/`, kelishilgan)
| Laqab | Fayl | Vazifa |
|---|---|---|
| Bazarboy | usta-baza | Prisma, migratsiya, seed |
| Backendbek | oga-backend | NestJS API |
| Rassomjon | rassom-dizayner | Token'lar, `components/ui` |
| Frontendcha | birchka-frontend | Next.js sahifalar |
| Sinchkovbek | sinchkov-tester | Testlar + env sozlash va tekshiruvlar |
| Domla | domla-reviewer | Review (faqat o'qiydi) |
| Pushbek | pushbek-git | Commit/push |
| Xatboy | hisobotchi-xatboy | Xatlar, holat fayli |
| Tuzatvoy | chaqqon-tuzatkich | Kichik tuzatishlar |

- 9 ta repo agenti (Pushbek, Xatboy, Tuzatvoy ham) endi mavjud, qayta ishga tushirish shart emas. Parallel ishlash qoidasi CLAUDE.md da.
- Xatboyga vazifa berilganda promptda xat yo'nalishi "Boltavoy dan Qo'ziboyga" va holat fayli `docs/boltavoy/HOLAT.md` ko'rsatiladi.
- O'zimizning 3 ta shaxsiy agent (pochtachi-ping, git-pushbek, devops-monitorjon) o'chirildi.
- Xavfsizlik ("Qalqonbek") va real-time ("Jonlibek") agentlari 7-moduldan keyin qayta ko'riladi.

## 6. Taqsimot
- **Boltavoy:** 2.3 — guruhlar API + mentor scope (`docs/tasks/02-2.3-groups-scope.md`).
- **Qo'ziboy:** 2.5a READY (`184be06`); 2.5d + 2.6a ustida ishladi (2.6a READY, Q15). 2.5b va 2.5c — 2.3 READY bo'lgach.

## 7. Joriy holat va keyingi qadam
- **2.3: kod + review tuzatishlari DONE, barcha testlar yashil** (hali commit qilinmagan).
  - unit 464; e2e 416 (16 suite); `pnpm check`, `format:check`, `build` — yashil.
  - Domla qayta review: B1, M2–M6, CSV, T1, T3–T5, T7, T9 yopildi. Qolgan Y1 (import lock) va Y2 (INSERT tartibi) ni Backendbek tuzatdi. R1 va R4 ham bajarildi.
- 2.3 ga qo'shimcha (Qo'ziboy taklifi, qabul qilingan): `STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES` va `STUDENT_IMPORT_DEFAULT_MAX_ROWS` konstantalarini `@lms/shared` ga ko'chirish.
- **Push qilingan commitlarimiz:** `85345ba` (shared + docs/12, erta push); `af3a56b` (GROUP_ARCHIVED map hotfix).
- Lokal HEAD hali `85345ba`; remote oldinda (`11a940a`, `af3a56b`, balki yana boshqalar).
- Lokal `main` da push qilinmagan `b8c747f` (eski AGENT_BUS INIT bloki) bor — branch'ga ham, `main` ga ham KETMASIN.
- Muhit: pnpm 10.34.9 `~/.local/bin` da (`export PATH=$HOME/.local/bin:$PATH`).

### `pnpm check` (2.3 dan oldin, tarix)
- EXIT 0 — lint, typecheck, jscpd (2 klon, 0.09% < 3%), depcruise (0 buzilish, 468 modul), api unit 380/380 (66 suite), web 144/144 (29 fayl).

### Keyingi aniq qadamlar
1. Commit (kod+testlar va docs alohida).
2. `git pull --rebase` — `docs/PROGRESS.md` da konflikt kutiladi: ikkala tomon saqlanadi, biznikilar oxirida.
3. Toza HEAD'da `pnpm check` + e2e.
4. Push.
5. Qo'ziboyga READY xati: shared export nomlari, endpointlar (§ bilan), `groupId`/`group` maydoni, pagination, 2.6 ning qolgan qismlari, shared test fayllari.
6. Egaga hisobot.

### Ochiq tavsiyalar (keyinroq)
- R3 (Redis `commandTimeout`), R5 (modullararo where/select fragmentlari), R6 (EVALSHA + haqiqiy Redis Lua testi), T2, T6.
- Xato xabarlarini o'zbekchalashtirish — 2.3 dan keyin alohida vazifa.

## 2-bosqich holati
| # | Vazifa | Holat |
|---|---|---|
| 2.1 | Baza: learning_paths, groups, group_members, seed | DONE |
| 2.2 | Foydalanuvchilar API + CSV import | DONE (`186107f`, `aa1f773`) |
| 2.3 | Guruhlar API, mentor scope | Kod+review DONE, testlar yashil; commit/push kutilmoqda (Boltavoy; shared `85345ba`, `af3a56b`) |
| 2.4 | UI komponentlar | DONE |
| 2.5a | Admin: studentlar/mentorlar/adminlar sahifalari | READY (`184be06`, Qo'ziboy) |
| 2.5b/c | Admin guruhlar, mentor sahifalari | TODO (2.3 kerak, Qo'ziboy) |
| 2.6a/b | API e2e+RBAC, Playwright | 2.6a READY (Qo'ziboy, Q15); qolgani TODO |
| 2.7 | Review → merge | TODO |

## 8. Ochiq savollar
- S-65 (jamoa/muddat/MVP).
- Tasdiqlanmagan docs nomuvofiqliklari: `KUZATUVLAR.md` ga qarang.

## 9. Xatlar jurnali (UTC, 2026-11-11)
| Vaqt | Yo'nalish | Mazmun |
|---|---|---|
| 11:02 | B→T (1) | tanishuv |
| 11:08 | Q→B (1) | tanishuv + o'rganish vazifasi |
| 11:10 | Q→B (2) | bo'linma yo'q, docs/boltavoy, agentlar |
| 11:18 | B→Q (1) | salom + xulosa + laqablar |
| 11:20 | B→Q (2) | keyingi vazifa savoli |
| 11:21 | Q→B (3) | kanal/rejim/branch/git qoidalari |
| 11:24 | B→Q (3) | pnpm check yashil |
| 11:29 | Q→B (4) | 2.3 Boltavoyga, 2.5a Qo'ziboyga |
| 11:31 | B→Q (4) | 2.3 IN_PROGRESS + b8c747f izohi |
| 11:38 | Q→B (5) | yangi agentlar 4fa31d1 |
| 11:40 | Q→B (6) | agent matnlari |
| 11:42 | B→Q (5) | agentlar muhokamasi |
| 11:45 | Q→B (7) | 9 agent kelishuvi f4c0ae9 |
| 11:46 | Q→B (8) | agentlar yetarlimi? |
| 11:49 | Q→B (9) | 2.5a READY 184be06, import konstantalari taklifi |
| ~11:52 | B→Q (6) | agentlarga rozilik, import konstantalari qabul |
| 11:53 | Q→B (10) | hammasini faylga saqlash, HAMKORLIK.md |
| 11:58 | Q→B (11) | shoshilma, mustahkam qil |
| ~12:00 | B→Q (7) | 2.3 holati va muddat |
| 12:02 | Q→B (12) | muddat qabul, soat |
| 12:05 | Q→B (13) | men ham davom etyapman (2.5d+2.6a) |
| 12:09 | B→Q (8) | roziman, nima qilyapsan |
| 12:12 | Q→B (14) | reja va test ma'lumotlari |
| 12:15 | B→Q (9) | reja qabul |
| 12:17 | Q→B (15) | 2.6a READY + CSV bug |
| 12:20 | Q→B (16) | egalar uchun oddiy hisobot |
| 12:23 | Q→B (17) | SHOSHILINCH |
| 12:26 | B→Q (10) | shoshilinch javob |
| 12:28 | Q→B (18) | qarorlar, boshla |
| 12:32 | Q→B (19) | bo'sh turmaylik |
| 12:39 | B→Q (11) | erta push 85345ba |
| 12:44 | Q→B (20) | 85345ba branchni sindirdi |
| 12:53 | B→Q (12) | typecheck tuzatildi af3a56b |
