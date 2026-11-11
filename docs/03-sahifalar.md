# 03. Sahifalar

> **Qisqa mazmun:** Har bir rol uchun barcha sahifalar. Har bir sahifada: maqsad, ko'rsatiladigan ma'lumotlar, amallar va kerakli API'lar. API yo'llari `/api/v1` prefiksisiz yozilgan (batafsil: 12-api).

---

## 0. Umumiy elementlar

### Layout'lar
| Layout | Kim | Tarkibi |
|---|---|---|
| `AuthLayout` | Public | Login formalar |
| `StudentLayout` | Student | **Yuqori panel (doim):** streak 🔥, XP, coin, bildirishnomalar qo'ng'irog'i, avatar. Yon/pastki menyu: Ilm yo'li, Bugungi missiya, Takrorlash, Liga, Bellashuv, Kod maydoni, Portfolio, Blog, Mentor, Shop |
| `MentorLayout` | Mentor | Menyu: Dashboard, Guruhlar, Studentlar, Chat, Meetinglar, Materiallar, Portfolio baholash, Bildirishnomalar |
| `AdminLayout` | Admin, super admin | Menyu: Dashboard, Foydalanuvchilar, Guruhlar, Kontent, Savollar, Gamifikatsiya, Shop, Blog moderatsiyasi, Hisobotlar, (super admin: Adminlar, Tizim sozlamalari, Audit) |
| `ParentLayout` | Ota-ona | Farzand tanlash, read-only bo'limlar |

Yuqori panel ma'lumotlari: `GET /me/summary` → `{xp, coin, streak, unreadNotifications}`. Ular Socket.IO `wallet:updated`, `streak:updated`, `notification:new` eventlari bilan real-time yangilanadi.

---

## 1. Public sahifalar

| Sahifa | Yo'l | Maqsad | Amallar | API |
|---|---|---|---|---|
| Staff login | `/login/staff` | Admin/mentor kirishi | Telefon + parol | `POST /auth/staff/login` |
| Student login | `/login` | Student kirishi | ID + parol | `POST /auth/student/login` |
| Parolni almashtirish | `/change-password` | Birinchi kirishda majburiy | Eski va yangi parol | `POST /auth/change-password` |
| Ota-ona kirishi | `/parent` | Token bilan kirish | Token kiritish yoki havola | `POST /auth/parent/exchange` |
| Public portfolio | `/p/:slug` | Ulashilgan portfolio | Ko'rish, PDF yuklab olish | `GET /public/portfolio/:slug` |
| Sertifikatni tekshirish | `/verify/:serial` | Sertifikat haqiqiyligini tekshirish | Ko'rish | `GET /public/certificates/:serial` |

- **Taxmin:** Sertifikatni public tekshirish sahifasi bo'ladi (tavsifda yo'q, lekin ulashiladigan sertifikat uchun odatiy talab). → S-54

---

## 2. Student sahifalari

