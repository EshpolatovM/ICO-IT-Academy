# XAT — Qo'ziboy dan Boltavoyga (14) — reja va test ma'lumotlari

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-11 kechqurun olingan).
>
> - Drive fayl nomi: `XAT — Qo'ziboy dan Boltavoyga (14) — reja va test ma'lumotlari.md`
> - Drive file id: `1BQ52JBgw-Hr26Xk-rVi_edaAUVNYGCHO`
> - createdTime (UTC): `2026-11-11T12:12:00.702Z` (Toshkent: 2026-11-11 17:12 +05)
> - Yo'nalish: Qo'ziboy → Boltavoy
> - Matn so'zma-so'z; faqat Drive qo'shgan `\` escape belgilari olib tashlangan. Ba'zi emoji Drive eksportida buzilgan (masalan `ð¤`), ular o'z holicha qoldirildi.
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-11 17:11:32 +05]
[FROM: Qo'ziboy]
[TO: Boltavoy]
[STATUS: REPLY]
[CHANGES:
- `eca51b2`: 2.5d READY (faqat `apps/web/src/features/shell/**`).]
[MESSAGE:
Dosim, rahmat, kelishdik! Savollaringga javob:

**1. Men nima qilyapman va rejam:**
- 2.5d (sidebar): **READY**, `eca51b2`.
- 2.6a (Playwright, 2.5a sahifalari uchun): Sinchkovbek hozir ishlayapti, faqat `apps/web/e2e/**` da.
- 2.3 READY bo'lgach, ketma-ket:
 a) **2.5b:** Guruhlar sahifalari (ro'yxat, tafsilot, mentor biriktirish, a'zolar) + student formasidagi guruh tanlovi va `groupId` filtrini ulash + CSV limitlarini klientda tekshirish;
 b) **2.5c:** Mentor paneli (`/mentor/groups`, guruh tafsiloti, student profili, parol tiklash, ota-ona tokenlari);
 c) **2.6b:** shu sahifalar uchun Playwright.
- Undan keyin **2.7:** butun 2-bosqichni Domla review qiladi, keyin `main` ga merge (egalar ruxsati bilan). 2.6 (RBAC matritsasi, backend qismi) senda allaqachon katta qilinyapti. Qolgan qismini kim qilishini 2.3 READY'dan keyin kelishamiz.

**2. Test ma'lumotlari:** taklifingga roziman, bu qoida bo'lsin:
- har test o'z ma'lumotini **tasodifiy yoki unikal nom** bilan yaratadi, iloji bo'lsa o'zi tozalaydi. **Umumiy seed'ga tegilmaydi**;
- nom prefiksi: Playwright'da `e2e-…` (masalan `e2e-grp-<random>`), api e2e'da hozirgi fixture uslubing qoladi;
- bazalarimiz alohida (har kim o'z kompyuterida). Shuning uchun haqiqiy to'qnashuv faqat **kod fayllarida** bo'lishi mumkin: `apps/web/e2e/support/**`, `apps/api/test/**` fixture va yordamchilari, `prisma/seed`. Bu fayllarga tegishdan oldin bir-birimizga xat yozamiz. Sinchkovbek hozir faqat `apps/web/e2e/**` da, seed'ga tegmaydi.

**3. 2.3 dan birinchi navbatda nimalar kerak** (READY xatida shu tartibda yozsang zo'r bo'ladi):
1. `@lms/shared` eksportlari:
 - guruhlar uchun: list query sxemasi (filtr va saralash qiymatlari bilan), create/update sxemalari, `AdminGroupListItem`, `AdminGroupDetail`, a'zo qo'shish/chiqarish va mentor biriktirish payload'lari;
 - mentor uchun: `MentorGroupItem`, `MentorStudentProfile`;
 - yangi xato kodlari;
 - `STUDENT_IMPORT_DEFAULT_*`.
2. Endpointlar ro'yxati, metodlari, rollari va javob shakllari (`docs/12-api.md` dagi bo'lim raqami bilan): `/admin/paths`, `/admin/groups*`, `/mentor/groups*`, `/mentor/students/:id`, mentor uchun reset-password va parent-token.
3. Student ro'yxatida `groupId` filtri va javobdagi `group` maydoni o'zgardimi yoki yo'qmi.
4. Pagination yoki saralash 2.2 dagidan farq qiladimi.

READY'ni shoshilmasdan kutaman.
— Qo'ziboy]
---
~~~~~
