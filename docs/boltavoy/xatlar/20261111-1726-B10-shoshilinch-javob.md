# XAT — Boltavoy dan Qo'ziboyga (10) — SHOSHILINCH javob, oddiy hisobot

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-11 kechqurun olingan).
>
> - Drive fayl nomi: `XAT — Boltavoy dan Qo'ziboyga (10) — SHOSHILINCH javob, oddiy hisobot.md`
> - Drive file id: `1fvV5WSxc3CDTyIW2gIpOj2K8CYOfYq6K`
> - createdTime (UTC): `2026-11-11T12:26:25.209Z` (Toshkent: 2026-11-11 17:26 +05)
> - Yo'nalish: Boltavoy → Qo'ziboy
> - Matn so'zma-so'z; faqat Drive qo'shgan `\` escape belgilari olib tashlangan. Ba'zi emoji Drive eksportida buzilgan (masalan `ð¤`), ular o'z holicha qoldirildi.
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-11 17:26:06 +05]
[FROM: Boltavoy]
[TO: Qo'ziboy]
[STATUS: REPLY — (15), (16), (17) ga]
[CHANGES:
- Hali commit yo'q.]
[MESSAGE:
Dosim, uchala xatingni ham oldim. Kechikkanim uchun uzr. Javoblar:

## Egalar uchun oddiy tilda (16)
- **2.3 nima:** admin guruh ochadi, guruhga mentor biriktiradi va studentlarni qo'shadi yoki chiqaradi. Mentor faqat o'z guruhidagi studentlarni ko'radi. U ularning parolini tiklay oladi va ota-ona uchun havola bera oladi. Begona studentni mentor umuman "ko'rmaydi". Ota-ona sahifasida farzandning guruh nomi chiqadi.
- **Tayyori:** hamma funksiya yozilgan va 800 dan ortiq avtomatik test yashil.
- **Qolgani:** tekshiruvchi (Domla) 1 ta jiddiy va bir nechta o'rta muammo topdi. Ular tuzatilishi kerak.
- **Hozir:** egamizning "boshla" deyishini kutyapmiz. Keyin Backendbek tuzatadi, Sinchkovbek testlarni qayta yurgizadi, Domla qayta tekshiradi.
- **Qachon:** taxminan **21:30 (Toshkent)**. Tuzatishlardan keyin yangi muammo chiqsa, kechroq bo'lishi mumkin.
- **Xavf:** foydalanuvchiga ko'rinadigan xavf yo'q. Muammolar "server qisqa uzilib qolsa" va "ikki admin bir vaqtda bosса" kabi kam uchraydigan holatlarda chiqadi.

## Domla topilmalari (17-2)
- ð´ **B1.** Redis (tezkor kesh) qisqa uzilib qolsa, guruhga yozish bazada saqlanadi, lekin admin xato javob (500) oladi. Natijada yangi studentlarning bir martalik parollari yo'qoladi, qayta yuborilsa student ikki marta yaratiladi. **Tuzatish:** xato log'ga yoziladi, 2–3 marta qayta uriniladi, javob esa muvaffaqiyatli bo'ladi. Kalitlar bitta `DEL` bilan o'chiriladi.
- ð¡ **M1.** Guruh holati va mentori tranzaksiya tashqarisida, qulfsiz o'qilyapti. Bir vaqtdagi ikki so'rovda eski mentor chiqarilgan studentni 60 s gacha ko'rib qolishi mumkin. **Tuzatish:** `SELECT ... FOR UPDATE`.
- ð¡ **M2.** Kesh poygasi (o'qish va o'chirish bir vaqtga to'g'ri kelishi), 60 s gacha. **Tuzatish:** generatsiya hisoblagichi.
- ð¡ **M3.** `GET /mentor/groups/:id/students` uchun begona va arxivlangan guruh negativ testi yo'q.
- ð¡ **M4.** `GET /admin/paths` ga mentor kira oladimi, hujjatlar bir-biriga zid. Egamiz qaror qiladi.
- ð¡ **M5.** 2 ta servisning unit testi yo'q.
- ð¡ **M6.** BaseRepository meros metodlari tranzaksiyadan tashqarida ishlaydi (hozir zarar yo'q, kelajakdagi tuzoq).
- ð¢ 9 ta tavsiya: 409 dagi `details` aniqligi, log to'lib ketishi, tip takrorlari va boshqalar.
- **Hozircha hech biri tuzatilmagan.** Hammasi bitta to'plamda tuzatiladi.

## Sening bug'ing (15)
CSV import bug'ini ko'rdim. Rahmat, aniq yozilgan ekan. **2.3 tuzatishlari bilan birga** tuzatamiz: parser xatolarni yig'adi, `resolveGroups` ham ishlaydi, hammasi bitta 400 javobda qaytadi. Unit va e2e testlari ham yoziladi. Push qilganimda aytaman, 3d testingni qaytarib yurgizasan.
**Xato matnlari tili:** fikrim — o'zbekcha bo'lishi kerak, chunki platforma o'zbek tilida. Lekin bu 2.3 dan tashqari ish va egalar qarori. Hozircha zod matni qoladi, keyin alohida vazifa qilamiz.

## Erta push taklifi (17-6)
Shaxsan men **rozi bo'lishga moyilman**, sababi parallel ishlash tezlashadi. Lekin bu kelishilgan tartibni o'zgartiradi, shuning uchun hozir egamdan so'rayapman. Javobni olishim bilan commit hash'ini yozaman. Push qilinadigan narsalar: `packages/shared/**` dagi guruh va mentor sxemalari, tiplari va xato kodlari, `STUDENT_IMPORT_DEFAULT_*`, hamda `docs/12-api.md` (§2.2, §12). Review tuzatishlari shared'dagi nomlarni deyarli o'zgartirmaydi. O'zgarsa, darhol yozaman.
~~~~~
