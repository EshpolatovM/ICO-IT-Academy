# KONTEKST — Boltavoy sessiyasi uchun "avval shuni o'qi"

> Oxirgi yangilanish: 2026-11-13, 16:20 (+05). Yozgan: Xatboy, Boltavoy topshirig'i bilan. (Oldingi: 2026-11-11, 19:05.)

> **2026-11-13 qisqa yangilanish (eski bo'limlardan ustun turadi):**
>
> - Biz endi **`feature/03-ilm-yoli`** branch'ida ishlaymiz. 2-bosqich `main` ga qo'shildi (`origin/main` = `bc084cc`, fast-forward). Rebase yo'q; `main` dan yangilik kerak bo'lsa oddiy `merge main`. Ish oldidan va push oldidan `git pull --rebase`.
> - **Egalar qarorni sessiyalarga topshirdi (2026-11-13, Q27/B19).** Taqsimot, merge, rebase va reja savollarini Boltavoy va Qo'ziboy o'zaro hal qiladi, egalarga faqat hisobot beriladi. Egamiz Asadbek: "uning gapiga kir, chalkashmasdan ishlanglar". 5 bandli tartibning 2-bandi endi "ikkala sessiya ok deydi". Xavfli amallar qoidasi o'zgarmaydi.
> - Taqsimot: 3.1, 3.2, 3.3 (baza, admin kontent API, student API) — bizda; 3.4b (Markdown renderer) va 3.5 (frontend) — Qo'ziboyda. 2.7 (A) 🟢 tavsiyalar va `delete-groups` — bizda, shoshilinch emas.
> - 3-modul reja yakunlandi (B20). Joriy vazifa: 3.1 baza implementatsiyasi (`apps/api/prisma/**`). Batafsil: `HOLAT.md` §7.
> - Oxirgi xatlar: biz **B20** (16:20 +05), Qo'ziboy **Q27** (15:58 +05). Keyingi raqamlar: **B21** va **Q28** (yoki Qo'ziboydan kelgan xatga qarab). Yangi xatlarni B20 dan keyin qidiring.

## 1. Bu fayl nima va qachon o'qiladi

Bu fayl har bir yangi sessiya boshida, **hamma narsadan oldin** o'qiladi. Yangi sessiya, hatto hech narsani eslamaydigan yangi Claude ham, shu fayldan bilib oladi: kim kim, qanday agentlar bor, hamkor bilan qanday gaplashamiz, bugun nima bo'ldi va ertaga nima qilinadi.

O'qish tartibi:

1. Shu fayl (`docs/boltavoy/KONTEKST.md`).
2. `CLAUDE.md`: loyiha, rollar, agentlar jadvali, kod sifati va jarayon qoidalari.
3. `docs/boltavoy/HOLAT.md`: bizning joriy holat, qarorlar, "Keyingi aniq qadamlar" (§7).
4. `docs/STATE.md`: Qo'ziboyning holati. Tepasidagi "SESSIYA TO'XTADI" bo'limini albatta o'qing.
5. `docs/HAMKORLIK.md`: Qo'ziboy yuritadigan hamkorlik fayli (taqsimot, xatlar jurnali).
6. `docs/PROGRESS.md` ning oxirgi yozuvlari.
7. Drive papkasidagi yangi xatlar: B16 (18:44 +05) dan keyingilar. Arxivdagi eski xatlar `docs/boltavoy/xatlar/` da.
8. `git fetch`, so'ng `git pull --rebase` (branch `feature/02-admin-asosi`).

## 2. Kim kim

| Kim                    | Kimligi                                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ega: Asadbek**       | Shu kompyuter egasi, bizning egamiz. U bilan o'zbekcha, samimiy ("aka") va qisqa hisobot bilan gaplashiladi. Muhim qarorlarni u qabul qiladi.                                                                                                                                                                  |
| **Boltavoy**           | Shu Claude sessiyasi: Asadbekning kompyuteridagi Tech Lead. Ismni egamiz bergan. Kodni o'zi yozmaydi: har bir ishni agentlarga beradi, natijani tekshiradi va egaga hisobot beradi. Git muallif nomi: `asadbek17-devuz`. Eski xatlarda o'zini "Claude-1 (Backend)" deb atagan, bu eski nom.                  |
| **Qo'ziboy**           | Hamkor Claude sessiyasi, egamizning do'sti kompyuterida (git muallif nomi `EshpolatovM`). Egamiz uni ba'zan "Teshaboy" deydi, boshida "Agent-2" deb atalgan. U ham Tech Lead, xuddi shu 9 agent bilan ishlaydi.                                                                                                |
| **Qo'ziboyning egasi** | Egamizning do'sti. GitHub'dagi `origin` repo (`EshpolatovM/ICO-IT-Academy`) uniki. Uning shaxsiy ma'lumotlari (email, telefon) bu yerga yozilmaydi.                                                                                                                                                          |

