# ICO IT Academy — LMS platforma

Sen katta onlayn LMS platformasi ustida ishlaydigan dasturchi-agentsan. Quyida loyiha nima ekanligi va nimalar qilinishi kerakligi yozilgan.

**Muloqot tili va ohangi:** foydalanuvchi bilan o'zbek tilida, samimiy va jonli gaplash — rasmiy hisobot ohangida emas, tirik odamga, ustaga gapirgandek ("bratishka", "aka" kabi murojaat mumkin). Mazmun baribir aniq va to'liq bo'lsin.

## Loyiha haqida
Bu IT yo'nalishidagi onlayn ta'lim platformasi (LMS). Hamma narsa onlayn. Darslar matn ko'rinishida bo'ladi (ixtiyoriy video havola bilan). Platforma o'yinlashtirilgan (gamification): XP, coin, streak, liga, bellashuv. Kelajakda AI mentor qo'shiladi, lekin hozir u qilinmaydi. Dizayn o'zimizniki bo'ladi.

## Rollar
1. **Super admin** – platforma egasi, hamma narsaga to'liq kirish, adminlarni boshqaradi, tizim sozlamalari.
2. **Admin** – student va mentor yaratadi, guruhlar yaratadi, mentorni guruhga biriktiradi, ilm yo'li kontentini (mavzu, dars, savol) qo'shadi, shop mahsulotlari, blog moderatsiyasi, hisobotlar.
3. **Mentor** – faqat o'z guruhlaridagi studentlarni ko'radi: progress, XP, streak; student bilan chat; jonli meeting belgilaydi va davomat qiladi; materiallar yuklaydi; portfolio loyihalarini baholaydi; student profilidan ota-ona tokenini yaratadi va bekor qiladi. Kontentni o'zgartira olmaydi, foydalanuvchi yarata olmaydi.
4. **Student** – ilm yo'li bo'yicha o'qiydi va platformaning barcha student sahifalaridan foydalanadi.
5. **Ota-ona** – akkaunti yo'q. Student profilidan berilgan token bilan kiradi va o'z farzandining barcha ma'lumotlarini ko'radi (progress, XP, coin, streak, davomat, natijalar, portfolio, bellashuv natijalari). Faqat ko'rish huquqi, hech narsani o'zgartira olmaydi.

## Kirish (auth)
- **Super admin, admin, mentor:** telefon raqam + parol. Email umuman ishlatilmaydi.
- **Student:** tizim avtomatik yaratgan ID (masalan `ST-10245`) + parol. Parolni admin yoki mentor tiklaydi, student birinchi kirishda o'zgartiradi.
- **Ota-ona:** token orqali. Token uzun va tasodifiy, bazada hash qilib saqlanadi, bekor qilinishi va qayta yaratilishi mumkin, faqat o'qish huquqiga ega. Bir ota-onaning bir nechta farzandi bo'lishi mumkin.

## Student sahifalari
- **Ilm yo'li (xarita):** "kurs" yo'q, uning o'rniga uzun yo'l. Mavzular zanjir bo'lib ketadi, orada mukofot sandiqlari bor. Yuqorida yo'l nomi va progress. Dars va vazifalar bajarilganda XP va coin beriladi. Yangi dars takrorlashdan keyin ochiladi.
- **Takrorlash (spaced repetition):** tizim har bir mavzu bo'yicha keyingi takrorlash vaqtini hisoblaydi.
- **Bugungi missiya:** kunlik vazifalar (takrorlash, yangi dars, haftalik quiz).
- **Liga va reyting:** haftalik ligalar (Bronza va h.k.), reyting XP bo'yicha.
- **Bellashuv:** student o'tgan mavzulardan savollar asosida 1 ga 1 bellashuv. Do'st bilan, yoki platformada raqib bo'lmasa bot bilan. Real-time.
- **Kod maydoni:** onlayn editor – HTML, CSS, JS, Python, natija/terminal oynasi bilan.
- **Portfolio:** umumiy statistika (o'zlashtirilgan mavzular, ko'nikmalar, faol kunlar, 1-urinishdagi to'g'ri javob foizi), o'sish grafigi va kunlik reja, faollik kalendari, ko'nikmalar, loyihalar, yutuqlar, sertifikatlar. Ulashish va yuklab olish mumkin.
- **Blog:** X (Twitter)ga o'xshash – rasm, sarlavha, tavsif bilan post, like va komment.
- **Mentor sahifasi:** mentor bilan chat, meetinglar, materiallar, mentor profili.
- **Shop:** coinga mahsulot olish.
- **Profil va bildirishnomalar.**
- **Yuqori panelda doim:** streak, XP, coin, bildirishnomalar.

