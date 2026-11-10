# 99. Ochiq savollar

> **Qisqa mazmun:** 00–14 hujjatlardagi barcha aniqlanmagan savollar modul bo'yicha guruhlangan. Har bir savolda: variantlar, hujjatlarda qabul qilingan **Taxmin** (✅ belgisi bilan) va ta'siri. Muhimlik: 🔴 boshlashdan oldin hal qilinishi kerak, 🟡 tegishli bosqichdan oldin, 🟢 keyinroq ham bo'ladi.

Savol hal qilinganda: javobni shu yerga yozing, tegishli hujjatdagi "Taxmin:" belgisini olib tashlang va kerak bo'lsa 11/12 ni yangilang.

---

## 🔝 Eng muhim savollar holati

| # | Savol | Holat |
|---|---|---|
| 1 | **S-15** Ota-ona tokeni modeli | ✔️ Hal qilindi (2026-11-10) |
| 2 | **S-30** "Yangi dars takrorlashdan keyin ochiladi" qoidasi | ✔️ Hal qilindi (2026-11-10) |
| 3 | **S-01 / S-02** Yo'llar va guruhlar tuzilmasi | ⏳ Egasining javobi kutilmoqda (2-bosqichgacha kerak) |
| 4 | **S-61** Hosting va ma'lumotlar lokalizatsiyasi | ✔️ Hal qilindi: hosting'ga bog'lanmagan arxitektura |
| 5 | **S-45** Meeting provayderi | ✔️ LiveKit (10-bosqichda yakuniy tasdiq) |
| 6 | **S-65** Jamoa, muddat, MVP tarkibi | ⏳ Egasining javobi kutilmoqda |
| 7 | **S-67** Ota-ona "kodi" — token o'zimi yoki qisqa kod? | ✔️ A: tokenning o'zi (2026-11-10) |

---

## 1. Umumiy (00)

**S-01** 🔴 Bitta umumiy ilm yo'li bormi yoki bir nechta yo'nalish bo'yicha yo'llarmi?
- A) Bitta yo'l. ✅ B) Bir nechta yo'l, student guruh orqali bitta yo'lga biriktiriladi. C) Student bir nechta yo'lni parallel o'qiydi.
- Ta'sir: `groups.path_id`, `student_path_enrollments`, xarita. Bo'lim (section) darajasi ham taxmin sifatida qo'shilgan.

**S-02** 🔴 Student bir vaqtda bir nechta guruhda bo'la oladimi?
- ✅ A) Faqat bitta faol guruh. B) Bir nechta guruh (masalan asosiy + qo'shimcha kurs).
- Ta'sir: partial unique index, mentor scope, chat (qaysi mentor).

**S-03** 🟡 Guruhda bir nechta mentor bo'la oladimi?
- ✅ A) Bitta mentor. B) Asosiy + yordamchi mentorlar (`group_mentors` jadvali).

**S-04** 🟢 Interfeys tillari?
- ✅ A) Faqat o'zbek (lotin), lekin i18n'ga tayyor. B) O'zbek + rus. C) + kirill.

**S-05** 🟡 Kutilayotgan masshtab (studentlar soni, bir vaqtdagi onlayn)?
- Variantlar: < 5 000 / 5 000–50 000 / 50 000+.
- Ta'sir: partitioning, replica, Socket.IO instanslari, LiveKit tarifi.

**S-06** 🟢 To'lov/obuna moduli kerakmi?
- ✅ A) Yo'q (studentni admin yaratadi). B) Kelajakda (Click/Payme).

## 2. Rollar va ruxsatlar (01)

**S-07** 🟡 Super admin admin ishlarini ham bajaradimi? Admin ota-ona tokeni yarata oladimi?
- ✅ A) Ha, ikkalasi ham. B) Super admin faqat adminlar/sozlamalar bilan ishlaydi. C) Token faqat mentor beradi.

**S-08** 🟡 Foydalanuvchini o'chirish qanday bo'ladi? Student o'z ismini o'zgartira oladimi?
- ✅ A) Soft delete/deaktivatsiya, ismni faqat admin o'zgartiradi. B) To'liq o'chirish (GDPR uslubida anonimlashtirish bilan).

**S-09** 🟡 Mentor/admin blogda yozadimi?
- ✅ A) Faqat studentlar yozadi. B) Mentorlar ham post yozadi. C) Hamma komment yoza oladi.

**S-10** 🟢 Guruhdan chiqqan studentni eski mentor ko'radimi?
- ✅ A) Yo'q. B) Faqat o'qish rejimida, arxiv sifatida.

**S-11** 🟡 Admin boshqa adminlarni boshqaradimi?
- ✅ A) Yo'q, faqat super admin. B) Ha.

