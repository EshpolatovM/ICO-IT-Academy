# 12. API

> **Qisqa mazmun:** Modullar bo'yicha barcha REST endpointlar: method, yo'l, kim chaqira oladi va asosiylari uchun request/response namunasi. WebSocket (Socket.IO) eventlari alohida bo'limda. Sahifalar (03) va baza (11) bilan mos.

---

## 0. Konvensiyalar

| Mavzu | Qaror |
|---|---|
| Prefiks | `/api/v1` (pastdagi yo'llarda tushirib qoldirilgan) |
| Format | JSON, `camelCase` |
| Auth | `Authorization: Bearer <access>`. Refresh va parent session `HttpOnly` cookie'da |
| Pagination | Cursor: `?cursor=<opaque>&limit=20` → `{items, nextCursor}`. Admin jadvallarida offset: `?page=1&pageSize=20` → `{items, total, page, pageSize}` |
| Filtr/saralash | `?q=&status=&sort=-createdAt` |
| Idempotentlik | Mukofot/xarid kabi muhim POST'lar uchun `Idempotency-Key` header |
| Vaqt | ISO-8601 UTC |
| Validatsiya | `class-validator` (yoki Zod) DTO, `400` javobda `details[]` |
| Hujjat | OpenAPI (Swagger) avtomatik, `/api/docs` (faqat staging) |

**Xatolik formati:**
```json
{ "error": { "code": "REVIEW_REQUIRED", "message": "Avval takrorlashlarni bajaring", "details": { "dueTopics": 3 } } }
```

| HTTP | Qachon |
|---|---|
| 400 | Validatsiya xatosi |
| 401 | Token yo'q yoki eskirgan |
| 403 | Rol/scope ruxsati yo'q, `PASSWORD_CHANGE_REQUIRED`, `LOCKED` |
| 404 | Topilmadi (scope'dan tashqari resurs uchun ham 404 qaytariladi, mavjudligini oshkor qilmaslik uchun) |
| 409 | `REVIEW_REQUIRED`, `INSUFFICIENT_COINS`, `OUT_OF_STOCK`, `ALREADY_DONE`, `STUDENT_ALREADY_IN_GROUP`, `GROUP_ARCHIVED`, `CONFLICT` (masalan telefon band) |
| 413 | `PAYLOAD_TOO_LARGE` — yuklangan fayl hajmi limitdan katta (CSV import) |
| 429 | Rate limit |

**Rol qisqartmalari:** `SA` super admin, `A` admin, `M` mentor (scope: o'z guruhi), `S` student (scope: o'zi), `P` ota-ona (scope: farzand), `PUB` public, `ANY` har qanday autentifikatsiyalangan foydalanuvchi.

**RBAC deny-by-default (1.11a):** har bir endpointda `@Public()` (`PUB`), `@Roles(...)` yoki `@AnyAuthenticated()` (`ANY`) bo'lishi shart, aks holda `RolesGuard` 403 beradi; buni barcha route'larni aylanib chiquvchi test (`app.module.spec.ts`) tekshiradi.

**Qo'shimcha xato qoidalari (1.11a):**
- URL'dagi UUID parametr noto'g'ri — 400 `VALIDATION_ERROR`, `details: [{ field: "<parametr>", message }]`.
- Auth va ota-ona so'rov sxemalari qat'iy (`z.strictObject`): noma'lum maydon — 400 `VALIDATION_ERROR`.
- `401 REFRESH_SUPERSEDED` — `POST /auth/refresh` da token grace oynasi ichida almashtirilgan (02 §3).
- Javoblarda xavfsizlik header'lari (helmet): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`; HSTS faqat production'da.

---

## 1. Auth

| Method | Yo'l | Kim | Izoh |
|---|---|---|---|
| POST | `/auth/staff/login` | PUB | |
| POST | `/auth/student/login` | PUB | |
| POST | `/auth/parent/exchange` | PUB | |
| POST | `/auth/refresh` | cookie | Rotation; grace ichida eski token — 401 `REFRESH_SUPERSEDED` (02 §3) |
| POST | `/auth/logout` | ANY | `X-Requested-With` majburiy (CSRF), yo'q bo'lsa 403 |
| POST | `/auth/parent/logout` | PUB (cookie + `X-Requested-With`) | Ota-ona chiqishi, sessiya talab qilinmaydi; `ps` va `parent_tokens` cookie'larini o'chiradi, 204 |
| GET | `/auth/me` | ANY + P | |
| POST | `/auth/change-password` | SA A M S | Eski parol urinishlari limiti — 429 (02 §6) |
| GET | `/auth/sessions` | SA A M S | |
| DELETE | `/auth/sessions/:id` | SA A M S | |

```http
POST /auth/student/login
{ "studentCode": "ST-10245", "password": "Temp1234" }

200
{ "accessToken": "eyJ...", "expiresIn": 900,
  "user": { "id": "0190...", "role": "STUDENT", "firstName": "Ali", "lastName": "Valiyev",
            "studentCode": "ST-10245", "mustChangePassword": true } }
Set-Cookie: rt=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth
```

```http
POST /auth/change-password
{ "oldPassword": "Temp1234", "newPassword": "Yangi$Parol9" }
200 { "accessToken": "eyJ...", "expiresIn": 900 }
```

```http
POST /auth/parent/exchange
{ "tokens": ["k2Jd...43 belgi"], "merge": true }

200
{ "children": [ { "studentId": "0190...", "firstName": "Ali", "lastName": "Valiyev", "groupName": "FE-12" } ] }
Set-Cookie: ps=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: parent_tokens=<shifrlangan>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/parent; Max-Age=15552000
```
Body'siz `POST /auth/parent/exchange` → cookie'dagi saqlangan tokenlar bo'yicha session yangilanadi (S-15, 02 §5.1). Body ham, cookie ham bo'lmasa → 401, rate limitga sanalmaydi. Cookie bilan muvaffaqiyatli body'siz exchange ham rate limitga sanalmaydi (02 §5).

---

## 2. Foydalanuvchilar, guruhlar (admin)

| Method | Yo'l | Kim |
|---|---|---|
| GET/POST | `/super/admins` | SA |
| PATCH | `/super/admins/:id` | SA |
| GET/POST | `/admin/mentors` | SA A |
| GET/PATCH | `/admin/mentors/:id` | SA A |
| POST | `/staff/:id/reset-password` | SA (admin uchun), SA A (mentor uchun) |
| GET/POST | `/admin/students` | SA A |
| POST | `/admin/students/import` | SA A (CSV, S-21) |
| GET/PATCH | `/admin/students/:id` | SA A |
| POST | `/students/:id/reset-password` | SA A M |
| GET/POST | `/students/:id/parent-tokens` | SA A M |
| DELETE | `/students/:id/parent-tokens/:tokenId` | SA A M |
| POST | `/students/:id/parent-tokens/:tokenId/regenerate` | SA A M |
| GET/POST | `/admin/groups` | SA A |
| GET/PATCH | `/admin/groups/:id` | SA A |
| PUT | `/admin/groups/:id/mentor` | SA A |
| POST | `/admin/groups/:id/members` | SA A |
| DELETE | `/admin/groups/:id/members/:studentId` | SA A |
| PATCH | `/me/profile` | ANY (P'dan tashqari) |
| GET | `/me/summary` | S |
| GET | `/me/transactions?type=xp\|coin` | S |

```http
POST /admin/students
{ "firstName": "Ali", "lastName": "Valiyev", "groupId": "0190...", "password": null }

201
{ "id": "0190...", "studentCode": "ST-10245", "temporaryPassword": "q7Lm2xPa9z", "mustChangePassword": true }
```

### 2.1 Foydalanuvchilarni boshqarish (2.2)

**Ruxsat matritsasi** (docs/01 §2.1, S-07 A, S-11 A): adminlar — faqat SA; mentor va studentlar — SA va A. SUPER_ADMIN API orqali yaratilmaydi va o'zgartirilmaydi (faqat CLI, S-13): har bir endpoint faqat o'z rolidagi akkauntni ko'radi, boshqa rol (SUPER_ADMIN ham) — 404. Boshqaruv endpointi orqali **o'z akkauntini** o'zgartirish/deaktivatsiya qilish — 403 `FORBIDDEN` (o'z profili — `PATCH /me/profile`). O'chirish endpointi yo'q — faqat deaktivatsiya (S-08 A). Barcha so'rov sxemalari `@lms/shared` da (`z.strictObject`: noma'lum maydon — 400).

**Ro'yxatlar** (`GET /super/admins`, `GET /admin/mentors`, `GET /admin/students`) — offset pagination:

| Parametr | Qiymat |
|---|---|
| `page`, `pageSize` | standart 1 / 20, `pageSize` ≤ 100 |
| `q` | ≤ 64 belgi. Ism-familiya bo'yicha qism moslik (`lower(first_name ‖ ' ' ‖ last_name) LIKE`, pg_trgm GIN indeksi). Studentlarda qo'shimcha: student kodi aniq mosligi (`ST-10245` yoki `10245`). Xodimlarda: telefon raqamlari bo'yicha qism moslik |
| `status` | `ACTIVE` \| `INACTIVE` |
| `groupId` | faqat `/admin/students`: shu guruhning faol a'zolari |
| `sort` | `-createdAt` (standart), `createdAt`, `lastName`, `-lastName` |

```http
GET /admin/students?q=ali&groupId=0190...&status=ACTIVE&page=1&pageSize=20&sort=lastName
200
{ "items": [ { "id": "0190...", "studentCode": "ST-10245", "firstName": "Ali", "lastName": "Valiyev",
               "status": "ACTIVE", "mustChangePassword": true, "lastLoginAt": null,
               "createdAt": "2026-11-11T08:00:00.000Z", "group": { "id": "0190...", "name": "FE-12" } } ],
  "total": 1, "page": 1, "pageSize": 20 }
```
`GET /admin/students/:id` — xuddi shu element. `GET /admin/mentors` elementi: `{ id, phone, firstName, lastName, status, mustChangePassword, lastLoginAt, createdAt, bio, groups: [{ id, name }] }` (faqat ACTIVE guruhlar); `GET /admin/mentors/:id` — xuddi shu. `GET /super/admins` elementi: `{ id, phone, firstName, lastName, status, mustChangePassword, lastLoginAt, createdAt }`.

**Yaratish** — 201, `Cache-Control: no-store`. `password` berilmasa (`null`/yo'q) tizim 10 belgili vaqtinchalik parol yaratadi va u FAQAT shu javobda qaytadi; berilsa (parol siyosati, docs/02 §6) — `temporaryPassword: null`. Har ikki holatda `mustChangePassword: true`. Audit `USER_CREATED` (parolsiz).

```http
POST /super/admins            (SA)       POST /admin/mentors   (SA A)
{ "phone": "+998 90 123-45-67", "firstName": "Vali", "lastName": "Aliyev", "password": null }

201
{ "id": "0190...", "phone": "+998901234567", "temporaryPassword": "q7Lm2xPa9z", "mustChangePassword": true }
409 { "error": { "code": "CONFLICT", "message": "Bu telefon raqam boshqa akkauntda band", "details": { "field": "phone" } } }
```
Student (`POST /admin/students`, namuna yuqorida): `groupId` berilsa guruh ACTIVE bo'lishi shart (aks holda 400 `VALIDATION_ERROR`, `details: [{ field: "groupId" }]`), student shu tranzaksiyada faol a'zo bo'ladi; boshqa faol guruhi bo'lsa — 409 `STUDENT_ALREADY_IN_GROUP` (S-02).

**O'zgartirish / deaktivatsiya** — `PATCH /super/admins/:id`, `PATCH /admin/mentors/:id`: `{ firstName?, lastName?, phone?, status? }`; `PATCH /admin/students/:id`: `{ firstName?, lastName?, status? }` (guruh — `/admin/groups/:id/members`). Kamida bitta maydon (bo'sh body — 400). Javob — yangilangan element (GET bilan bir xil). O'zgarmagan qiymat — no-op (audit yo'q).

