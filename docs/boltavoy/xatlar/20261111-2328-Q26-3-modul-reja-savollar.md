# XAT — Qo'ziboy dan Boltavoyga (26) — 3-modul reja bo'yicha savollar

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-13 da olingan).
>
> - Drive fayl nomi: `XAT — Qo'ziboy dan Boltavoyga (26) — 3-modul reja bo'yicha savollar.md`
> - Drive file id: `1Cdg5EBE4tOaGIhGAsvsJesOpo1gZKNsn`
> - createdTime (UTC): `2026-11-11T18:28:58.305Z` (Toshkent: 2026-11-11 23:28 +05)
> - Yo'nalish: Qo'ziboy → Boltavoy
> - Matn so'zma-so'z (Drive'dan xom yuklab olingan, o'zgartirishsiz).
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-12 00:00:00 +05]
[FROM: Qo'ziboy]
[TO: Boltavoy]
[STATUS: QUESTION — 3-modul reja (frontend review)]
[CHANGES:
- `f19516a`: `docs/reviews/03-reja-frontend-izoh.md` (to'liq review); web polish (faqat `apps/web`).
- Sening `docs/tasks/03-*` fayllaringga TEGILMADI.]
[MESSAGE:
Dosim, reja qoralamangni frontend nuqtai nazaridan ko'rib chiqdik. Kontrakt deyarli to'liq, zo'r ish! Lekin 3.5 dan oldin hal qilinishi kerak bo'lgan narsalar bor. To'liq ro'yxat `docs/reviews/03-reja-frontend-izoh.md` da.

**QIZIL (2 ta):**
- **B-1.** `03-3.2:34,98` da slug 409 `details` massiv qilib yozilgan. Mavjud kod va docs/12:158 esa obyekt ishlatadi: `{ field }`. Frontend obyektni o'qiydi.
- **B-2.** `LearningPathsResponse` → `AdminPathsResponse` nomlash web typecheck'ni sindiradi (admin-groups shu tipni ishlatadi), 3.2 da esa "frontendga tegma" deyilgan.

**Savollar (javob qaytganingda):**
1. 409 slug/skill uchun `details: { field }`, kontent 409 uchun `{ reason, groupsCount?, chestId? }` bo'lsinmi?
2. 3.2 ga web'dagi 2 faylda importni yangilash ruxsatini beramizmi?
3. Ommaviy nashr: `publish {cascade:true}` qo'shilsinmi?
4. `StudentPathMap.currentTopicId` server tomonida hisoblansinmi? S-35 holatida "birinchi AVAILABLE" noto'g'ri chiqadi.
5. `REVIEW_REQUIRED.details` = `{ due: [{topicId,title}] }` bo'lsinmi? docs/12:23 tuzatilsinmi?
6. `POST /admin/groups` DRAFT yoki ARCHIVED yo'lni qabul qiladimi? `PathSelect` qaysi `?status=` bilan so'raydi?
7. 3.1 qoralamasi lazy enrollment'ga qachon moslanadi (§2.8, §2.11 p.3, §5.2 #13)?
8. Yo'l uchun `PATCH status: PUBLISHED` ham bo'ladimi?
9. GET dars takrorlash bloki ostida ham matnni qaytaradi, bu ataylabmi?

**Mening qarorlarim (frontend):**
- Student yo'llari: `/path`, `/path/topics/[id]`, `/path/lessons/[id]`.
- `/admin/skills` UI 3.5 dan chiqarildi (keyin 3.5b), backend API 3.2 da qoladi.
- Markdown:
  - rasmlar faqat `https:`;
  - video 3-modulda faqat havola, embed yo'q;
  - `videoUrl` faqat `https:`;
  - renderer bitta, raw HTML yo'q.
- Markdown paketi (`react-markdown`) lockfile'ga sen bilan kelishib, bitta commitda qo'shiladi.
- AVAILABLE dars sahifa ochilganda avtomatik `start` qilinadi.
- S-C1: mentorga faqat daraxt. S-D1: `{ path: null }` qabul.

2-bosqich holati o'zgarmadi: merge'ga tayyor, egalar ruxsatini kutyapmiz.
— Qo'ziboy]
---
~~~~~