**S-48** 🟢 Mentor–student chatini kim ko'ra oladi?
- ✅ A) Faqat super admin (audit). B) Admin ham. C) Hech kim (faqat shikoyat asosida).

## 3. Auth (02)

**S-12** 🟢 Token muddatlari?
- ✅ Access 15 daqiqa, refresh: student 30 kun, staff 7 kun. Variant: staff uchun 1 kun.

**S-13** 🟢 Birinchi super admin qanday yaratiladi?
- ✅ A) CLI/seed buyrug'i. B) Birinchi ishga tushirishda setup sahifasi.

**S-14** 🟡 Admin/mentor parolini unutsa nima qilinadi?
- ✅ A) Yuqori rol tiklaydi (admin → mentor, super admin → admin). B) SMS OTP orqali o'zi tiklaydi (SMS provayder kerak, masalan Eskiz).

**S-15** ✔️ **HAL QILINDI (2026-11-10):** har bir farzand uchun alohida token, ota-ona panelida birlashtiriladi. Kirish ikki yo'l bilan: mentor yuborgan havola (token brauzerda saqlanadi) va saytda kod kiritib boshqa farzandni qo'shish. Hujjatlar yangilandi: 02 §5.1, 10 §3, 12 §1.

**S-16** 🟢 Ota-ona tokeni muddati va brauzerdagi cookie muddati?
- ✅ A) Token muddatsiz (bekor qilinguncha), brauzerdagi `parent_tokens` cookie 180 kun. B) Token 1 yil. C) Mentor tanlaydi.

**S-67** ✔️ **HAL QILINDI (2026-11-10): A — tokenning o'zi.** Ota-ona saytda kiritadigan "kod" — bu havoladagi uzun tokenning o'zimi yoki alohida qisqa kodmi?
- ✅ A) Tokenning o'zi (43 belgi, nusxa ko'chirib qo'yiladi). Eng xavfsiz variant.
- B) Alohida qisqa kod (masalan 8 belgi `K7P2-QX9M`). Qo'lda yozish oson, lekin entropiya past, shuning uchun qattiq rate limit va kodga muddat qo'yish kerak.
- C) Ikkalasi ham: havolada uzun token, qo'shimcha ravishda mentor bir martalik qisqa kod (24 soat) beradi.

**S-17** 🟢 Bitta studentda nechta faol ota-ona tokeni?
- ✅ A) 3 tagacha (sozlama). B) Faqat 1 ta (yangisi eskisini bekor qiladi).

**S-18** 🟡 Student ID formati?
- ✅ `ST-` + ketma-ket raqam, 10001 dan. Variant: yil prefiksi (`ST-26-0123`), tasodifiy raqam (enumeration'ga qarshi).

**S-19** 🟢 Parol siyosati?
- ✅ Kamida 8 belgi, harf va raqam bo'lishi shart. Variant: yosh studentlar uchun soddaroq (6 belgi).

## 4. Sahifalar (03)

**S-20** 🟡 Bildirishnoma kanallari?
- ✅ A) Faqat in-app (real-time). B) + Web push. C) + Telegram bot.

**S-21** 🟡 Hisobotlar tarkibi, mentor hisobotlari, CSV import?
- ✅ Faollik, progress, davomat, savollar statistikasi, coin iqtisodiyoti + CSV eksport. Mentor o'z guruhi bo'yicha. Studentlarni CSV import qilish mumkin.

**S-54** 🟢 Sertifikat qachon beriladi, tekshirish sahifasi kerakmi?
- ✅ A) Bo'lim/yo'l tugaganda avtomatik + public verify sahifasi. B) Faqat admin qo'lda beradi. C) Mentor tavsiyasi bilan.

## 5. Gamifikatsiya (04)

**S-22** 🟡 Streak uchun qaysi faoliyat hisoblanadi?
- ✅ A) Dars, takrorlash, quiz. B) XP beradigan istalgan faoliyat (bellashuv ham). C) Kunlik missiyaning hammasini bajarish.

**S-23** 🟢 Streak freeze kerakmi?
- ✅ A) Yo'q. B) Shop'da coin evaziga. C) Haftasiga 1 ta bepul.

**S-24** 🟡 Liga parametrlari?
- ✅ Bronza, Kumush, Oltin, Platina, Olmos; cohort 30 kishi; top 7 ko'tariladi, pastki 5 tushadi. Hammasi admin sozlamasidan.

**S-25** 🟡 Liga qamrovi?
- ✅ A) Butun platforma. B) Yo'l ichida. C) Guruh ichida (kichik guruhlarda raqobat zaif bo'ladi).