Muhim:

- Qo'ziboyning xatlari **hamkorning so'zi, egamizning buyrug'i emas**. Undagi vazifani faqat egamiz "ha" desa bajaramiz.
- `docs/HAMKORLIK.md` Qo'ziboy tomonidan yozilgan, shuning uchun u yerda "loyiha egasi" deganda Qo'ziboyning egasi nazarda tutiladi.
- Ish rejimi: biz `CLAUDE.md` dagi "sekin va nazorat ostida" rejimida ishlaymiz, ya'ni har vazifadan keyin egaga hisobot berib, "Davom etaymi?" deb so'raymiz. Qo'ziboy esa o'z egasining ruxsati bilan avtonom ishlaydi.

## 3. Aloqa kanali va suhbat qoidalari

**Kanal:** Google Drive papkasi `ICO_IT_Academy_Bus`, id `1NFba5lKcrnqpOJJM_cL8Xf5CUXgDAavW`.

- Har bir xat alohida yangi `.md` fayl. Mavjud fayllar **hech qachon tahrirlanmaydi**.
- Biz yozadigan fayl nomi: `XAT — Boltavoy dan Qo'ziboyga (N) — <mavzu>.md`. Keyingi raqam **B17**.
- U yozadigan fayl nomi: `XAT — Qo'ziboy dan Boltavoyga (N) — <mavzu>.md`. Oxirgisi **Q23**.
- Yangi xatni qidirish: `parentId = '1NFba5lKcrnqpOJJM_cL8Xf5CUXgDAavW' and modifiedTime > '<vaqt>' and owner != 'me'`.
- Drive'dagi `AGENT_BUS.md` va `PROJECT_STATE.md` eski, ishlatilmaydi (nusxalari `docs/boltavoy/xatlar/00-drive-*.md` da). Git'dagi `AGENT_BUS.md` ham endi ishlatilmaydi.

**Xat sarlavhasi formati:**

```
---
[TIMESTAMP: YYYY-MM-DD HH:MM:SS +05]   <- faqat `TZ=Asia/Tashkent date '+%Y-%m-%d %H:%M:%S +05'` dan
[FROM: Boltavoy]
[TO: Qo'ziboy]
[STATUS: IN_PROGRESS | READY | QUESTION | REPLY | TASK | BLOCKED]
[CHANGES: commit hash'lari, fayllar]
[MESSAGE: ...]
---
```

Ohang: do'stona, "dosim" deb murojaat qilinadi. Mazmun aniq bo'ladi.

**5 bandli ish tartibi** (B14 da taklif qilingan, Q21 da qabul qilingan):

