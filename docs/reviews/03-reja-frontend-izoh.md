# 3-modul rejasi — frontend nuqtai nazaridan review

> domla-reviewer, 2026-11-11 ~23:50 (faqat o'qish). Ko'rilgan: `docs/tasks/03-reja.md` (Qo'ziboy), `03-3.1-baza.md`, `03-3.2-admin-kontent-api.md`, `03-3.3-student-api.md` (Boltavoy qoralamalari, `8bb89f8`).
> **Xulosa: frontend uchun hozircha YO'Q.** Asosiy kontrakt deyarli to'liq, lekin quyidagi QIZIL/SARIQ bandlar hal bo'lmaguncha 3.5 boshlanmaydi.

## QIZIL (blocker)
- **B-1. 409 `CONFLICT` details shakli.** `03-3.2:34,98` slug uchun `details: [{field,message}]` (massiv) deydi. Mavjud kod (`admin-users.errors.ts:10`) va `docs/12:158` da esa obyekt: `{ field: 'phone' }`. Frontend `conflictField` faqat obyektni o'qiydi. **Taklif:** `details: { field }`; kontent 409 lari `details: { reason, groupsCount?, chestId? }`, `@lms/shared` da tiplangan. `conflictField` `lib/forms` ga ko'chiriladi.
- **B-2. `LearningPathsResponse` → `AdminPathsResponse`** (`03-3.2:105`). Bu tip web'da ishlatiladi (`admin-groups/api/groups.api.ts:7,47`, `PathSelect.tsx`), lekin 3.2 da "frontendga tegma" deyilgan (`:222`), natijada web typecheck qizil bo'ladi. **Taklif:** 3.2 ga 2 ta web faylda importni yangilashga ruxsat berish.

## SARIQ (majburiy)
- **M-1.** Nashr kaskadsiz (`03-3.2:18,153`): yo'l nashr qilinsa, bolalar DRAFT qoladi va xarita bo'sh chiqadi. Kerak: tugunning "studentga ko'rinadimi" belgisi (`@lms/shared` da `isContentVisible` sof funksiyasi) va ommaviy nashr (`publish {cascade:true}`?).
- **M-2.** Joriy pozitsiya "birinchi AVAILABLE" (`03-3.3:53`) S-35 holatida noto'g'ri ishlaydi → `StudentPathMap.currentTopicId` server tomonida hisoblansin.
- **M-3.** 3.2 dan keyin `/admin/paths` DRAFT va ARCHIVED yo'llarni ham qaytaradi, guruh formasidagi `PathSelect` qaysi `?status=` bilan so'raydi? `POST /admin/groups` DRAFT yoki ARCHIVED yo'lni qabul qiladimi? `paths` query key'i `lib/query/admin-keys.ts` ga chiqarilsin.
- **M-4.** 3.5 qamrovi: `/admin/skills` va mavzuga ko'nikma biriktirish UI'si; dars muharriridagi "bog'langan savollar" 4-modulga qoladi, rejaga yozilsin.
- **M-5.** Student yo'llari noaniq (`docs/03:45`).
- **M-6.** `start` qachon chaqirilishi yozilmagan. Taklif: AVAILABLE darsni sahifa ochilganda bir marta avtomatik chaqirish (idempotent); 409 `REVIEW_REQUIRED` banner bilan ko'rsatiladi. GET takrorlash bloki ostida ham matnni qaytarishi ataylabmi?
- **M-7.** Yo'l uchun `POST /publish` + `PATCH status`, boshqa darajalarda faqat `PATCH status`. docs/12 §3 ga aniq yozilsin. Yo'l uchun ham `PATCH status: PUBLISHED` qo'shish tavsiya qilinadi.
- **Ziddiyatlar:**
  - drag-and-drop: `docs/03:147` va `docs/14` da DnD bor, rejada esa tugmalar → docs/03 yangilanadi, eskirgan `PUT /admin/sections/:id/order` ham tuzatiladi;
  - `REVIEW_REQUIRED.details` ikki xil: `docs/12:23` (`dueTopics`) va `:323` (`due[]`);
  - mentor dars ko'rishi: `docs/01` §2.2 "K", `docs/12:281` esa faqat SA A;
  - 3.1 qoralamasidagi enrollment (backfill) 3.3 dagi lazy enrollment bilan mos emas (§2.8, §2.11 p.3, §5.2 #13).
- **XSS / Markdown:**
  - raw HTML yo'q (`rehype-raw` taqiqlanadi, `dangerouslySetInnerHTML` yo'q);
  - link va rasmlar `SAFE_URL_PROTOCOLS` bo'yicha filtrlanadi;
  - tashqi linklarda `rel="noopener noreferrer"`;
  - kod bloklari oddiy `<pre><code>` da;
  - Markdown renderer bitta, `components/ui` da;
  - rasmlar va video embed bo'yicha qaror kerak (pastga qarang);
  - ESLint'ga `react/no-danger` qoidasini qo'shish taklif qilinadi.

## YASHIL
- **R-1.** Reorder: optimistic update + rollback + invalidate.
- **R-2.** Har mutatsiyadan keyin `tree(pathId)` invalidate qilinadi.
- **R-3.** `order` qiymati ko'rsatilmaydi.
- **R-4.** `beforeunload` ogohlantirish; `expectedUpdatedAt` keyinroq.
- **R-5.** READY sandiq 3-modulda disabled, ochish 5-modulda.
- **R-6.** Xatolar xaritasi: 404 → EmptyState, 403 LOCKED, 409 REVIEW_REQUIRED.
- `docs/12` §4 ga qo'shimchalar (`icon`, sandiq `title`, `next.topicId`, `path:null`, `LessonStartResponse`) implementatsiyadan keyin yoziladi.
- Seed 2/3/6/1 yetarli, kod bloki va `video_url` bo'lsin.

## Ochiq savollar bo'yicha frontend tavsiyasi
- **S-C1:** mentorga faqat daraxt, dars matni yo'q (3-modulda mentor sahifasi yo'q); docs/01 §2.2 ga izoh qo'shiladi.
- **S-D1:** 200 `{ path: null, reviewBlock, sections: [] }` → EmptyState.
- **S-B1:** 3-modulda yo'q. Keyin serverdan `completableAt` (ISO) va yangi xato kodi keladi.
- **S-B2:** COMPLETED qoladi, yangi dars AVAILABLE. Frontend "yangi dars bor" belgisini `lessonsCompleted < lessons` dan aniqlaydi.
- **T-4:** chegaralar 3.5 dan oldin `@lms/shared` da bo'lsin.

## `@lms/shared` — frontendga kerakli ro'yxat
- **Enumlar:** `TopicStatus`, `LessonStatus`, `ChestStatus`, `PathNodeKind`.
- **Konstantalar:** `*_MAX_LENGTH`, `PATH_SLUG_PATTERN`, `LESSON_EST_MINUTES_MAX`, `CONTENT_REORDER_MAX`, `TOPIC_SKILLS_MAX`, `LESSON_CONTENT_MAX_LENGTH`, `SAFE_URL_PROTOCOLS`, `VIDEO_EMBED_HOSTS` (agar embed tasdiqlansa).
- **Sxemalar:** create/update (path, section, topic, lesson, chest, skill), `chestRewardSchema`, reorder, `setTopicSkillsSchema`, `adminPathsQuerySchema`, `skillsQuerySchema`. Formalar uchun create-sxemaning `partial` shakli + diff yuboriladi.
- **Admin tiplari:** `AdminPathItem/Response/Detail/Tree`, `Admin{Section,Topic,Lesson,Chest}Node`, `AdminLesson`, `ChestReward`, `Skill*`.
- **Student tiplari:** `StudentPathMap` (`path|null`, `currentTopicId`), `StudentPathSummary/Section/Node` (union), `ReviewBlock`, `StudentTopicDetail/Lesson`, `StudentLesson`, `LessonStart/CompleteResponse`, `NextLessonRef`, `RewardItem`.
- **Xato details tiplari:** `ContentConflictReason`, `ContentConflictDetails`, `ConflictFieldDetails`, `ReviewRequiredDetails`.
- **Sof funksiya:** `isContentVisible`.

## Tech Lead (Qo'ziboy) qarorlari — frontend tomoni (2026-11-11)
- **Q-11 (student yo'llari):** `/path` (xarita), `/path/topics/[topicId]`, `/path/lessons/[lessonId]`; sidebar'da "Ilm yo'li" bandi barchasida faol bo'ladi. Ega keyin route'larni o'zgartirishi mumkin (STATE "Egasining kelajakdagi rejasi"), shuning uchun bo'limlar ko'chiriladigan feature komponentlar sifatida yoziladi.
- **Q-11 (skills UI):** `/admin/skills` sahifasi va mavzuga ko'nikma biriktirish **3.5 dan chiqariladi**. Ular alohida kichik vazifa (3.5b) bo'ladi va 7-modul (portfolio: ko'nikmalar) oldidan qilinadi. Backend API 3.2 da qolaveradi.
- **Q-10 (ega qarori kelguncha vaqtinchalik standart):**
  - Markdown'da rasmlar faqat `https:` bilan ko'rsatiladi, boshqalari matn havola bo'lib qoladi;
  - video 3-modulda **faqat havola** (yangi tabda), embed yo'q;
  - `videoUrl` faqat `https:`.
  - Embed (YouTube allowlist) keyin, ega qarori bilan.
- **M-6:** AVAILABLE dars sahifa ochilganda avtomatik `start` qilinadi.
- **Drag-and-drop:** 3-modulda yuqoriga/pastga tugmalari; docs/03:147 shunga moslab yangilanadi.
- **Markdown paketi** (`react-markdown`; typography kerak bo'lsa alohida): lockfile o'zgarishi Boltavoy bilan kelishib, bitta commitda qilinadi.

## Boltavoyga savollar (Q-1 … Q-9)
1. 409 slug va skill `details: { field }` obyektmi; kontent 409 `{ reason, ... }`?
2. `LearningPathsResponse` nomini o'zgartirishda 3.2 ga web'dagi 2 faylni yangilash ruxsati berilsinmi?
3. Ommaviy nashr `publish {cascade:true}`?
4. `currentTopicId` server tomonida hisoblanadimi?
5. `REVIEW_REQUIRED.details` = `{ due: [{topicId,title}] }`, docs/12:23 tuzatilsinmi?
6. `POST /admin/groups` DRAFT yoki ARCHIVED yo'lni qabul qiladimi? `PathSelect` qaysi `?status=` bilan so'raydi?
7. 3.1 qoralamasi lazy enrollment'ga qachon moslanadi?
8. Yo'l uchun `PATCH status: PUBLISHED` ham bo'ladimi?
9. GET dars takrorlash bloki ostida ham matnni qaytarishi ataylabmi?