**S-26** 🟢 Sandiq tarkibi va missiya mukofotini berish usuli?
- ✅ A) Admin belgilagan oraliqda tasodifiy XP/coin, missiya mukofoti avtomatik beriladi. B) Qat'iy qiymat. C) Sandiqdan mahsulot/yutuq ham chiqishi mumkin.

**S-27** 🟢 Yutuqlarning boshlang'ich ro'yxati?
- ✅ 04 §7 dagi qoida turlari. Aniq ro'yxatni mahsulot egasi beradi.

**S-28** 🟡 Kun/hafta chegarasi?
- ✅ Asia/Tashkent, kun 00:00 da almashadi, hafta dushanbadan boshlanadi.

**S-29** 🟢 Admin qo'lda XP/coin bera oladimi?
- ✅ A) Ha, sabab majburiy va audit'ga yoziladi. B) Faqat super admin. C) Yo'q.

**S-40** 🟡 Bellashuv mukofoti?
- ✅ G'alaba/durang/mag'lubiyat uchun alohida XP (+ixtiyoriy coin), bot bilan kamroq, kunlik limit bilan. Bot UI'da aniq ko'rsatiladi.

**S-49** 🟢 Davomat XP beradimi?
- ✅ A) Ha (sozlamadan). B) Yo'q.

**S-52** 🟢 Blog XP beradimi?
- ✅ A) Yo'q. B) Kuniga 1 ta post uchun oz XP. C) Like'lar uchun.

## 6. Ilm yo'li va takrorlash (05)

**S-30** ✔️ **HAL QILINDI (2026-11-10):** bugungi due takrorlashlar bajarilmaguncha yangi dars yopiq bo'ladi. Boshlangan darsni tugatish mumkin. Kunlik takrorlash limiti admin sozlamalaridan boshqariladi (`review.daily_max`). Hujjat: 05 §2.2.

**S-31** 🟡 Mavzu yakunlanish mezoni? Minimal o'qish vaqti?
- ✅ A) Barcha darslar + mavzu savollarida ≥ 70% (past bo'lsa ham yakunlanadi, SR qisqa interval bilan boshlanadi). B) 70% dan past bo'lsa qayta topshirish. Minimal o'qish vaqti ixtiyoriy sozlama.

**S-32** 🟡 Darsdagi "vazifalar" turi?
- ✅ A) Faqat savollar. B) + avtomatik tekshiriladigan kod vazifalari (server sandbox kerak, 07).

**S-33** 🟡 Haftalik quiz parametrlari?
- ✅ Dushanba–yakshanba, 15 savol (60% o'tgan hafta mavzularidan, 40% eski mavzulardan), 1 urinish, vaqt limiti bilan.

**S-34** 🟡 Savol turlari?
- ✅ Single, multiple, true/false, short text, ordering, code output.

**S-35** 🟢 Nashr qilingan kontent o'zgarganda progress bilan nima bo'ladi?
- ✅ A) Progress saqlanadi, ochilgan narsa yopilmaydi. B) Versiyalash va qayta o'tish.

**S-36** 🟢 Test orqali mavzuni o'tkazib yuborish (test-out) mumkinmi?
- ✅ A) Yo'q. B) Bo'lim boshida placement test.

## 7. Bellashuv (06)

**S-37** 🟡 "Do'st" tushunchasi qanday?
- ✅ A) Taklif kodi yoki havola. B) Do'stlar ro'yxati (so'rov/qabul qilish). C) Faqat guruhdoshlar ro'yxatidan chaqirish.

**S-38** 🟢 O'yin parametrlari?
- ✅ 7 savol, har biriga 15 s, ball = 100 + tezlik bonusi.

**S-39** 🟢 Do'stlarning umumiy mavzulari yetarli bo'lmasa?
- ✅ A) Bellashuv boshlanmaydi. B) Pastroq darajadagi o'yinchining mavzularidan olinadi.

**S-41** 🟢 Bellashuv uchun alohida ELO reyting kerakmi?
- ✅ A) Yo'q. B) Ha, matchmaking uchun.

## 8. Kod maydoni (07)

**S-42** 🟡 Python kutubxonalari, `input()`, web kodda tashqi CDN?
- ✅ Standart kutubxona + `input()` kerak. Tashqi CDN'larga ruxsat haqida qaror ochiq.

**S-43** 🟢 Snippetlarni saqlash, ulashish, darsdan ochish?
- ✅ Saqlash va darsdan ochish ha, ulashish hozircha yo'q.

**S-44** 🟡 Kodni avtomatik tekshirish kerakmi?
- ✅ A) Hozircha yo'q (brauzerda ishga tushirish yetarli). B) Ha, Judge0 server sandbox bilan.

## 9. Mentor: chat, meeting (08)

**S-45** ✔️ **HAL QILINDI (2026-11-10):** LiveKit. Cloud yoki self-host masalasi va yakuniy tasdiq 10-bosqichda.