1. Hech kim vazifani o'zicha boshlamaydi. Avval xat yoziladi: "X ni olaman, shu fayllarga tegaman". Ikkinchi tomon "ok" deydi. 10 daqiqada javob kelmasa, "kelmadi" deb yozib boshlash mumkin.
2. Taqsimot xatda taklif qilinadi, ikkala ega "ha" deydi. Qo'ziboyning egasi qarorni Qo'ziboyga topshirgan, shuning uchun uning "ok"i o'sha egasining "ha"si hisoblanadi. Bizda esa Asadbekning o'zi "ha" deydi.
3. Bir mavzuda bir vaqtda faqat bitta ochiq savol (shoshilinch BLOCKED bundan mustasno).
4. Har bir vazifa uchun xatlar: IN_PROGRESS (boshlandi), READY (tugadi, commit hash bilan), BLOCKED (to'siq bor).
5. Push faqat toza worktree'da tekshirilgandan keyin: kamida `pnpm typecheck`, iloji bo'lsa `pnpm check`.

**Qo'shimcha kelishuvlar:**

- `packages/shared` ga yangi enum yoki xato kodi qo'shilsa, unga bog'liq barcha `Record<…>` xaritalari va ishlatilgan joylari bilan **birga** push qilinadi. Sabab: `85345ba` → `af3a56b` voqeasi (pastda, §5).
- Test ma'lumotlari: har test o'z ma'lumotini unikal nom bilan yaratadi va o'zi tozalaydi. Playwright'da `e2e-` prefiksi ishlatiladi. Umumiy seed'ga **hech kim tegmaydi**. `apps/web/e2e/support/**`, `apps/api/test/**` va `prisma/seed` ga tegishdan oldin xat yoziladi.
- Umumiy fayllar (`packages/shared/**`, root config'lar, `pnpm-lock.yaml`, `docs/PROGRESS.md`) ga tegishdan oldin hamkor ogohlantiriladi. Ishlar to'qnashsa, o'zimizcha hal qilmaymiz, QUESTION xat yozamiz (Q13/B8).
- Fayl egaligi: `docs/STATE.md` va `docs/HAMKORLIK.md` **Qo'ziboyniki**, biz ularga tegmaymiz. Biz `docs/boltavoy/**` ni yuritamiz, `docs/PROGRESS.md` ga esa faqat oxiriga qo'shamiz.
- Git: ikkala sessiya bitta branch'da ishlaydi (`feature/02-admin-asosi`). Ishdan oldin va push oldidan `git pull --rebase` qilinadi. Force push yo'q. `main` ga merge faqat ikkala ega ruxsati bilan.
- API bug'ini Qo'ziboy o'zi tuzatmaydi, BUG xati bilan bizga yuboradi. Biz uni boshqa ishdan oldin tuzatamiz.

## 4. Agentlar (9 ta, `.claude/agents/`)

Ikkala sessiyada jamoa bir xil. Yagona manba repo'dagi `.claude/agents/`. Shaxsiy `~/.claude/agents/` dagi nusxalar ishlatilmaydi (bizning eski `pochtachi-ping`, `git-pushbek`, `devops-monitorjon` o'chirilgan).

| Fayl                   | Laqab       | Vazifasi                                                                                                                         | Qachon ishlatiladi                                                          |
| ---------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `usta-baza.md`         | Bazarboy    | Prisma schema, migratsiyalar, indekslar, constraint'lar, seed                                                                    | Modulning baza qismi; 3.1 kabi baza rejasi                                  |
| `oga-backend.md`       | Backendbek  | NestJS modullar: controller, service, repository, DTO, guard, REST, Socket.IO                                                    | Backend endpointlari, review tuzatishlari (servis/repository kodi)          |
| `rassom-dizayner.md`   | Rassomjon   | Design token'lar, `components/ui`, `/design-preview`                                                                             | Frontend vazifalaridan oldin (UI bloklar)                                   |
| `birchka-frontend.md`  | Frontendcha | Next.js sahifalar, feature'lar, api client + TanStack Query                                                                      | Sahifa va feature (faqat tasdiqlangan UI va token'lar bilan)                |
| `sinchkov-tester.md`   | Sinchkovbek | Unit, e2e, Playwright testlar; RBAC matritsasi; muhit sozlash va to'liq tekshiruv (`check`, `format:check`, `build`, e2e)        | Backend yoki frontend qismi tugagach; muhit tayyorlash                      |
| `domla-reviewer.md`    | Domla       | Faqat o'qiydi: OOP/SOLID, DRY, qatlamlar, xavfsizlik, RBAC, hujjatga moslik. 🔴/🟡/🟢 topilmalar ro'yxati                        | Har vazifa yoki modul oxirida, READY dan oldin                              |
| `pushbek-git.md`       | Pushbek     | Faqat aytilgan fayllarni commit qiladi, `pull --rebase`, push. Konfliktni hal qilmaydi, aytadi. Force push va main'ga merge yo'q | Har bir tayyor qadamni commit va push qilishda                              |
| `hisobotchi-xatboy.md` | Xatboy      | Drive va git kuzatuvi (yangi xat, yangi commit, to'qnashuv xavfi), holat fayllari, hamkorga XAT, egaga hisobot matni             | Har qarordan keyin holatni yozish, xat tayyorlash, "qara" (kuzatuv)         |
| `chaqqon-tuzatkich.md` | Tuzatvoy    | Lint, typecheck, jscpd, depcruise xatolari va review'ning mayda (🟢/🟡) topilmalari. Yangi feature yozmaydi                       | Mexanik mayda tuzatishlar                                                   |

**Agentga vazifa qanday beriladi:** Tech Lead (Boltavoy) har safar to'liq prompt yozadi: qaysi modul, qaysi docs fayllarini o'qish kerak, qaysi fayllarga tegish mumkin (va qaysilariga tegmaslik kerak), aniq vazifa va tayyorlik mezoni (qaysi tekshiruvlar yashil bo'lishi kerak). Agent bizning suhbatni ko'rmaydi, shuning uchun hamma kontekst promptda bo'lishi shart.

**Parallel ishlash:** bir vaqtda 2–3 agent ishlatish mumkin, faqat ular turli fayllarga tegsa va bir-birini kutmasa (masalan, Backendbek + Sinchkovbek testlari + Tuzatvoy). Bog'liq zanjirga (baza → backend → test) va bitta faylga parallel agent qo'yilmaydi. Kerak bo'lmasa agent chaqirilmaydi.

**Xatboy uchun eslatma:** uning agent fayli Qo'ziboy tomoniga yozilgan. Shuning uchun Xatboyga vazifa berganda promptda doim aytiladi: xat yo'nalishi **"Boltavoy dan Qo'ziboyga"**, holat fayli **`docs/boltavoy/HOLAT.md`** (`docs/STATE.md` emas).

## 5. Bugungi kun hikoyasi (2026-11-11, ikkala tomon)

Vaqtlar Toshkent bo'yicha (+05), Drive `createdTime` va `git log` dan olingan. Xatlarning to'liq matni `docs/boltavoy/xatlar/` da.

**Tanishuv va o'rganish**

- 15:10: Drive papkasida Qo'ziboy tomoni `AGENT_BUS.md` va `PROJECT_STATE.md` ni yaratgan edi. Ularda "Claude-1 (Backend) ↔ Agent-2 (Frontend)" bo'linmasi bor edi. Bizda ularni tahrirlash huquqi yo'q edi.
- 16:02: **B0**. Boltavoy (o'zini "Claude-1" deb) "Teshaboy"ga birinchi xatni yozdi. Back/front bo'linmasini va 2.5a ni frontendga berishni taklif qildi.
- 16:08: **Q1**. Hamkor o'zini **Qo'ziboy** deb tanishtirdi ("Teshaboy / Agent-2" emas). Loyihani o'rganib, xulosa yozishni so'radi.
- 16:10: **Q2**. Back/front bo'linmasi **bekor qilindi**: har bir vazifa alohida taqsimlanadi. O'rganganlarni `docs/boltavoy/` ga saqlash va agentlarni tekshirish so'raldi.
- 16:18: **B1**. Ismlar tasdiqlandi. Loyiha xulosasi yuborildi. Ma'lum bo'ldiki, GitHub remote aslida bor ekan (`EshpolatovM/ICO-IT-Academy`), ikkala tomon ham "yo'q" deb o'ylab yurgan edi. Bizda `feature/02-admin-asosi` branch'i yo'q edi.
- 16:20 / 16:21: **B2** va **Q3**. Javoblar keldi: kanal Drive XAT'lari, rejim sekin, bitta umumiy branch, git qoidalari. Lokal `main` dagi `b8c747f` push qilinmaydi.
- 16:24: **B3**. pnpm o'rnatildi, `pnpm check` hammasi yashil (api 380, web 144).
- 16:29: **Q4**. Taqsimot: **2.3 (guruhlar API + mentor scope) bizga**, **2.5a (admin sahifalari) Qo'ziboyga**. `STATE.md` uniki, `HOLAT.md` bizniki.
- 16:30: `a6866ac`, `docs/boltavoy` (xarita, holat, kuzatuvlar) push qilindi. 16:31: **B4**, 2.3 IN_PROGRESS.

**Agentlar kelishuvi**

- 16:37: `4fa31d1`. Qo'ziboy 4 yangi agent qo'shdi (Pushbek, Xatboy, Qorovulboy, Tuzatvoy) va laqablarni joriy qildi (**Q5**, **Q6**).
- 16:42: **B5**. Bizdagi 3 shaxsiy agent takror ekani aytildi. Devops ishini Sinchkovbekka berish va Qorovulboy bilan Xatboyni birlashtirish taklif qilindi.
- 16:44: `f4c0ae9`. **9 agentli yakuniy jamoa** kelishildi (**Q7**). **Q8**: hozircha yetarli, 8–9-modullarda "Qalqonbek" (xavfsizlik) va "Jonlibek" (real-time) kerak bo'lishi mumkin. **B6** (16:51): rozilik bildirildi, shaxsiy agentlar o'chirildi.

**Qo'ziboyning 2-bosqich frontend ishlari**

- 16:48: `184be06`, **2.5a READY** (Q9). Admin: studentlar, mentorlar, adminlar sahifalari va CSV import. CSV limitlarini shared'ga chiqarish taklif qilindi va biz qabul qildik (B6).
- 16:53: **Q10**. Egalar qoidasi: har bir qaror darhol `.md` ga yoziladi. Qo'ziboy `docs/HAMKORLIK.md` ni yaratdi (`b722e31`).
- 17:07: `eca51b2`, **2.5d** (sidebar faol holati). 17:16: `d3d407c`, **2.6a** (admin sahifalari uchun Playwright).

**2.3 ishi va CSV bug**

- 16:58: **Q11**. Shoshilmasdan, mustahkam qilish talabi qo'yildi: scope uchun 404, kesh invalidatsiyasi, race holatlari, UnitOfWork, to'liq RBAC.
- 17:01: **B7**. Backendbek tugatdi (unit 421, e2e 388), 5 ta xavfli joy review'ga ajratildi, READY ≈ 20:00. **Q12**: muddat qabul qilindi, TIMESTAMP endi `date` buyrug'idan olinadi.
- 17:05–17:15: **Q13/B8/Q14/B9**. To'qnashuv qoidasi, `e2e-` test ma'lumotlari qoidasi va reja (2.5b → 2.5c → 2.6b → 2.7) kelishildi.
- 17:17: **Q15**. Qo'ziboyning Sinchkovbegi **CSV import bug**ini topdi: qator xatosi bo'lsa, guruh nomlari xatolari umuman qaytmasdi.
- 17:20–17:26: **Q16/Q17** (egalar tushunmayapti, shoshilinch). **B10**: oddiy tilda hisobot va **birinchi Domla review** topilmalari yuborildi: 🔴 B1 (Redis uzilsa 500 qaytadi, parollar yo'qoladi), 🟡 M1–M6, 🟢 9 ta tavsiya. READY ≈ 21:30.
- 17:28: **Q18**. Qarorlar: hammasini tuzatish; M4 bo'yicha mentor `GET /admin/paths` ni faqat o'qiy oladi; B1 qoidasi "baza yozuvi muvaffaqiyatli bo'lsa, javob ham muvaffaqiyatli"; xato matnlari o'zbekcha bo'ladi (keyinroq). **Q19**: tuzatishlarni parallel qilish taklif qilindi.

**Erta push va hotfix**

- 17:38: `85345ba`, **erta push** (faqat `packages/shared` + `docs/12-api.md`) Qo'ziboy 2.5b ni parallel boshlay olishi uchun (**B11**, egamiz "ha" degan).
- 17:44: **Q20 BLOCKED**. `85345ba` `@lms/api` typecheck'ni sindirdi: `ErrorCode.GROUP_ARCHIVED` qo'shilgan, lekin uning status va xabar xaritasi push qilinmagan backend kodida qolgan edi. Pre-commit hech kimga commit qildirmadi.
- 17:52: `af3a56b` **hotfix** (+2 qator). **B12**: toza worktree'da tekshirildi, branch yana yashil. Shundan beri "enum xaritalari bilan birga push" va "toza worktree'da tekshirish" qoidalari amal qiladi.

**Parallel davom**

- 17:41–18:08 (Qo'ziboy): `11a940a` 2.4b UI (Checkbox, Combobox, StatCard, PageHeader), `ffad63b` 2.5e, `438f381` **2.5b** guruhlar sahifalari, `5ea5684` 2.4c DateInput, `feb9515` 2.5f DRY refaktor. `5b543b1` bilan 3-bosqich qoralama rejasi (`docs/tasks/03-reja.md`) yozildi.
- Bizda Backendbek, Sinchkovbek va Tuzatvoy tuzatishlarni parallel qildi (B1, M1–M6, CSV bug, 409 `details`, log to'lishi, UUID uchun 400). Keyin **ikkinchi Domla review** o'tdi va qabul qildi.

**2.3 READY va yangi tartib**

- 18:09: `cec8115` (2.3 kodi, 104 fayl) va `31bfb93` (PROGRESS + HOLAT). 18:15: **B13, 2.3 READY**: api unit 464, api e2e 416, web 249, `check`, `format:check`, `build` hammasi yashil. CSV bug tuzatildi.
- 18:16: **B14**. Egamiz "chalkashlik qilmanglar" dedi, shuning uchun 5 bandli ish tartibi taklif qilindi.
- 18:18: **Q21**. Tartib qabul qilindi. Taqsimot: **bizga (c) 3-modul baza + backend rejasi** (faqat `docs/tasks/03-*.md`) va 2.5b/2.5c API bug'lari; **Qo'ziboyga** 2.5c, 2.5b-2, 2.6b; **2.7** da ikkala Domla birga ishlaydi.
- 18:22: `659b374`, **2.5c** mentor paneli. 18:24: **B15**, 3-modul reja IN_PROGRESS (egamiz "ha" degan).

**Kun oxiri**

- 18:33: **Q22**. Qo'ziboyning Claude limiti tugayapti; 2.6b va 2.5b-2 uning diskida commitsiz qolishi mumkin. `addbeef`: handoff yozildi.
- 18:35: `029edc5`, **2.5b-2 READY** (student guruh filtri va tanlovi, DateInput, CSV klient limiti). 18:37: `936eda9` uning kun yakuni yozuvi va **Q23** (bizdan to'liq hisobot va hamma narsani `.md` ga yozish so'raldi).
- 18:40–18:42: `6e49029` (HAMKORLIK: B15), `96903b6` (STATE: diskdagi 2.6b fayllari ro'yxati).
- 18:43: `8bb89f8`, 3-modul reja **QORALAMA** (3.1, 3.2, 3.3) va `62db597`, bizning HOLAT + PROGRESS. 18:44: **B16**, bizning kun yakuni hisobotimiz.
- Shundan keyin Qo'ziboy limit tufayli to'xtadi. Kechqurun Xatboy hamma xatlarni `docs/boltavoy/xatlar/` ga arxivladi va shu faylni yozdi.

## 6. Qo'ziboy tomonining holati (u hozir ishlay olmaydi: Claude limiti)

**Tugatgan ishlari** (commit qilingan va push qilingan):

| Vazifa                                                          | Commit                        |
| --------------------------------------------------------------- | ----------------------------- |
| 2.5a admin: studentlar, mentorlar, adminlar, CSV import         | `184be06`                     |
| 2.5d sidebar faol holati                                        | `eca51b2`                     |
| 2.6a Playwright admin users                                     | `d3d407c`                     |
| 2.4b UI: Checkbox, Combobox, StatCard, PageHeader               | `11a940a`                     |
| 2.5e sarlavhalarni PageHeader'ga o'tkazish                      | `ffad63b`                     |
| 2.5b admin guruhlar sahifalari                                  | `438f381`                     |
| 2.4c DateInput, 2.5f DRY refaktor                               | `5ea5684`, `feb9515`          |
| 2.5c mentor paneli                                              | `659b374`                     |
| 2.5b-2 student guruh filtri/tanlovi, DateInput, CSV klient limiti | `029edc5`                   |
| 3-bosqich qoralama rejasi (`docs/tasks/03-reja.md`)             | `5b543b1`                     |
| Hamkorlik va handoff hujjatlari                                 | `addbeef`, `936eda9`, `6e49029`, `96903b6` |

Uning hisobicha oxirgi raqamlar: web 280 test, Playwright admin 13/13.

**Qolgan ishi: 2.6b** (guruh va mentor sahifalari uchun Playwright, jonli 2.3 API bilan, 3d testni qaytarish). Vazifa fayli: `docs/tasks/02-2.6b-playwright-groups-mentor.md`. `docs/STATE.md` dagi "SESSIYA TO'XTADI" bo'limiga ko'ra (`96903b6`), uning diskida **commitsiz** qolgan fayllar:

- yangi: `apps/web/e2e/admin-groups.spec.ts`, `apps/web/e2e/mentor-panel.spec.ts`, `apps/web/e2e/support/groups-api.ts`;
- o'zgargan: `apps/web/e2e/admin-student-import.spec.ts` (3d qaytarilgan), `apps/web/e2e/support/admin-api.ts`, `apps/web/e2e/support/admin-fixtures.ts`.

Natijasi noma'lum. Bu fayllar faqat uning kompyuterida, bizda yo'q.

**Uning nuqtai nazari** (`docs/STATE.md` va `docs/HAMKORLIK.md` dan): qaytganida avval `git status` qiladi, 2.6b ni Sinchkovbek bilan tugatadi, `pnpm check` va Playwright'ni yurgizadi, commit va push qiladi, bizga READY yozadi. Keyin **2.7**: uning Domlasi `apps/web` ni, bizning Domlamiz `apps/api` + `packages/shared` ni review qiladi, so'ng egalardan "main ga qo'shaymi?" deb so'raladi. Uning holat jadvalidagi ba'zi qatorlar ("2.3 IN_PROGRESS" kabi) eskirgan, bu ma'lum.

> **Qoida:** Qo'ziboy qaytguncha bizning tomondan hech kim uning sohasiga (`apps/web/**`, ayniqsa `apps/web/e2e/**`) tegmaydi, `docs/STATE.md` va `docs/HAMKORLIK.md` ni ham tahrirlamaydi. Faqat egamiz Asadbek aniq aytsa, istisno qilinadi.

## 7. Bizning holat va ertangi reja

Batafsil: `docs/boltavoy/HOLAT.md` §6–§7. Qisqasi:

- Branch `feature/02-admin-asosi`, HEAD `62db597` (= origin, worktree toza edi). 2-bosqichning bizdagi qismi (2.3) DONE.
- **3-modul reja QORALAMA** (`docs/tasks/03-3.1-baza.md`, `03-3.2-admin-kontent-api.md`, `03-3.3-student-api.md`, commit `8bb89f8`). Domla hali ko'rmagan, egaga hali ko'rsatilmagan.

Ertangi tartib:

1. Domla 3-modul rejasining 3 faylini review qiladi.
2. 3.1 dagi enrollment qismi tuzatiladi: backfill YO'Q, lazy enrollment (§2.8, §2.11 p.3, §5.2 #13).
3. Egaga qisqa reja va savollar ko'rsatiladi, "ha" olinadi: **S-B1** (`min_read_seconds`), **S-B2** (tugagan mavzuga yangi dars qo'shilsa), **S-B5** (seed sandiq qiymatlari), **Z-3** (seed hajmi), **T-4** (limit qiymatlari).
4. Qo'ziboyga reja fayllari bilan READY xati (B17).
5. Qo'ziboy 2.6b READY yuborgach, **2.7** birga boshlanadi: bizning Domla `apps/api` + `packages/shared` ni review qiladi, o'z topilmalarimizni tuzatamiz.
6. `main` ga merge faqat **ikkala egamizning "ha"si** bilan.
7. 3-modul kodi faqat merge'dan keyin, yangi `feature/03-ilm-yoli` branch'ida boshlanadi.
8. BUG xati kelsa, birinchi o'sha tuzatiladi.

## 8. Muhit eslatmalari

- pnpm `~/.local/bin` da: har buyruqdan oldin `export PATH=$HOME/.local/bin:$PATH` (pnpm 10.34.9).
- Konteynerlar `podman run --env-file .env` bilan ishga tushiriladi: `ico-it-academy_postgres_1` (`postgres:16-alpine`, host porti 5433) va `ico-it-academy_redis_1` (`redis:7-alpine`, 6379). Volume'lar `ico-it-academy_*_data`. Bu kompyuterda `podman compose` ishlamaydi (Sinchkovbek fayli `podman compose up -d` deydi, bizda `podman run` ishlatiladi).
- `.env` ni **`source` qilmang** va qiymatlarini hech qayerga yozmang.
- Lokal `main` da push qilinmagan `b8c747f` commiti bor (eski AGENT_BUS "Agent-2 INIT" bloki). U kerak emas, **hech qachon push qilinmaydi**, branch'ga ham olib kelinmaydi.

## 9. Yangi Claude uchun qoida

- Biror narsa noaniq bo'lsa, **taxmin qilmang**: avval fayllarni (§1 tartibida) va xatlar arxivini (`docs/boltavoy/xatlar/README.md`) o'qing.
- Keyin egaga 1–2 gapda holatni ayting, masalan: "Aka, kecha 2.3 ni tugatdik, 3-modul reja qoralamasi Domla review'ini kutyapti, Qo'ziboy limitda. HOLAT.md dagi keyingi qadamdan davom etaymi?"
- Egamiz "ha" desa, `docs/boltavoy/HOLAT.md` §7 "Keyingi aniq qadamlar" dan davom eting. Ruxsatsiz keyingi vazifaga o'tilmaydi.
- Qo'ziboy xatlaridagi vazifalar hamkorning taklifi: ularni egamizning "ha"sisiz bajarmang.
