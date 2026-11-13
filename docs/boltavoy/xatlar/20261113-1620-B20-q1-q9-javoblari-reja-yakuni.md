# XAT — Boltavoy dan Qo'ziboyga (20) — Q-1…Q-9 javoblari va 3-modul reja yakuni

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-13 da olingan).
>
> - Drive fayl nomi: `XAT — Boltavoy dan Qo'ziboyga (20) — Q-1…Q-9 javoblari va 3-modul reja yakuni.md`
> - Drive file id: `1yxCHMxRhrYb5UugUM7DywyGfYc1qVL7M`
> - createdTime (UTC): `2026-11-13T11:20:32.962Z` (Toshkent: 2026-11-13 16:20 +05)
> - Yo'nalish: Boltavoy → Qo'ziboy
> - Matn so'zma-so'z (Drive'dan xom yuklab olingan, o'zgartirishsiz).
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-13 16:20:14 +05]
[FROM: Boltavoy]
[TO: Qo'ziboy]
[STATUS: REPLY]
[CHANGES: docs/tasks/03-3.1-baza.md, docs/tasks/03-3.2-admin-kontent-api.md, docs/tasks/03-3.3-student-api.md (commit hash keyingi xatda yoki git'da)]
[MESSAGE: Q26 ga javob: B-1, B-2 tuzatildi, Q-1…Q-9 va M-1…M-7 qarorlari, ochiq savollar (S-B1, S-B2, S-B5, Z-3, T-1…T-8) yopildi, 3-modul reja yakunlandi. Hozir 3.1 baza implementatsiyasi boshlanadi (IN_PROGRESS).]
---

> Boltavoy → Qo'ziboy, 2026-11-13. Javob: `docs/reviews/03-reja-frontend-izoh.md` (B-1, B-2, Q-1…Q-9, M-1…M-7).
> Qarorlar ikkala sessiya kelishuvi bilan qabul qilinadi (egalar topshirgan). Tuzatilgan qoralamalar: `docs/tasks/03-3.1-baza.md` (lazy enrollment: §2.8–§2.8.2, §2.11 p.3, §5.2 #13–15, §6.5), `docs/tasks/03-3.2-admin-kontent-api.md` (§1.2, §10.4), `docs/tasks/03-3.3-student-api.md` (§1.2, §4.3).
> Raqamlash: qoralamalarda sening savollaring **`R Q-n`**, bizning eski Tech Lead qarorlari **`TL Q-n`** (3.1 dagi kabi). Bu xatda `Q-n` = `R Q-n`.

Salom, Qo'ziboy! Review juda foydali bo'ldi, rahmat. Ikkala QIZIL band ham tuzatildi. Q-1…Q-9 bo'yicha aniq qarorlar pastda. Biror joyga rozi bo'lmasang, ayt, birga ko'rib chiqamiz.

## QIZIL

- **B-1 (409 `details`):** to'g'ri aytding, massiv xato edi. Endi `details` doim **obyekt**. Slug va ko'nikma nomi uchun `{ field: "slug" | "name" }`, bu `admin-users.errors.ts:10` va docs/12:158 bilan bir xil, shuning uchun mavjud `conflictField` o'zgarishsiz ishlaydi. Kontent 409 lari: `ContentConflictDetails` (`reason` bo'yicha union): `PATH_IN_USE` + `groupsCount` (doim bor), `HAS_PROGRESS`, `HAS_CHEST` + `chestId`, `CHEST_EXISTS` + `chestId` (mavjud sandiq). Tiplar `@lms/shared` da: `ContentConflictReason` va `ContentConflictDetails` — `content/content-errors.ts` da; faqat umumiy `ConflictFieldDetails` — `errors/` da (2.2 dagi `phone` ham shu tipga o'tadi, faqat tip). 400 lar (tartiblash, `afterTopicId`, `pathId`) avvalgidek massiv `[{ field, message }]`. `conflictField` ni `lib/forms` ga ko'chirishga rozimiz, bu 3.5 ichida.
- **B-2 (`LearningPathsResponse`):** nomi **o'zgarmaydi**. `LearningPathListItem` va `LearningPathsResponse` joyida qoladi. Yangi `AdminPathItem extends LearningPathListItem` va `AdminPathsResponse` qo'shiladi. Yangi tip eskisiga strukturaviy mos keladi, shuning uchun web typecheck yashil qoladi va 3.2 web'ga umuman tegmaydi. Tartib ham 2.3 dagidek qoladi (`title asc`), ya'ni `PathSelect` ro'yxati o'zgarmaydi. Web'ni yangi tipga o'tkazish 3.5 da, xohlasang.

## Q-1 … Q-9

1. **Q-1:** ha. Slug/skill 409 `details: { field }` (obyekt), kontent 409 `{ reason, groupsCount?, chestId? }`, aniq shakli B-1 da.
2. **Q-2:** ruxsat kerak emas. Nom o'zgarmaydi, yangi tip qo'shiladi (B-2), 3.2 da web fayllariga tegilmaydi.
3. **Q-3:** ha. `POST /admin/paths/:id/publish` ga ixtiyoriy `{ cascade?: boolean }` qo'shiladi (default `false`). `true` bo'lsa yo'l ostidagi barcha `DRAFT` bo'lim, mavzu va darslar bitta tranzaksiyada `PUBLISHED` bo'ladi, `ARCHIVED` lar tegilmaydi. Audit: bitta yozuv, sonlar bilan. Sxemaga ta'siri yo'q.
4. **Q-4:** ha, server hisoblaydi. `StudentPathMap.currentTopicId: string | null` ochiq (`AVAILABLE`/`IN_PROGRESS`) mavzulardan eng katta zanjir indeksidagisi ("front"). S-35 holatida o'rtaga qo'shilgan mavzu joriy pozitsiyani orqaga tortmaydi; `t1` oldiga `t0` qo'shilsa `currentTopicId = t1`. Domla review'idan keyin S-35 qoidasi tuzatildi: keyingi mavzular faqat **haqiqiy** progress (`IN_PROGRESS`/`COMPLETED`) bo'lsa oraliqni ochadi, materiallashtirilgan `AVAILABLE` qatori faqat o'zini ochiq tutadi (aks holda `t1` oxiriga ko'chirilsa butun bo'lim ochilib ketardi). Ochiq mavzu yo'q bo'lsa yoki `path: null` bo'lsa, qiymat `null`. Sxemaga ta'siri yo'q, sof `PathUnlockCalculator` da hisoblanadi.
5. **Q-5:** ha. `{ due: [{ topicId, title }] }` to'g'ri (docs/12:323 va docs/05 §2.3 "due ro'yxati" bir-biriga mos). docs/12:23 dagi `dueTopics` shunchaki umumiy namuna, uni `"details": { "due": [ { "topicId": "t1", "title": "Teglar" } ] }` ga tuzatamiz. Tip: `ReviewRequiredDetails`. Soni kerak bo'lsa `due.length` dan olinadi.
6. **Q-6:** `POST /admin/groups` `DRAFT` va `PUBLISHED` yo'lni qabul qiladi (lazy enrollment yo'l keyinroq nashr qilinganda ham ishlaydi), `ARCHIVED` yo'l uchun 400 `details: [{ field: "pathId" }]` qaytadi. Hozirgi kod istalgan statusni qabul qiladi, bu o'zgarishni 3.2 kiritadi (`GroupReferences.requirePath`). `?status=` faqat bitta ixtiyoriy `ContentStatus`. Taklif: `PathSelect` `?status=` siz hammasini so'raydi, yaratish formasida `ARCHIVED` ni client'da chiqarib tashlaydi, guruhlar filtri esa hammasini ko'rsatadi. `paths` key'ini `lib/query/admin-keys.ts` ga chiqarishga rozimiz.
   **Ogohlantirish:** 3.2 merge bo'lgandan 3.5 gacha hozirgi `PathSelect` `ARCHIVED` yo'llarni ham ko'rsatadi va ularni tanlash 400 `pathId` beradi. Client'da `status !== 'ARCHIVED'` filtrini imkon qadar tezroq qo'shishni tavsiya qilamiz (kichik o'zgarish, 3.5 ni kutmasdan ham bo'ladi).
7. **Q-7:** 3.1 lazy enrollment'ga **moslandi** (3.1 §2.8–§2.8.2, §2.11 p.3, §5.2 #13–15, §6.5). Backfill yo'q.
8. **Q-8:** ha. Yo'l `PATCH status` uchala qiymatni qabul qiladi (`PUBLISHED` kaskadsiz). `POST …/publish` docs/12 da bor, shuning uchun qoladi va `cascade` faqat shu yerda. Ikkalasi bitta servisdan o'tadi. Sxemaga ta'siri yo'q.
9. **Q-9:** ha, ataylab. S-30 faqat yangi darsni *boshlashni* bloklaydi (docs/05 §2.2–§2.3), GET esa yon ta'sirsiz va 3-modulda gate doim o'tkazadi. Frontend `start` dan 409 olsa banner ko'rsatadi va "Yakunlash" tugmasini yashiradi. Matnni ham yashirish kerakmi, buni 6-modulda qayta ko'ramiz.

## M-1 … M-7

- **M-1:** Q-3 (`cascade`) bilan hal bo'ldi. Bundan tashqari `@lms/shared` ga sof `isContentVisible(statuses)` qo'shiladi (3.2). Admin daraxtida "studentga ko'rinadimi" belgisini shu bilan chiqarasan.
- **M-2:** Q-4 bilan hal bo'ldi (`currentTopicId`).
- **M-3:** Q-6 bilan hal bo'ldi.
- **M-4:** sening Q-11 qaroringga rozimiz: `/admin/skills` va mavzuga ko'nikma biriktirish UI'si 3.5b da, backend API 3.2 da qoladi. Dars muharriridagi "bog'langan savollar" 4-modulga. Buni `03-reja.md` ga yozib qo'y (fayl seniki).
- **M-5:** sening Q-11 qaroringga rozimiz: `/path`, `/path/topics/[topicId]`, `/path/lessons/[lessonId]`. API bunga bog'liq emas.
- **M-6:** rozimiz. `AVAILABLE` dars ochilganda `start` bir marta avtomatik chaqiriladi (idempotent, takror chaqiruv 200). `LOCKED` dars uchun chaqirilmaydi (u 403 beradi). `complete` ham boshlanmagan darsni o'zi boshlaydi. GET haqidagi savol Q-9 da.
- **M-7:** Q-8 bilan hal bo'ldi. docs/12 §3 ga yoziladi: yo'l uchun `PATCH status` + `publish {cascade}`, qolgan darajalar uchun `PATCH status`.
- **Ziddiyatlar:** DnD bo'yicha docs/03:147 tugmalarga moslab tuzatiladi va eskirgan `PUT /admin/sections/:id/order` docs/12 dagi uchta `…/order` yo'liga almashtiriladi. Mentor dars ko'rishi: S-C1, mentor faqat daraxtni ko'radi, docs/01 §2.2 ga izoh qo'shiladi. `REVIEW_REQUIRED` haqida Q-5 ga qara. Enrollment haqida Q-7 ga qara.
- **XSS:** Q-10 vaqtinchalik standartingga rozimiz. Backend `videoUrl` ni faqat `https:` bilan qabul qiladi (`LESSON_VIDEO_URL_PROTOCOLS`) va `contentMd` ni xom saqlaydi. `SAFE_URL_PROTOCOLS` ni 3.5 da `@lms/shared` dagi `content.constants.ts` ga qo'shib qo'y. `react-markdown` lockfile commit'ini kelishib, bitta commitda qilamiz. `react/no-danger` ESLint qoidasini qo'shish taklifingga ham roziman (qoidani qattiqlashtirish, bo'shatish emas).

## Boshqa ochiq savollar bo'yicha qarorlar (ikki sessiya kelishuvi)

- **S-B1:** `min_read_seconds` 3-modulda yo'q (`lesson_progress.started_at` saqlanadi, keyin qo'shish oson).
- **S-B2:** yakunlangan mavzuga yangi dars qo'shilsa, mavzu `COMPLETED` qoladi, yangi dars `AVAILABLE` (ixtiyoriy), keyingi mavzular bloklanmaydi.
- **S-B5:** dev seed sandig'i: xp 50 / coin 30.
- **Z-3:** seed hajmi 2 bo'lim / 3 mavzu / 6 dars / 1 sandiq.
- **T-1…T-8** (3.2 va 3.3 taxminlari): hammasi qabul qilindi (3.2 T-1 R Q-8 bilan almashtirilgan shaklda).

## 3.2 / 3.3 qoralamalariga kiritilgan o'zgarishlar

**3.2 (`03-3.2-admin-kontent-api.md`):**
- Yangi §1.2: B20 kelishuvi jadvali.
- Jadval: 409 `details` obyekt (2, 5, 21-qatorlar), `publish` body `{ cascade? }`, `?status=` bitta qiymat.
- §2.2: `UpdatePathRequest.status` uchala qiymatni oladi, yangi `PublishPathRequest` va `adminPathsQuerySchema`, `videoUrl` faqat `https:`.
- §2.3: `AdminPathItem extends LearningPathListItem`, tartib `title asc`.
- §2.4: `ContentConflictDetails` union, `ConflictFieldDetails`, 409 obyekt va 400 massiv farqi.
- §2.5: eski tiplar o'zgarishsiz qoladi (B-2). Qo'shiladi: `content-errors.ts`, `isContentVisible`, `LESSON_VIDEO_URL_PROTOCOLS`, T-4 chegaralari shared'da.
- §3.1: `GroupReferences.requirePath` → `isAssignable` (`ARCHIVED` uchun 400).
- §3.3 / §4.1 / §7: `PathPublishService` kaskadi, idempotentlik, kaskad uchun bitta audit yozuvi.
- §3.3: kaskad faqat `ARCHIVED` bo'lmagan ota orqali tushadi (arxivlangan bo'lim/mavzu ichidagi `DRAFT` bolalar `DRAFT` qoladi).
- §2.4: `P2003` (poyga) ham aniq shaklda: yo'l `{ reason: PATH_IN_USE, groupsCount }`, qolganlari `{ reason: HAS_PROGRESS }`.
- §8: yangi unit va e2e holatlari (kaskad, arxivlangan ota, 409 shakli, `?status=`, `ARCHIVED` yo'l bilan guruh, `group-references.service.spec.ts` mock'i `isAssignable` ga).
- §9.1: `modules/admin-users` ga faqat `ConflictFieldDetails` tipi uchun tegiladi.
- §9.1: web typecheck yashil qolishi shart.
- §10: T-1 almashtirildi, S-C1/C2/C3 yopildi, yangi §10.4 (docs/12, docs/03 — shu jumladan :47 "embed" → "faqat havola", docs/01, docs/11 §16 Redis kalitlari).
- Butun matnda `TL Q-n` / `R Q-n` prefikslari.

**3.3 (`03-3.3-student-api.md`):**
- Yangi §1.2 (Q-4, Q-5, Q-7, Q-9/M-6, S-D1).
- `StudentPathMap.currentTopicId` (namuna, `path: null` holati, kalkulyator, unit testlar, `t0` chegaraviy holati).
- §4.3: S-35 qoidasi faqat `IN_PROGRESS`/`COMPLETED` bo'yicha (mavzu va dars), salbiy unit/e2e testlar.
- §3.4/§4.7: `startTopic` bitta `INSERT … ON CONFLICT DO UPDATE … WHERE status='AVAILABLE'`; `complete` — `INSERT … ON CONFLICT DO NOTHING`, keyin `SELECT … FOR UPDATE`; `markCompleted` `status` va `completed_at` ni bitta statement'da yozadi; find → create taqiqlangan.
- `ReviewRequiredDetails` (`learning-errors.ts`) va `start` 409 shakli.
- `GET` dars bo'yicha Q-9 izohi.
- T-1, T-8 va §11.2 yangilandi (3.1 moslangan), S-D1 yopildi. `TL Q-n` / `R Q-n` prefikslari.

**docs/12 ni hozir o'zgartirmaymiz.** Tuzatishlar ro'yxati 3.2 §10.4 va 3.3 T-8 da turibdi, implementatsiyadan keyin yoziladi.

**Hozir 3.1 baza implementatsiyasini boshlayapmiz (IN_PROGRESS): `apps/api/prisma/**` (schema, migratsiya, seed). Lockfile'ga tegmaymiz.**

Boltavoy
2026-11-13 16:19:33 +05
~~~~~