**S-46** 🟢 1:1 meetinglar kerakmi?
- ✅ A) Guruh meetinglari asosiy, 1:1 ixtiyoriy (`meetings.student_id`). B) Faqat guruh.

**S-47** 🟢 Chat qamrovi?
- ✅ Faqat 1:1 mentor ↔ student, fayl ≤ 10 MB, tahrirlash 15 daqiqa ichida, soft o'chirish. Mentor telefoni ko'rsatilmaydi. Variant: guruh chati.

**S-50** 🟢 Meetinglar yozib olinadimi?
- ✅ A) Yo'q. B) Ha (LiveKit Egress, saqlash xarajati bilan).

## 10. Blog, portfolio, shop (09)

**S-51** 🟡 Blog moderatsiyasi va formati?
- ✅ Post-moderatsiya + shikoyatlar + taqiqlangan so'zlar filtri; 1 ta rasm; bir darajali reply. Variant: pre-moderatsiya (yosh foydalanuvchilar uchun xavfsizroq).

**S-53** 🟢 Loyiha baholash shkalasi?
- ✅ 1–100 ball + izoh, XP ballga proporsional. Variant: 5 yulduzli shkala yoki "qabul qilindi/qaytarildi".

**S-55** 🟢 Public portfolio'da qaysi ma'lumotlar ko'rinadi?
- ✅ Ism, statistika, ko'nikmalar, loyihalar, yutuqlar, sertifikatlar. Student ID, guruh va mentor ko'rinmaydi.

**S-56** 🟡 Shop mahsulotlari turi va yetkazish?
- ✅ Jismoniy (o'quv markazidan olinadi) va raqamli. Manzil so'ralmaydi.

**S-57** 🟢 Bekor qilingan buyurtma uchun coin qaytariladimi?
- ✅ A) Ha, to'liq. B) Faqat admin bekor qilsa.

## 11. Ota-ona paneli (10)

**S-58** 🟢 Ota-ona chatni ko'radimi yoki mentor bilan yozisha oladimi?
- ✅ A) Yo'q. B) Faqat o'qish. C) Ota-ona ↔ mentor alohida kanal (akkaunt talab qiladi).

**S-59** 🟢 Ota-onaga bildirishnoma yoki hisobot yuborish?
- ✅ A) Yo'q. B) Telegram bot orqali haftalik hisobot. C) SMS.

**S-60** 🟢 Ota-ona blog va liga jadvalidagi boshqalarni ko'radimi?
- ✅ A) Yo'q, faqat farzandning ligadagi o'rni ko'rinadi. B) Farzandning blog postlarini ko'radi.

## 12. Baza, API, arxitektura (11–13)

**S-61** ✔️ **HAL QILINDI (2026-11-10):** egasining ma'lumotiga ko'ra, 2026-yil martidan keyin majburiy lokalizatsiya faqat biometrik, genetik va telekom ma'lumotlariga tegishli (huquqshunos tasdiqlaydi). Arxitektura hosting'ga bog'lanmaydi: Docker, env orqali sozlanadi, S3-compatible API ishlatiladi. Hosting keyin tanlanadi. Hujjat: 13 §4.

**S-68** ✔️ **HAL QILINDI (2026-11-10): A — Podman** (`podman compose` uchun provayder o'rnatilishi kerak). Lokal ishlab chiqish muhiti: mashinada Docker yo'q, lekin Podman bor. Dev uchun `podman compose` ishlatsak bo'ladimi yoki Docker o'rnatiladimi?
- ✅ A) Podman (Docker'ga mos `compose.yaml`, CI'da Docker). B) Docker o'rnatiladi.

**S-62** 🟢 Bildirishnomalar va audit loglar qancha saqlanadi?
- ✅ Bildirishnomalar 90 kun, audit 1 yil+.

**S-63** 🟢 Fayllar uchun antivirus, API versiyalash, mobil ilova rejasi?
- ✅ Material va chat fayllari uchun ClamAV. `/api/v1`. Mobil ilova hozircha yo'q (responsive web).

**S-64** 🟢 Repo tuzilmasi?
- ✅ A) Monorepo (pnpm + Turborepo). B) Alohida repolar.

## 13. Yo'l xaritasi (14)

**S-65** 🔴 Jamoa hajmi, muddatlar, MVP tarkibi?
- Variant: MVP = 1–6 + 12 (o'qish + gamifikatsiya + liga), keyin qolganlari.

**S-66** 🟢 AI mentor vazifalari va qachon boshlanishi?
- Variantlar: dars bo'yicha savol-javob, kod tushuntirish, shaxsiy takrorlash rejasi, mentorga yordamchi.