```http
PATCH /admin/students/0190...
{ "status": "INACTIVE" }
200 { "id": "0190...", "status": "INACTIVE", ... }
```
- `INACTIVE`: shu tranzaksiyada `token_version++` va barcha refresh tokenlar bekor → eski access va refresh darhol 401, login 401. Student bo'lsa ota-ona sessiyalari darhol 401 (tokenlar bekor qilinmaydi — `parent_token:*:valid` keshiga to'xtatish belgisi qo'yiladi). Audit `USER_DEACTIVATED`.
- `ACTIVE`: `token_version` o'zgarmaydi (yangi login kerak), ota-ona tokenlari qayta ishlaydi. Audit `USER_ACTIVATED`.
- Ism/familiya/telefon: audit `USER_UPDATED` (`before`/`after` faqat o'zgargan maydonlar). Telefon band — 409.

**CSV import** — `POST /admin/students/import` (SA A, S-21), `multipart/form-data`, fayl maydoni `file`. Hajm ≤ `STUDENT_IMPORT_MAX_FILE_BYTES` (standart 1 MiB, oshsa — 413 `PAYLOAD_TOO_LARGE`), ma'lumot qatorlari ≤ `STUDENT_IMPORT_MAX_ROWS` (standart 500).

Fayl formati: UTF-8 (Excel BOM qabul qilinadi), RFC 4180 (`"..."` ichida vergul, `""`, qator o'tishi mumkin), ajratgich `,` yoki `;` (sarlavhadan aniqlanadi). Birinchi qator — sarlavha, ustunlar nomi bo'yicha (tartib va katta-kichik harf ixtiyoriy): `firstName` (majburiy), `lastName` (majburiy), `groupName` (ixtiyoriy — faol guruh nomi, katta-kichik harf farqisiz; bo'sh — guruhsiz). Boshqa ustun — xato. Parol har doim tizim tomonidan yaratiladi.

```csv
firstName,lastName,groupName
Ali,Valiyev,FE-12
Laylo,"Karimova, Sh.",
```

**Hammasi yoki hech narsa:** avval butun fayl tekshiriladi (sarlavha, har bir qator, guruh nomlari — aniq bitta faol guruh mos kelishi shart). Birorta xato bo'lsa hech kim yaratilmaydi va barcha xatolar bitta javobda (`row` — fayldagi qator raqami, 1 = sarlavha, 0 = butun fayl):
```http
400
{ "error": { "code": "VALIDATION_ERROR", "message": "CSV faylda xatolar bor — hech bir student yaratilmadi",
  "details": [ { "row": 3, "field": "lastName", "message": "..." },
               { "row": 5, "field": "groupName", "message": "Bunday nomli faol guruh topilmadi" } ] } }
```
Qatorning boshqa maydoni xato bo'lsa ham `groupName` tekshiriladi (bitta qatorda ikkala xato ham chiqadi). Import paytida (tekshiruvdan keyin, yozishdan oldin) guruh arxivlansa → 409 `GROUP_ARCHIVED` (`details.groups: [{ id, name }]`), hech kim yaratilmaydi.
Muvaffaqiyatda hammasi bitta tranzaksiyada yaratiladi (`Cache-Control: no-store`, parollar FAQAT shu javobda); audit: har biriga `USER_CREATED` + partiyaga `STUDENTS_IMPORTED` (`entity_type = STUDENT_IMPORT`).
```http
201
{ "count": 2, "students": [
  { "id": "0190...", "studentCode": "ST-10246", "firstName": "Ali", "lastName": "Valiyev",
    "groupName": "FE-12", "temporaryPassword": "q7Lm2xPa9z" },
  { "id": "0190...", "studentCode": "ST-10247", "firstName": "Laylo", "lastName": "Karimova, Sh.",
    "groupName": null, "temporaryPassword": "R4tkm8Hs2w" } ] }
```

```http
POST /students/0190.../parent-tokens
{ "label": "Onasi" }

201
{ "id": "0191...", "token": "k2Jd8...", "link": "https://app.example.uz/parent#t=k2Jd8...",
  "prefix": "k2Jd8x", "createdAt": "2026-11-10T08:00:00Z" }
```

### 2.2 Guruhlar va yo'llar ro'yxati (2.3)

**Ruxsat:** `/admin/groups*` — SA va A (docs/01 §2.1); `GET /admin/paths` — SA, A va M (mentor faqat o'qiydi, yozish endpointlari yo'q). Barcha sxemalar `@lms/shared` da (`z.strictObject`). Sana `startsAt` — `YYYY-MM-DD` (`null` — sanasiz), qolgan vaqtlar ISO-8601 UTC. Guruh topilmasa yoki o'chirilgan bo'lsa — 404. O'chirish (DELETE) endpointi yo'q — arxivlash (`status: ARCHIVED`).

```http
GET /admin/paths                         (SA A M; guruh formasi uchun; to'liq kontent CRUD — §3, 3-bosqich)
200 { "items": [ { "id": "0190...", "title": "Frontend dasturchi", "slug": "frontend", "status": "PUBLISHED" } ] }
```

**Ro'yxat** — `GET /admin/groups?q=&status=&mentorId=&pathId=&page=1&pageSize=20` (offset pagination, `q` — nom bo'yicha qism moslik, katta-kichik harf farqisiz; tartib — yangilari birinchi):
```http
200
{ "items": [ { "id": "0190...", "name": "FE-12", "status": "ACTIVE", "startsAt": "2026-12-01",
               "createdAt": "2026-11-11T08:00:00.000Z", "path": { "id": "0190...", "title": "Frontend dasturchi" },
               "mentor": { "id": "0190...", "firstName": "Bobur", "lastName": "Karimov" }, "membersCount": 24 } ],
  "total": 1, "page": 1, "pageSize": 20 }
```
**Tafsilot** — `GET /admin/groups/:id`: ro'yxat elementi + `members` (faol a'zolar, familiya bo'yicha):
```http
200 { "id": "0190...", "name": "FE-12", ..., "membersCount": 1,
      "members": [ { "id": "0190...", "studentCode": "ST-10245", "firstName": "Ali", "lastName": "Valiyev",
                     "status": "ACTIVE", "joinedAt": "2026-11-11T08:00:00.000Z" } ] }
```
Quyidagi barcha mutatsiyalar javobi — shu tafsilot (DELETE dan tashqari). Yozuv va audit bitta tranzaksiyada.

| So'rov | Body | Javob | Xatolar | Audit |
|---|---|---|---|---|
| `POST /admin/groups` | `{ name, pathId, mentorId?, startsAt? }` | 201 | 400 `details[].field = pathId` (yo'l yo'q) / `mentorId` (faol MENTOR emas) | `GROUP_CREATED` |
| `PATCH /admin/groups/:id` | `{ name?, status?: ACTIVE\|ARCHIVED, startsAt? }` (kamida bittasi) | 200 | — (o'zgarmagan qiymat — no-op) | `GROUP_UPDATED` (oldin/keyin) |
| `PUT /admin/groups/:id/mentor` | `{ mentorId: uuid \| null }` | 200 | 400 `mentorId` (faol MENTOR emas) | `GROUP_MENTOR_ASSIGNED` |
| `POST /admin/groups/:id/members` | `{ studentIds: uuid[] }` (1–100, takrorsiz) | 200 | 400 `studentIds.<i>` (student topilmadi), 409 `STUDENT_ALREADY_IN_GROUP`, 409 `GROUP_ARCHIVED` | `GROUP_MEMBERS_ADDED` |
| `DELETE /admin/groups/:id/members/:studentId` | — | 204 | 404 (faol a'zo emas) | `GROUP_MEMBER_REMOVED` |

```http
POST /admin/groups/0190.../members
{ "studentIds": ["0190...a", "0190...b"] }
409 { "error": { "code": "STUDENT_ALREADY_IN_GROUP", "message": "Student allaqachon boshqa faol guruhda",
                 "details": { "studentIds": ["0190...b"] } } }
```
- S-02 A: student faqat bitta faol guruhda (shu guruh ham hisoblanadi). "Ko'chirish" yo'q — avval `DELETE`, keyin `POST`. Chiqarishda yozuv o'chirilmaydi (`left_at = now()`).
- Arxivlangan guruhga a'zo qo'shib bo'lmaydi (409 `GROUP_ARCHIVED`); arxivlashda mavjud a'zoliklar o'zgarmaydi (qayta faollashtirish mumkin), lekin guruh mentor scope'idan chiqadi. Arxivlangan guruh a'zosini boshqa guruhga o'tkazish uchun avval chiqarish kerak.
- Mentor scope keshi (`mentor:{id}:studentIds`, 60 s) a'zolik o'zgarganda, mentor almashtirilganda, guruh holati o'zgarganda, yangi student guruh bilan yaratilganda/import qilinganda va mentor deaktivatsiya qilinganda darhol invalidatsiya qilinadi (S-10 A).
- Invalidatsiya commit'dan keyin bajariladi: baza yozilgan bo'lsa javob ham muvaffaqiyatli (Redis xatosi 500 bermaydi — qisqa backoff bilan qayta urinish, so'ng `error` log). Shuning uchun **eng katta eskirish — 60 s** (kesh TTL'i). Poyga himoyasi: `mentor:{id}:gen` generatsiya hisoblagichi — invalidatsiyadan oldin bazadan o'qilgan eski to'plam keshga yozilmaydi.
- Parallel o'zgarishlar (a'zo qo'shish/chiqarish, PATCH, mentor biriktirish) guruh qatorini `FOR UPDATE` bilan qulflaydi — ketma-ket bajariladi. 409 `STUDENT_ALREADY_IN_GROUP` `details.studentIds` da faqat haqiqatan to'qnashgan studentlar.
- Student deaktivatsiyasi faol a'zolikka tegmaydi (qaytariladigan amal, S-08 A); mentor uni `INACTIVE` holati bilan ko'radi. Mentor deaktivatsiyasida `mentor_id` guruhlarda qoladi.

```http
GET /me/summary
200 { "xp": 12450, "weeklyXp": 820, "coin": 340, "streak": { "current": 12, "activeToday": true },
      "unreadNotifications": 3, "league": { "tier": "Kumush", "rank": 5 } }
```

---

## 3. Kontent: ilm yo'li (admin)

> 2-bosqichda faqat `GET /admin/paths` (SA A M, qisqa ro'yxat — §2.2) amalga oshirilgan; mentor uchun faqat o'qish. Qolganlari — 3-bosqich.

| Method | Yo'l | Kim |
|---|---|---|
| GET/POST | `/admin/paths` | SA A (GET: M ham) |
| GET/PATCH/DELETE | `/admin/paths/:id` | SA A |
| POST | `/admin/paths/:id/publish` | SA A |
| GET | `/admin/paths/:id/tree` | SA A M |
| POST | `/admin/paths/:id/sections` | SA A |
| PATCH/DELETE | `/admin/sections/:id` | SA A |
| PUT | `/admin/paths/:id/sections/order` | SA A |
| POST | `/admin/sections/:id/topics` | SA A |
| PATCH/DELETE | `/admin/topics/:id` | SA A |
| PUT | `/admin/sections/:id/topics/order` | SA A |
| POST | `/admin/topics/:id/lessons` | SA A |
| GET/PATCH/DELETE | `/admin/lessons/:id` | SA A |
| PUT | `/admin/topics/:id/lessons/order` | SA A |
| POST | `/admin/sections/:id/chests` | SA A |
| PATCH/DELETE | `/admin/chests/:id` | SA A |
| GET/POST | `/admin/skills` | SA A |
| PATCH/DELETE | `/admin/skills/:id` | SA A |
| PUT | `/admin/topics/:id/skills` | SA A |

```http
PUT /admin/sections/0190.../topics/order
{ "topicIds": ["t3", "t1", "t2"] }
204
```

## 4. Ilm yo'li (student)

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/student/path` | S |
| GET | `/student/topics/:id` | S |
| GET | `/student/lessons/:id` | S |
| POST | `/student/lessons/:id/start` | S |
| POST | `/student/lessons/:id/complete` | S |
| POST | `/student/chests/:id/open` | S |

```http
GET /student/path
200
{ "path": { "id": "p1", "title": "Frontend dasturchi", "progress": 0.34 },
  "reviewBlock": { "blocked": true, "dueCount": 2 },
  "sections": [
    { "id": "s1", "title": "HTML asoslari", "progress": 1.0,
      "nodes": [
        { "kind": "TOPIC", "id": "t1", "title": "Teglar", "status": "COMPLETED", "lessons": 3, "lessonsCompleted": 3 },
        { "kind": "CHEST", "id": "c1", "status": "READY" },
        { "kind": "TOPIC", "id": "t2", "title": "Formalar", "status": "IN_PROGRESS", "lessons": 4, "lessonsCompleted": 1 }
      ] } ] }
```

```http
POST /student/lessons/l5/start
409 { "error": { "code": "REVIEW_REQUIRED", "message": "Avval takrorlashlarni bajaring",
                  "details": { "due": [ { "topicId": "t1", "title": "Teglar" } ] } } }
```

```http
POST /student/lessons/l2/complete
200 { "lessonStatus": "COMPLETED", "topicStatus": "IN_PROGRESS",
      "rewards": [ { "type": "XP", "amount": 20 }, { "type": "COIN", "amount": 5 } ],
      "next": { "lessonId": "l3" } }
```

```http
POST /student/chests/c1/open
200 { "xp": 50, "coin": 30 }
```

---

## 5. Savollar bazasi

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/admin/questions?topicId&type&status&usage&q` | SA A (M: faqat ko'rish) |
| POST | `/admin/questions` | SA A |
| GET/PATCH | `/admin/questions/:id` | SA A |
| POST | `/admin/questions/:id/archive` | SA A |
| POST | `/admin/questions/import` | SA A |
| GET | `/student/lessons/:id/questions` | S |
| POST | `/student/answers` | S |

```http
POST /admin/questions
{ "topicId": "t1", "lessonId": "l1", "type": "SINGLE_CHOICE", "difficulty": 1,
  "promptMd": "Qaysi teg eng katta sarlavha?", "explanationMd": "`<h1>` eng katta.",
  "usage": { "lesson": true, "review": true, "quiz": true, "battle": true },
  "options": [ { "textMd": "<h1>", "isCorrect": true }, { "textMd": "<h6>", "isCorrect": false } ] }
201 { "id": "q1", "status": "DRAFT" }
```

```http
GET /student/lessons/l1/questions
200 { "items": [ { "id": "q1", "type": "SINGLE_CHOICE", "promptMd": "...",
                   "options": [ { "id": "o1", "textMd": "<h1>" }, { "id": "o2", "textMd": "<h6>" } ] } ] }
```

```http
POST /student/answers
{ "questionId": "q1", "context": "LESSON", "contextId": "l1", "answer": { "optionId": "o1" }, "timeMs": 5400 }
200 { "isCorrect": true, "correctAnswer": { "optionIds": ["o1"] }, "explanationMd": "...",
      "firstAttempt": true, "rewards": [ { "type": "XP", "amount": 5 } ] }
```

---

## 6. Gamifikatsiya va sozlamalar

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/admin/settings/rewards` | SA A |
| PUT | `/admin/settings/rewards` | SA A |
| GET | `/admin/settings/rewards/history` | SA A |
| GET/PUT | `/super/settings` | SA |
| GET | `/admin/students/:id/transactions?type` | SA A |
| POST | `/admin/students/:id/adjustments` | SA A |
| GET/POST | `/admin/achievements` | SA A |
| PATCH/DELETE | `/admin/achievements/:id` | SA A |
| GET/POST | `/admin/league-tiers` | SA A |
| PATCH | `/admin/league-tiers/:id` | SA A |
| GET | `/admin/leagues/current` | SA A |
| GET | `/student/achievements` | S |
| GET | `/student/streak` | S |

```http
PUT /admin/settings/rewards
{ "values": { "lesson.complete.xp": 20, "lesson.complete.coin": 5, "battle.win.xp": 30 } }
200 { "updated": 3 }
```

```http
POST /admin/students/0190.../adjustments
{ "currency": "COIN", "amount": -50, "reason": "Xato berilgan sandiq mukofoti" }
201 { "transactionId": 98123, "balanceAfter": 290 }
```

---

## 7. Takrorlash, missiya, quiz

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/student/reviews/due` | S |
| GET | `/student/reviews/schedule` | S |
| POST | `/student/reviews/sessions` | S |
| POST | `/student/reviews/sessions/:id/finish` | S |
| GET | `/student/missions/today` | S |
| POST | `/student/missions/:id/claim` | S |
| GET | `/student/quizzes/weekly/current` | S |
| POST | `/student/quizzes/:id/attempts` | S |
| POST | `/student/quiz-attempts/:id/finish` | S |
| GET | `/student/quizzes/history` | S |

```http
POST /student/reviews/sessions
{ "topicId": "t1" }
201 { "sessionId": "rs1", "questions": [ { "id": "q4", "type": "TRUE_FALSE", "promptMd": "..." } ] }

POST /student/reviews/sessions/rs1/finish
200 { "scorePercent": 80, "grade": 4, "nextDueDate": "2026-11-16", "intervalDays": 6,
      "rewards": [ { "type": "XP", "amount": 15 } ] }
```

```http
GET /student/missions/today
200 { "date": "2026-11-10", "endsAt": "2026-11-10T19:00:00Z",
      "items": [
        { "id": "dm1", "type": "REVIEW", "target": 2, "progress": 1, "rewards": { "xp": 10, "coin": 2 }, "completed": false },
        { "id": "dm2", "type": "NEW_LESSON", "target": 1, "progress": 0, "rewards": { "xp": 10, "coin": 2 }, "completed": false } ],
      "allBonus": { "xp": 20, "coin": 10 } }
```

---

## 8. Liga va reyting

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/student/league/current` | S |
| GET | `/student/league/history` | S |

```http
GET /student/league/current
200 { "tier": { "name": "Kumush", "order": 2 }, "weekStart": "2026-11-09", "endsAt": "2026-11-15T19:00:00Z",
      "promoteCount": 7, "demoteCount": 5, "myRank": 5,
      "rows": [ { "rank": 1, "studentId": "...", "name": "Dilnoza R.", "avatarUrl": "...", "weeklyXp": 1320 } ] }
```

---

## 9. Bellashuv (REST qismi)

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/student/battles?cursor` | S |
| GET | `/student/battles/stats` | S |
| GET | `/student/battles/:id` | S (ishtirokchi) |
| POST | `/student/battles/invites` | S |
| DELETE | `/student/battles/invites/:code` | S (taklif egasi) |
| GET | `/student/battles/invites/:code` | S |

```http
POST /student/battles/invites
201 { "code": "K7P2QX", "link": "https://app.example.uz/battle/join/K7P2QX", "expiresAt": "2026-11-10T08:10:00Z" }
```
Qo'shilish va o'yin jarayoni WebSocket orqali bo'ladi (§17).

---

## 10. Kod maydoni

| Method | Yo'l | Kim |
|---|---|---|
| GET/POST | `/student/snippets` | S |
| GET/PATCH/DELETE | `/student/snippets/:id` | S |

```http
POST /student/snippets
{ "title": "Birinchi sahifa", "language": "WEB",
  "files": { "index.html": "<h1>Salom</h1>", "style.css": "", "script.js": "" } }
201 { "id": "cs1", "updatedAt": "..." }
```

---

## 11. Portfolio va sertifikatlar

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/student/portfolio` | S |
| GET | `/student/portfolio/activity?from&to` | S |
| GET | `/student/portfolio/growth?period=12w` | S |
| PUT | `/student/portfolio/share` | S |
| POST | `/student/portfolio/export` | S (asinxron PDF) |
| GET | `/student/exports/:id` | S |
| GET/POST | `/student/projects` | S |
| GET/PATCH/DELETE | `/student/projects/:id` | S |
| POST | `/student/projects/:id/submit` | S |
| GET | `/student/certificates` | S |
| GET | `/student/certificates/:id/download` | S |
| GET | `/mentor/projects?status=SUBMITTED` | M |
| POST | `/mentor/projects/:id/review` | M |
| GET/POST | `/admin/certificates` | SA A |
| POST | `/admin/certificates/:id/revoke` | SA A |
| GET | `/public/portfolio/:slug` | PUB |
| GET | `/public/certificates/:serial` | PUB |

```http
GET /student/portfolio
200 { "stats": { "masteredTopics": 18, "skills": 5, "activeDays": 47, "firstTryAccuracy": 0.78 },
      "skills": [ { "id": "sk1", "name": "HTML", "level": 0.9 } ],
      "projects": [ { "id": "pr1", "title": "Landing page", "status": "REVIEWED", "score": 86 } ],
      "achievements": [ { "code": "STREAK_7", "title": "7 kunlik olov", "unlockedAt": "..." } ],
      "certificates": [ { "id": "c1", "title": "HTML asoslari", "serial": "ICO-2026-000123" } ],
      "share": { "enabled": true, "url": "https://app.example.uz/p/k3J9xQ2a" } }
```

```http
POST /mentor/projects/pr1/review
{ "decision": "REVIEWED", "score": 86, "feedback": "Yaxshi, responsive qismini yaxshilang" }
200 { "status": "REVIEWED", "rewards": [ { "type": "XP", "amount": 86 } ] }
```

---

## 12. Mentor sahifasi: guruhlar, studentlar

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/mentor/dashboard` | M |
| GET | `/mentor/groups` | M |
| GET | `/mentor/groups/:id` | M |
| GET | `/mentor/groups/:id/students?sort` | M |
| GET | `/mentor/students/:id` | M |
| GET | `/mentor/students/:id/progress` | M |
| GET | `/mentor/students/:id/activity` | M |
| GET | `/mentor/students/:id/results` | M |
| GET | `/student/mentor` | S |

Mentor faqat o'z **ACTIVE** guruhlarini ko'radi (boshqa mentorning yoki arxivlangan guruh — 404). Student endpointlari (`/mentor/students/:id*`, `/students/:id/reset-password`, `/students/:id/parent-tokens*`) — `@StudentScope`: student mentorning ACTIVE guruhining faol a'zosi bo'lmasa — 404 (docs/01 §3.1, S-10 A). 2.3 da progress, XP, streak, davomat qaytarilmaydi (keyingi bosqichlarda qo'shiladi); `?sort` hozircha yo'q (tartib — familiya).

```http
GET /mentor/groups
200 { "items": [ { "id": "0190...", "name": "FE-12", "status": "ACTIVE", "startsAt": "2026-12-01",
                   "path": { "id": "0190...", "title": "Frontend dasturchi" }, "studentsCount": 24 } ] }

GET /mentor/groups/0190...            → xuddi shu element (o'ziniki bo'lmasa — 404)

GET /mentor/groups/0190.../students
200 { "items": [ { "id": "0190...", "studentCode": "ST-10245", "firstName": "Ali", "lastName": "Valiyev",
                   "status": "ACTIVE", "lastLoginAt": "2026-11-10T06:12:00.000Z" } ] }

GET /mentor/students/0190...
200 { "id": "0190...", "studentCode": "ST-10245", "firstName": "Ali", "lastName": "Valiyev", "status": "ACTIVE",
      "lastLoginAt": "2026-11-10T06:12:00.000Z", "group": { "id": "0190...", "name": "FE-12" }, "parentTokensCount": 1 }
```

## 13. Chat, meeting, davomat, materiallar

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/chat/conversations` | M S |
| POST | `/chat/conversations` | M (body: studentId) |
| GET | `/chat/conversations/:id/messages?before&limit` | M S (ishtirokchi), SA (audit) |
| POST | `/chat/conversations/:id/messages` | M S (WS'ga fallback) |
| PATCH/DELETE | `/chat/messages/:id` | Muallif |
| GET/POST | `/mentor/meetings` | M |
| PATCH/DELETE | `/mentor/meetings/:id` | M |
| POST | `/mentor/meetings/:id/start` | M |
| POST | `/mentor/meetings/:id/end` | M |
| GET | `/student/meetings?scope=upcoming\|past` | S |
| POST | `/meetings/:id/join-token` | M S |
| POST | `/webhooks/livekit` | Provayder (imzo bilan) |
| GET/PUT | `/mentor/meetings/:id/attendance` | M |
| GET/POST | `/mentor/materials` | M |
| PATCH/DELETE | `/mentor/materials/:id` | M |
| GET | `/student/materials` | S |

```http
POST /mentor/meetings
{ "groupId": "g1", "title": "Flexbox amaliyot", "startsAt": "2026-11-12T14:00:00Z", "durationMin": 60 }
201 { "id": "mt1", "status": "SCHEDULED", "roomName": "mt1-x8k2" }
```

```http
POST /meetings/mt1/join-token
200 { "provider": "LIVEKIT", "url": "wss://livekit.example.uz", "token": "eyJ..." }
```

```http
PUT /mentor/meetings/mt1/attendance
{ "items": [ { "studentId": "s1", "status": "PRESENT" }, { "studentId": "s2", "status": "EXCUSED", "note": "Kasal" } ] }
200 { "saved": 2 }
```

---

## 14. Blog

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/blog/posts?cursor&authorId&groupOnly` | S M A SA |
| GET | `/blog/posts/:id` | S M A SA |
| POST | `/blog/posts` | S |
| PATCH/DELETE | `/blog/posts/:id` | Muallif |
| POST/DELETE | `/blog/posts/:id/like` | S |
| GET | `/blog/posts/:id/comments?cursor` | S M A SA |
| POST | `/blog/posts/:id/comments` | S |
| DELETE | `/blog/comments/:id` | Muallif |
| POST | `/blog/reports` | S |
| GET | `/admin/blog/reports?status` | SA A |
| PATCH | `/admin/blog/reports/:id` | SA A |
| PATCH | `/admin/blog/posts/:id/status` | SA A |
| PATCH | `/admin/blog/comments/:id/status` | SA A |
| POST | `/admin/users/:id/blog-ban` | SA A |

```http
POST /blog/posts
{ "title": "Birinchi loyiham", "body": "Bugun landing page tugatdim!", "imageFileId": "f1" }
201 { "id": "bp1", "status": "PUBLISHED", "createdAt": "..." }
```

---

## 15. Shop

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/shop/products` | S (A SA ham) |
| POST | `/shop/orders` | S (`Idempotency-Key`) |
| GET | `/shop/orders/me` | S |
| POST | `/shop/orders/:id/cancel` | S (PENDING) |
| GET/POST | `/admin/shop/products` | SA A |
| PATCH/DELETE | `/admin/shop/products/:id` | SA A |
| GET | `/admin/shop/orders?status` | SA A |
| PATCH | `/admin/shop/orders/:id/status` | SA A |

```http
POST /shop/orders
Idempotency-Key: 6c1f...
{ "productId": "sp1", "quantity": 1 }
201 { "id": "so1", "status": "PENDING", "totalCoin": 150, "balanceAfter": 190 }
409 { "error": { "code": "INSUFFICIENT_COINS", "message": "Coin yetarli emas", "details": { "balance": 90, "required": 150 } } }
```

---

## 16. Bildirishnomalar, fayllar, hisobotlar, audit, ota-ona

| Method | Yo'l | Kim |
|---|---|---|
| GET | `/notifications?cursor` | SA A M S |
| POST | `/notifications/:id/read` | SA A M S |
| POST | `/notifications/read-all` | SA A M S |
| POST | `/files/upload-url` | SA A M S |
| POST | `/files/:id/confirm` | Egasi |
| GET | `/files/:id/download-url` | Resursga ruxsati borlar |
| GET | `/admin/dashboard` | SA A |
| GET | `/admin/reports/:type?from&to&groupId&format=csv` | SA A (M: o'z guruhi, S-21) |
| GET | `/super/audit-logs` | SA |
| GET | `/parent/children` | P |
| GET | `/parent/children/:id/overview` | P |
| GET | `/parent/children/:id/progress` | P |
| GET | `/parent/children/:id/activity` | P |
| GET | `/parent/children/:id/results` | P |
| GET | `/parent/children/:id/attendance` | P |
| GET | `/parent/children/:id/battles` | P |
| GET | `/parent/children/:id/portfolio` | P |
| GET | `/parent/children/:id/transactions` | P |
| GET | `/health`, `/ready` | PUB (ichki) |

```http
POST /files/upload-url
{ "purpose": "BLOG_IMAGE", "mime": "image/jpeg", "sizeBytes": 812345 }
200 { "fileId": "f1", "uploadUrl": "https://s3.../...?X-Amz-Signature=...", "method": "PUT", "expiresIn": 300 }
```

```http
GET /parent/children/s1/overview
200 { "student": { "firstName": "Ali", "lastName": "Valiyev", "groupName": "FE-12", "mentorName": "Bobur K." },
      "path": { "title": "Frontend dasturchi", "progress": 0.34 },
      "xp": { "total": 12450, "thisWeek": 820 }, "coin": 340,
      "streak": { "current": 12, "longest": 30 }, "league": { "tier": "Kumush", "rank": 5 },
      "attendanceRate": 0.92, "lastActiveAt": "2026-11-10T06:12:00Z" }
```

---

## 17. WebSocket (Socket.IO)

**Ulanish:** `wss://api.<domen>/socket.io`, `auth: { token: <access> }`. Har bir foydalanuvchi avtomatik ravishda `user:{id}` xonasiga qo'shiladi. Token muddati tugasa, server `auth:expired` yuboradi va klient token yangilab qayta ulanadi.

**Namespace'lar:** `/rt` (bildirishnoma, hamyon, chat) va `/battle`.

### 17.1 `/rt` — umumiy

| Yo'nalish | Event | Payload | Kim |
|---|---|---|---|
| S → C | `notification:new` | `{id, type, title, body, data, createdAt}` | Hamma |
| S → C | `wallet:updated` | `{xp, weeklyXp, coin, delta:{xp, coin}, source}` | S |
| S → C | `streak:updated` | `{current, activeToday}` | S |
| S → C | `achievement:unlocked` | `{code, title, icon}` | S |
| S → C | `league:rank_changed` | `{rank}` | S |
| S → C | `meeting:started` | `{meetingId, title}` | S (guruh) |
| C → S | `chat:send` | `{conversationId, clientId, body, attachmentFileId?}` | M S |
| S → C | `chat:ack` | `{clientId, message}` | M S |
| S → C | `chat:message` | `{message}` | M S |
| C ↔ S | `chat:typing` | `{conversationId[, userId]}` | M S |
| C ↔ S | `chat:read` | `{conversationId, lastMessageId[, userId]}` | M S |
| S → C | `presence:update` | `{userId, online}` | M S |
| S → C | `auth:expired` | `{}` | Hamma |

### 17.2 `/battle`

| Yo'nalish | Event | Payload |
|---|---|---|
| C → S | `battle:queue:join` | `{}` |
| C → S | `battle:queue:leave` | `{}` |
| S → C | `battle:queue:status` | `{waitingSec, widened}` |
| C → S | `battle:invite:join` | `{code}` |
| S → C | `battle:invite:accepted` | `{battleId}` (taklif egasiga) |
| S → C | `battle:matched` | `{battleId, opponent:{name, avatarUrl, tier, isBot}, questionCount}` |
| C → S | `battle:ready` | `{battleId}` |
| S → C | `battle:countdown` | `{startsAt}` |
| S → C | `battle:question` | `{index, question:{id, type, promptMd, options[]}, deadline}` |
| C → S | `battle:answer` | `{battleId, index, answer}` |
| S → C | `battle:opponent_answered` | `{index}` |
| S → C | `battle:question_result` | `{index, correctAnswer, you:{correct, points}, opponent:{correct, points}, score:{you, opponent}}` |
| S → C | `battle:opponent_disconnected` | `{graceUntil}` |
| S → C | `battle:opponent_reconnected` | `{}` |
| C → S | `battle:resume` | `{battleId}` |
| S → C | `battle:state` | `{status, index, score, question?, deadline?}` |
| S → C | `battle:finished` | `{result:"WIN"\|"LOSS"\|"DRAW", reason, score, rewards:{xp, coin}}` |
| S → C | `battle:error` | `{code, message}` |

Barcha C → S eventlar `ack` callback bilan `{ok:true}` yoki `{ok:false, error}` qaytaradi. Event'lar uchun rate limit qo'yiladi.

---

## Ochiq savollar (shu modul)

- **S-21** Hisobot turlari va mentor hisobotlari (`/admin/reports/:type`) qanday bo'ladi?
- **S-47** Chat xabarlarini tahrirlash va o'chirish kerakmi (`PATCH/DELETE /chat/messages/:id`)?
- **S-63** API versiyalash va mobil ilova rejasi (`/api/v1`, public API kerakmi)?