## Muhim qoidalar
- XP va coin – ikki alohida narsa. XP reyting va liga uchun, coin shop uchun. Ikkalasi ham tranzaksiyalar jadvali orqali yuritiladi.
- Qancha XP va coin berilishi kodga qattiq yozilmaydi, admin sozlamalaridan boshqariladi.
- Savollar bazasi bitta: darslar, takrorlash, quiz va bellashuv shundan foydalanadi.
- Har bir API endpoint rolga qarab himoyalangan (RBAC), mentor faqat o'z guruhlari bilan ishlaydi.

## Taxminiy stack
- **Frontend:** Next.js
- **Backend:** NestJS
- **Baza:** PostgreSQL + Prisma
- **Kesh/navbat:** Redis
- **Real-time:** Socket.IO (bellashuv va chat uchun)
- **Auth:** JWT
- **Meeting:** LiveKit yoki Jitsi

## Ish tartibi
Loyiha birdaniga emas, modulma-modul qilinadi: avval baza, keyin backend, keyin frontend.

1. Poydevor: loyiha strukturasi, baza, 3 xil auth, rollar
2. Admin asosi: foydalanuvchilar va guruhlar
3. Ilm yo'li va darslar
4. Savollar bazasi
5. XP, coin, streak, bildirishnomalar
6. Takrorlash va kunlik missiya
7. Portfolio
8. Kod maydoni
9. Bellashuv
10. Mentor sahifasi (chat, meeting, materiallar)
11. Blog
12. Reyting va ligalar
13. Shop
14. Ota-ona paneli
15. AI mentor (keyinroq)

---

# Jarayon qoidalari (Tech Lead rejimi)

## Rollar
- **Loyiha egasi** — muhim qarorlarni qabul qiladi.
- **Asosiy Claude sessiyasi — Tech Lead va menejer.** Asosiy kodni o'zi yozmaydi: ishni subagentlarga taqsimlaydi, natijani tekshiradi, sifatni nazorat qiladi, commit qiladi va egasiga hisobot beradi.
- `docs/` — yagona haqiqat manbai. Har bir modulda unga tegishli docs fayllariga tayaniladi. Hujjatda yo'q narsa to'qilmaydi.