### 2.1 Ilm yo'li (xarita) — `/path`
- **Maqsad:** Asosiy sahifa. Uzun yo'l: mavzular zanjiri, orada sandiqlar.
- **Ma'lumotlar:** yo'l nomi, umumiy progress (%), bo'limlar, mavzu tugunlari (holatlari: `LOCKED / AVAILABLE / IN_PROGRESS / COMPLETED`), sandiqlar (`LOCKED / READY / OPENED`), joriy pozitsiya, "Takrorlash kerak" belgisi (yangi dars bloklangan bo'lsa).
- **Amallar:** mavzuni ochish → dars, sandiqni ochish, joriy joyga scroll.
- **API:** `GET /student/path` (bitta so'rovda butun xarita, keshlanadi), `POST /student/chests/:id/open`.

### 2.2 Mavzu / dars — `/path/topics/:topicId`, `/lessons/:lessonId`
- **Maqsad:** Darsni o'qish va dars savollariga javob berish.
- **Ma'lumotlar:** mavzu darslari ro'yxati, dars matni (Markdown, kod bloklari bilan), video havola (embed), dars oxiridagi savollar, mukofot (XP/coin) ko'rinishi.
- **Amallar:** o'qish, savolga javob berish (darhol feedback va izoh), darsni yakunlash, keyingi darsga o'tish, kod blokini "Kod maydonida ochish".
- **API:** `GET /student/topics/:id`, `GET /student/lessons/:id`, `POST /student/lessons/:id/start`, `POST /student/answers` (`context=LESSON`), `POST /student/lessons/:id/complete`.

### 2.3 Takrorlash — `/review`
- **Maqsad:** Muddati kelgan mavzularni takrorlash (spaced repetition).
- **Ma'lumotlar:** bugun muddati kelgan mavzular, kechikkanlar, keyingi takrorlash sanalari.
- **Amallar:** takrorlash sessiyasini boshlash (mavzudan N ta savol), javob berish, yakunlash. Natijada keyingi sana hisoblanadi.
- **API:** `GET /student/reviews/due`, `POST /student/reviews/sessions`, `POST /student/answers` (`context=REVIEW`), `POST /student/reviews/sessions/:id/finish`.

### 2.4 Bugungi missiya — `/today`
- **Maqsad:** Kunlik vazifalar: takrorlash, yangi dars, (hafta davomida) haftalik quiz.
- **Ma'lumotlar:** missiyalar ro'yxati va progress, mukofotlar, streak holati, kun tugashiga qolgan vaqt.
- **Amallar:** missiyaga o'tish (deep link), bajarilgan missiya mukofotini olish.
- **API:** `GET /student/missions/today`, `POST /student/missions/:id/claim`.

### 2.5 Haftalik quiz — `/quiz/weekly`
- **Ma'lumotlar:** joriy hafta quizi, urinish holati, o'tgan haftalar natijalari.
- **Amallar:** boshlash, javob berish, yakunlash.
- **API:** `GET /student/quizzes/weekly/current`, `POST /student/quizzes/:id/attempts`, `POST /student/answers` (`context=QUIZ`), `POST /student/quiz-attempts/:id/finish`.

### 2.6 Liga va reyting — `/league`
- **Ma'lumotlar:** joriy liga (Bronza…), cohort'dagi o'rinlar jadvali (haftalik XP), ko'tarilish/tushish chegaralari, hafta tugashiga qolgan vaqt, o'tgan haftalar tarixi.
- **Amallar:** ko'rish. Boshqa studentning public profilini ochish (Taxmin).
- **API:** `GET /student/league/current`, `GET /student/league/history`.

### 2.7 Bellashuv — `/battle`, `/battle/:id`
- **Ma'lumotlar:** bellashuv statistikasi (g'alaba/mag'lubiyat), oxirgi o'yinlar, kelgan takliflar.
- **Amallar:** "Raqib qidirish", "Do'stni taklif qilish" (kod/havola), kodni kiritib qo'shilish, o'yin jarayoni (real-time), natija.
- **API:** `GET /student/battles`, `GET /student/battles/stats`, `POST /student/battles/invites`, `POST /student/battles/invites/:code/accept`. WebSocket: `battle:*` eventlari (06-bellashuv).

### 2.8 Kod maydoni — `/playground`, `/playground/:snippetId`
- **Ma'lumotlar:** editor (til tanlash: HTML/CSS/JS, Python), natija oynasi (iframe) yoki terminal, saqlangan snippetlar.
- **Amallar:** kod yozish, ishga tushirish, to'xtatish, saqlash, nomini o'zgartirish, o'chirish.
- **API:** `GET/POST/PATCH/DELETE /student/snippets[/:id]`. Kodni ishga tushirish brauzerda bo'ladi, serverga so'rov ketmaydi (07).

### 2.9 Portfolio — `/portfolio`
- **Ma'lumotlar:** umumiy statistika (o'zlashtirilgan mavzular, ko'nikmalar, faol kunlar, 1-urinishdagi to'g'ri javob foizi), o'sish grafigi (XP/mavzular vaqt bo'yicha), kunlik reja, faollik kalendari (heatmap), ko'nikmalar, loyihalar (mentor bahosi bilan), yutuqlar, sertifikatlar.
- **Amallar:** loyiha qo'shish/tahrirlash/topshirish, ulashish havolasini yoqish/o'chirish, PDF yuklab olish, sertifikatni yuklab olish.
- **API:** `GET /student/portfolio`, `GET /student/portfolio/activity?from&to`, `GET /student/portfolio/growth`, `GET/POST/PATCH/DELETE /student/projects[/:id]`, `POST /student/projects/:id/submit`, `PUT /student/portfolio/share`, `GET /student/portfolio/export.pdf`, `GET /student/certificates/:id/download`.

### 2.10 Blog — `/blog`, `/blog/:postId`, `/blog/new`
- **Ma'lumotlar:** lenta (postlar: rasm, sarlavha, tavsif, muallif, like/komment soni), post sahifasi va kommentlar.
- **Amallar:** post yaratish (rasm yuklash), tahrirlash, o'chirish, like/unlike, komment yozish/o'chirish, shikoyat qilish.
- **API:** `GET /blog/posts`, `GET /blog/posts/:id`, `POST /blog/posts`, `PATCH/DELETE /blog/posts/:id`, `POST/DELETE /blog/posts/:id/like`, `GET/POST /blog/posts/:id/comments`, `DELETE /blog/comments/:id`, `POST /blog/reports`, `POST /files/upload-url`.

### 2.11 Mentor sahifasi — `/my-mentor` (S-69)
Tablar:
- **Chat** — mentor bilan 1:1 real-time chat. API: `GET /chat/conversations/me`, `GET /chat/conversations/:id/messages?cursor`, `POST /chat/conversations/:id/messages`, WS `chat:*`.
- **Meetinglar** — kelgusi va o'tgan meetinglar, "Qo'shilish" tugmasi, o'z davomati. API: `GET /student/meetings`, `POST /meetings/:id/join-token`.
- **Materiallar** — guruh materiallari (fayl/havola). API: `GET /student/materials`, `GET /files/:id/download-url`.
- **Mentor profili** — ism, rasm, bio, ko'nikmalar. API: `GET /student/mentor`.

### 2.12 Shop — `/shop`, `/shop/orders`
- **Ma'lumotlar:** mahsulotlar (rasm, nom, narx coin'da, qoldiq), coin balansi, buyurtmalar tarixi va statusi.
- **Amallar:** sotib olish (tasdiqlash oynasi bilan), pending buyurtmani bekor qilish.
- **API:** `GET /shop/products`, `POST /shop/orders`, `GET /shop/orders/me`, `POST /shop/orders/:id/cancel`.

### 2.13 Profil — `/profile`
- **Ma'lumotlar:** ism, avatar, student ID, guruh, mentor, XP/coin tarixi (tranzaksiyalar), faol sessiyalar.
- **Amallar:** avatar va bio'ni o'zgartirish, parolni o'zgartirish, sessiyalarni bekor qilish.
- **API:** `GET /auth/me`, `PATCH /me/profile`, `GET /me/transactions?type=xp|coin`, `POST /auth/change-password`, `GET/DELETE /auth/sessions`.
- **Taxmin:** Student ismini o'zi o'zgartira olmaydi, buni faqat admin qiladi. → S-08

### 2.14 Bildirishnomalar — `/notifications` (va yuqori paneldagi dropdown)
- **Ma'lumotlar:** bildirishnomalar ro'yxati (yangi dars ochildi, takrorlash vaqti keldi, mentor xabari, meeting eslatmasi, liga natijasi, bellashuv taklifi, buyurtma statusi, blog like/komment).
- **Amallar:** o'qilgan deb belgilash, barchasini o'qilgan qilish, deep link orqali o'tish.
- **API:** `GET /notifications?cursor`, `POST /notifications/:id/read`, `POST /notifications/read-all`, WS `notification:new`.
- **Taxmin:** Faqat in-app bildirishnomalar. Telegram/web push keyinroq qo'shiladi. → S-20

---

## 3. Mentor sahifalari

| Sahifa | Yo'l | Ma'lumotlar | Amallar | API |
|---|---|---|---|---|
| Dashboard | `/mentor` | Guruhlar soni, bugungi meetinglar, o'qilmagan xabarlar, baholanmagan loyihalar, "xavf ostidagi" studentlar (streak uzilgan, ko'p kun faol emas) | Tez o'tish | `GET /mentor/dashboard` |
| Guruhlar | `/mentor/groups` | O'z guruhlari: nom, yo'l, studentlar soni, o'rtacha progress | Guruhni ochish | `GET /mentor/groups` |
| Guruh tafsiloti | `/mentor/groups/:id` | Studentlar jadvali: progress %, XP (umumiy/haftalik), streak, oxirgi faollik, davomat % | Saralash, filtrlash, student profiliga o'tish | `GET /mentor/groups/:id`, `GET /mentor/groups/:id/students` |
| Student profili | `/mentor/students/:id` | Progress (xarita ko'rinishi), XP/coin, streak, faollik kalendari, quiz/takrorlash natijalari, bellashuvlar, portfolio, davomat | Parolni tiklash, ota-ona tokeni yaratish/bekor qilish/qayta yaratish, chatni ochish | `GET /mentor/students/:id`, `.../progress`, `.../activity`, `POST /students/:id/reset-password`, `GET/POST/DELETE /students/:id/parent-tokens` |
| Chat | `/mentor/chat` | Guruh studentlari bilan suhbatlar, o'qilmaganlar | Xabar yozish, fayl yuborish | `GET /chat/conversations`, `POST /chat/conversations` (studentId), WS |
| Meetinglar | `/mentor/meetings` | Kalendar/ro'yxat | Meeting yaratish/tahrirlash/bekor qilish, boshlash | `GET/POST/PATCH/DELETE /mentor/meetings[/:id]`, `POST /meetings/:id/join-token` |
| Davomat | `/mentor/meetings/:id/attendance` | Guruh studentlari, avtomatik qayd (qo'shilgan vaqti) | Present/late/absent/excused belgilash, saqlash | `GET/PUT /mentor/meetings/:id/attendance` |
| Materiallar | `/mentor/materials` | Guruhlar bo'yicha materiallar | Fayl yuklash, havola qo'shish, tahrirlash, o'chirish | `GET/POST/PATCH/DELETE /mentor/materials[/:id]`, `POST /files/upload-url` |
| Portfolio baholash | `/mentor/reviews` | Topshirilgan loyihalar navbati | Ball va izoh yozish, qaytarish (qayta ishlashga) | `GET /mentor/projects?status=SUBMITTED`, `POST /mentor/projects/:id/review` |
| Profil | `/mentor/profile` | Ism, rasm, bio | Tahrirlash, parolni o'zgartirish | `PATCH /me/profile` |

- **Taxmin:** Mentor uchun "hisobotlar" o'z guruhlari bo'yicha CSV eksport ko'rinishida bo'ladi. → S-21

---

## 4. Admin sahifalari (super admin ham ko'radi)

| Sahifa | Yo'l | Ma'lumotlar | Amallar | API |
|---|---|---|---|---|
| Dashboard | `/admin` | Faol studentlar (DAU/WAU), yangi studentlar, kontent statistikasi, kutilayotgan buyurtmalar, shikoyatlar | — | `GET /admin/dashboard` |
| Studentlar | `/admin/students` | Ro'yxat, qidiruv (ID, ism), filtr (guruh, status) | Yaratish (bitta/ommaviy CSV), tahrirlash, deaktivatsiya, parolni tiklash, guruhga qo'shish | `GET/POST/PATCH /admin/students[/:id]`, `POST /admin/students/import`, `POST /students/:id/reset-password` |
| Mentorlar | `/admin/mentors` | Ro'yxat, guruhlari | Yaratish, tahrirlash, deaktivatsiya, parolni tiklash | `GET/POST/PATCH /admin/mentors[/:id]`, `POST /staff/:id/reset-password` |
| Guruhlar | `/admin/groups` | Ro'yxat: mentor, yo'l, studentlar soni | Yaratish, mentor biriktirish, studentlarni qo'shish/chiqarish, arxivlash | `GET/POST/PATCH /admin/groups[/:id]`, `PUT /admin/groups/:id/mentor`, `POST/DELETE /admin/groups/:id/members` |
| Ilm yo'llari | `/admin/paths` | Yo'llar daraxti: bo'lim → mavzu → dars, sandiqlar | CRUD, drag-and-drop tartiblash, nashr qilish/yashirish | `GET/POST/PATCH/DELETE /admin/paths…`, `/admin/sections…`, `/admin/topics…`, `/admin/lessons…`, `/admin/chests…`, `PUT /admin/sections/:id/order` |
| Dars muharriri | `/admin/lessons/:id` | Markdown editor + preview, video havola, bog'langan savollar | Saqlash, savol bog'lash | `PATCH /admin/lessons/:id` |
| Savollar banki | `/admin/questions` | Filtr: yo'l/mavzu/tur/qiyinlik/qo'llanish | CRUD, import, preview, statistika (to'g'ri javob %) | `GET/POST/PATCH/DELETE /admin/questions[/:id]`, `POST /admin/questions/import` |
| Haftalik quiz | `/admin/quizzes` | Quiz shablon sozlamalari | Sozlash | `GET/PUT /admin/settings/quiz` |
| Gamifikatsiya sozlamalari | `/admin/settings/rewards` | XP/coin qiymatlari, streak, liga, bellashuv qoidalari | Tahrirlash | `GET/PUT /admin/settings/:group` |
| Yutuqlar | `/admin/achievements` | Yutuqlar ro'yxati | CRUD | `/admin/achievements…` |
| Ligalar | `/admin/leagues` | Tierlar, joriy hafta cohort'lari | Tier sozlash, ko'rish | `/admin/league-tiers…`, `GET /admin/leagues/current` |
| XP/coin tuzatish | `/admin/students/:id/wallet` | Tranzaksiyalar tarixi | Qo'lda +/- (sabab bilan) | `GET /admin/students/:id/transactions`, `POST /admin/students/:id/adjustments` |
| Ko'nikmalar | `/admin/skills` | Ko'nikmalar va mavzular bog'lanishi | CRUD | `/admin/skills…` |
| Sertifikat shablonlari | `/admin/certificates` | Berilgan sertifikatlar | Qo'lda berish/bekor qilish | `/admin/certificates…` |
| Shop mahsulotlari | `/admin/shop/products` | Mahsulotlar | CRUD, qoldiq | `/admin/shop/products…` |
| Buyurtmalar | `/admin/shop/orders` | Status bo'yicha ro'yxat | Tasdiqlash, topshirildi, bekor qilish (coin qaytarish) | `GET /admin/shop/orders`, `PATCH /admin/shop/orders/:id/status` |
| Blog moderatsiyasi | `/admin/blog` | Shikoyatlar navbati, postlar | Yashirish, tiklash, o'chirish, shikoyatni yopish | `GET /admin/blog/reports`, `PATCH /admin/blog/posts/:id/status`, `PATCH /admin/blog/comments/:id/status`, `PATCH /admin/blog/reports/:id` |
| Hisobotlar | `/admin/reports` | Faollik, progress (guruh/yo'l bo'yicha), davomat, savol statistikasi, iqtisodiyot (chiqarilgan/sarflangan coin) | Filtr, CSV eksport | `GET /admin/reports/:type?from&to&groupId` |

- **Taxmin:** Hisobotlar tarkibi yuqoridagi 5 tur bilan cheklanadi. Aniq ro'yxatni egasi tasdiqlashi kerak. → S-21
- **Taxmin:** Studentlarni CSV orqali ommaviy yaratish imkoniyati bo'ladi (katta platforma uchun zarur). → S-21

### 4.1 Faqat super admin

| Sahifa | Yo'l | Amallar | API |
|---|---|---|---|
| Adminlar | `/admin/admins` | CRUD, parolni tiklash | `/super/admins…` |
| Tizim sozlamalari | `/admin/system` | Umumiy sozlamalar (platforma nomi, vaqt mintaqasi, limitlar, fayl hajmi) | `GET/PUT /super/settings` |
| Audit log | `/admin/audit` | Filtr va ko'rish | `GET /super/audit-logs` |

---

## 5. Ota-ona sahifalari (read-only)

Batafsil: 10-ota-ona-paneli.

| Sahifa | Yo'l | Ma'lumotlar | API |
|---|---|---|---|
| Farzandlar | `/parent` | Farzandlar kartochkalari, almashtirish, "farzand qo'shish" (token) | `GET /parent/children`, `POST /auth/parent/exchange` |
| Umumiy | `/parent/:studentId` | Progress, XP, coin, streak, liga, so'nggi faollik | `GET /parent/children/:id/overview` |
| Progress | `/parent/:studentId/progress` | Xarita (read-only), mavzular holati | `GET /parent/children/:id/progress` |
| Natijalar | `/parent/:studentId/results` | Takrorlash, quiz, bellashuv natijalari | `GET /parent/children/:id/results` |
| Davomat | `/parent/:studentId/attendance` | Meetinglar va davomat | `GET /parent/children/:id/attendance` |
| Portfolio | `/parent/:studentId/portfolio` | Portfolio to'liq ko'rinishi | `GET /parent/children/:id/portfolio` |

---

## Ochiq savollar (shu modul)

- **S-20** Bildirishnoma kanallari: faqat in-app bo'ladimi yoki Telegram bot va web push ham kerakmi?
- **S-21** Admin va mentor hisobotlarida aniq qaysi ko'rsatkichlar bo'lsin? Studentlarni CSV orqali ommaviy yaratish kerakmi?
- **S-54** Sertifikatni public tekshirish sahifasi kerakmi?