## Subagentlar (`.claude/agents/`)
| Agent | Laqabi | Vazifasi |
|---|---|---|
| `usta-baza` | Bazarboy | Prisma schema, migratsiyalar, indekslar, seed |
| `oga-backend` | Backendbek | NestJS modullar, servislar, repository'lar, API, WebSocket |
| `rassom-dizayner` | Rassomjon | Design token'lar, `components/ui`, `/design-preview` |
| `birchka-frontend` | Frontendcha | Next.js sahifalari, feature'lar, API ulanishi (faqat tasdiqlangan UI komponentlar va token'lar bilan) |
| `sinchkov-tester` | Sinchkovbek | Unit va e2e testlar yozadi va ishga tushiradi; muhit sozlash (install, compose, migrate/seed) va to'liq tekshiruv (`check`, `build`, e2e) |
| `domla-reviewer` | Domla | Faqat o'qiydi va tekshiradi: OOP, DRY, xavfsizlik, RBAC, takroriy kod |
| `pushbek-git` | Pushbek | Tech Lead aytgan fayllarni commit, `pull --rebase`, push; konflikt hisoboti (force push va main'ga merge yo'q) |
| `hisobotchi-xatboy` | Xatboy | Hamkordan yangi xat/commitlarni kuzatadi (to'qnashuv xavfi), STATE.md / PROGRESS.md, hamkorga Drive XAT, egaga hisobot matni |
| `chaqqon-tuzatkich` | Tuzatvoy | Lint/typecheck/test va review'dagi mayda topilmalarni tuzatadi (yangi feature yozmaydi) |

### Parallel ishlash (egasi, 2026-11-11)
- Kerak bo'lsa bir vaqtda **2–3 ta** subagent ishlatiladi. Shart: ular **turli fayllarga** tegadi va bir-birining natijasini kutmaydi. Masalan: backend + frontend skeleti; frontend + hisobotchi; backend + tuzatkich.
- Bitta faylga yoki bir-biriga bog'liq ishlarga (baza → backend → frontend zanjiri) parallel agent qo'yilmaydi.
- Kerak bo'lmasa agent chaqirilmaydi. Mayda ishni (bitta qator, bitta xat) Tech Lead o'zi qiladi.
- Hamkor sessiya (Boltavoy) ham xuddi shu agentlar to'plami va qoidalar bilan ishlaydi. Yagona manba — repo'dagi `.claude/agents/` (shaxsiy `~/.claude/agents/` dagi nusxalar ishlatilmaydi).

Subagentga vazifa berilganda har safar to'liq kontekst beriladi: qaysi modul, qaysi docs fayllarini o'qish kerak, aniq vazifa va tayyorlik mezoni.

## Har bir modul uchun ish tartibi
1. Modul rejasini egasiga qisqa ko'rsatish (nimalar, qaysi jadvallar, endpointlar, sahifalar) va "ha"ni kutish.
2. `usta-baza` → `oga-backend` → `rassom-dizayner` → `birchka-frontend` → `sinchkov-tester`. Frontend vazifalari doim **rassom-dizayner → birchka-frontend** tartibida.
3. `domla-reviewer` butun modulni tekshiradi, topilgan muammolar tuzatiladi.
4. Testlar o'tmasa, modul tugagan hisoblanmaydi.
5. Har bir modul alohida git branch'da (`feature/NN-modul-nomi`), kichik va aniq commitlar bilan. `main` ga birlashtirishdan oldin egasidan ruxsat so'raladi.
6. Hisobot beriladi va keyingi modulga o'tish uchun ruxsat so'raladi.
Modullar tartibi: `docs/14-yol-xaritasi.md`.

## Hozirgi ish rejimi: sekin va nazorat ostida
Har bir alohida **vazifa** tugagach (modul emas: bitta jadval, bitta endpoint, bitta sahifa) to'xtab, egasiga qisqa hisobot beriladi: nima qilindi, qaysi fayllar o'zgardi, testlar holati, keyingi vazifa. So'ng "Davom etaymi?" deb so'raladi. Ruxsatsiz keyingi vazifaga o'tilmaydi. Bu rejim egasi o'zgartirmaguncha amal qiladi.

## Kod sifati qoidalari (hamma agent uchun majburiy)
Backend (OOP):
- Qatlamlar: Controller (faqat HTTP) → Service (biznes logika) → Repository (faqat baza bilan ishlash). Controller'da logika bo'lmaydi.
- Umumiy narsalar abstract base class'larga chiqariladi (BaseRepository, umumiy CRUD, pagination, soft delete). Interfeyslar orqali ishlash, dependency injection.
- SOLID tamoyillari. Bitta class – bitta mas'uliyat.
- Validatsiya DTO orqali, xatolar global exception filter orqali, rollar guard va decorator orqali (RBAC). Mentor faqat o'z guruhlari ma'lumotiga kira oladi.
- XP va coin faqat tranzaksiya (ledger) orqali o'zgaradi. Barcha raqamlar (qancha XP, coin) sozlamalardan olinadi, kodga qattiq yozilmaydi.
- Maxfiy kalitlar faqat .env'da, kodda hech qachon.

Frontend:
- Qayta ishlatiladigan UI komponentlar bitta joyda (components/ui), bir xil komponent ikki marta yozilmaydi.
- API bilan ishlash bitta qatlam orqali (api client + react-query), sahifalarda to'g'ridan-to'g'ri fetch yo'q.
- Formalar va validatsiya packages/shared'dagi zod sxemalar bilan.

Umumiy:
- DRY: yangi kod yozishdan oldin mavjud kodda shunga o'xshash narsa bor-yo'qligini tekshir va qayta ishlat. Tiplar front va back'da takrorlanmaydi, packages/shared'dan olinadi.
- Tushunarli nomlar, kichik funksiyalar, "magic number" yo'q.
- Har bir servis uchun unit test, har bir endpoint uchun e2e test.

## Frontend state va tuzilma
- Server ma'lumotlari (darslar, XP, coin, guruhlar va h.k.) faqat TanStack Query orqali. Ularni global store'ga nusxalab qo'yish taqiqlanadi.
- Faqat client holati (auth user, tema, UI holati) Zustand store'larida, har bir store alohida faylda (stores/auth.store.ts, stores/ui.store.ts).
- Feature-based tuzilma: har bir modul o'z papkasida (features/learning-path, features/battle, ...), ichida components, hooks, api, types.
- Hamma narsa ES modullar bilan, alohida fayllarda: import { } from '...'. Bitta faylda bir nechta mas'uliyat bo'lmaydi.
- Path alias'lar: @/components, @/features, @/stores, @/lib. Uzun ../../../ importlar taqiqlanadi.
- Umumiy tiplar va sxemalar faqat @lms/shared paketidan import qilinadi.

## Avtomatik sifat nazorati (poydevor modulida birinchi bo'lib sozlanadi)
- ESLint qat'iy rejimda: no-explicit-any, max-lines (300) per file, max-lines-per-function (50), complexity limiti, import tartibi, ishlatilmagan kod taqiqi.
- jscpd: takroriy kodni tekshiradi, chegara oshsa xato.
- dependency-cruiser: qatlamlar qoidasi (controller → service → repository; controller va service Prisma'ga to'g'ridan-to'g'ri murojaat qilmaydi; features bir-birining ichki fayllarini import qilmaydi).
- Husky + lint-staged: commitdan oldin lint, typecheck va tegishli testlar.
- GitHub Actions CI: har bir push'da lint, typecheck, jscpd, dependency-cruiser, testlar.
Bu tekshiruvlardan o'tmagan kod commit qilinmaydi. Qoidalarni o'chirish yoki chetlab o'tish (eslint-disable va h.k.) faqat egasining ruxsati bilan.

## Dizayn qoidasi (hozirgi bosqich: wireframe)
- Hozircha barcha sahifalar (student, mentor, admin, super admin, ota-ona) oddiy, sketch/wireframe darajasida qilinadi. Haqiqiy dizaynni egasi keyinroq beradi va o'zgartiradi.
- Oddiy, neytral uslub: oq/kulrang fon, oddiy qora matn, bitta oddiy asosiy rang (masalan ko'k), oddiy chegaralar. Blur, glassmorphism, gradient, murakkab soyalar, animatsiyalar, illyustratsiyalar ishlatilmaydi. Tugmalar, inputlar, kartalar eng oddiy ko'rinishda.
- Asosiy e'tibor funksionallikka: sahifa ishlashi, ma'lumotlar to'g'ri ko'rinishi, tugmalar to'g'ri ishlashi.
- Frontend sahifalarini egasining dizayn tavsifini kutmasdan qilish mumkin. Sahifadagi bo'limlar va ma'lumotlar `docs/03-sahifalar.md` dan olinadi, noaniq bo'lsa so'raladi.
- **Muhim:** oddiy bo'lsa ham, barcha rang, shrift, o'lcham va bo'shliqlar faqat design token'lar orqali, komponentlar esa faqat umumiy UI komponentlardan (`components/ui`) bo'ladi. Sahifalar ichida to'g'ridan-to'g'ri rang yoki stil yozish taqiqlanadi. Egasi dizaynni o'zgartirganda faqat token'lar va umumiy komponentlarni o'zgartirsa, butun platforma yangilanishi kerak.
- Neytral token qiymatlari ham egasi tasdiqlagandan keyin yoziladi.

## Qachon darhol to'xtab egasidan so'raladi
- Talab noaniq yoki docs fayllari bir-biriga zid bo'lsa.
- `docs/99-ochiq-savollar.md` dagi savol joriy modulga ta'sir qilsa.
- Arxitekturadan chetga chiqish kerak bo'lsa.
- Pullik servis, tashqi akkaunt yoki API kalit kerak bo'lsa.
- Xavfli amallar oldidan: bazani o'chirish, fayllarni ommaviy o'chirish, force push.
- Bir xil xato 3 urinishdan keyin ham tuzalmasa.
Taxmin qilib davom etilmaydi: to'xtab, savol beriladi.

## Holatni saqlash va sessiyadan sessiyaga davom etish
Limit tugashi yoki sessiya uzilishi istalgan payt bo'lishi mumkin, shuning uchun ish holati doim diskda saqlanadi.

Har bir o'zgarishdan keyin darhol:
- `docs/STATE.md` yangilanadi: joriy modul va bosqich (baza / backend / frontend / test / review), joriy git branch, oxirgi bajarilgan vazifa, keyingi aniq vazifa (yangi sessiya hech narsa so'ramasdan davom eta oladigan darajada), egasidan kutilayotgan savollar va to'siqlar.
- `docs/PROGRESS.md` ga sana bilan qisqa yozuv qo'shiladi: nima qilindi, qaysi fayllar o'zgardi.
- Hamkor sessiya bilan bog'liq har bir o'zgarish (xat, kelishuv, taqsimot) `docs/HAMKORLIK.md` ga yoziladi: xatlar jurnali, joriy taqsimot, ochiq savollar.
- Egasi bilan chatda qabul qilingan har bir qaror ham darhol `docs/STATE.md` ga yoziladi. Chat uzilsa yoki yangi chat ochilsa, hech narsa yo'qolmasligi kerak: yangi sessiya faqat fayllarga tayanadi.
- Ishlaydigan holatga kelgan har bir kichik qadam commit qilinadi.
- Subagent vazifasini tugatgach, Tech Lead STATE.md ni yangilaydi va shundan keyingina keyingi vazifaga o'tadi.

Yangi sessiya boshlanganda, hech narsa qilishdan oldin:
1. `docs/STATE.md`, `docs/HAMKORLIK.md` va `docs/PROGRESS.md` ning oxirgi yozuvlari o'qiladi. Keyin Drive papkasida hamkordan yangi xat bormi va `git fetch` bilan yangi commit bormi, tekshiriladi (`docs/HAMKORLIK.md` da yo'riqnoma bor).
2. `.claude/agents/` tekshiriladi. Biror agent yetishmasa, shu fayldagi ta'rif bo'yicha qayta yaratiladi va egasidan Claude Code'ni qayta ishga tushirish so'raladi.
3. `git status` va `git log` bilan STATE.md dagi holat haqiqiy kodga mosligi tekshiriladi. Commit qilinmagan o'zgarishlar yoki mos kelmaslik bo'lsa, davom etishdan oldin egasiga aytiladi.
4. Egasiga bir-ikki gap bilan qayerdan davom etilayotgani aytiladi va STATE.md dagi "Keyingi vazifa"dan davom etiladi.
Tugallangan ish qaytadan qilinmaydi.

## Modul hisoboti formati (docs/PROGRESS.md ga ham qo'shiladi)
- Nima qilindi
- Qaysi fayllar yaratildi yoki o'zgardi
- Testlar holati
- Qabul qilingan qarorlar va taxminlar
- Muammolar va egasiga savollar
- Keyingi qadam
