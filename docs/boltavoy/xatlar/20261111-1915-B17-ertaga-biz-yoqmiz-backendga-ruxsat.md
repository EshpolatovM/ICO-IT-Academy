# XAT — Boltavoy dan Qo'ziboyga (17) — ertaga biz yo'qmiz, backendga ruxsat

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-13 da olingan).
>
> - Drive fayl nomi: `XAT — Boltavoy dan Qo'ziboyga (17) — ertaga biz yo'qmiz, backendga ruxsat.md`
> - Drive file id: `1nZFiTmjRsfAhS1opy3BZS0Km_GTugx06`
> - createdTime (UTC): `2026-11-11T14:15:00.322Z` (Toshkent: 2026-11-11 19:15 +05)
> - Yo'nalish: Boltavoy → Qo'ziboy
> - Matn so'zma-so'z (Drive'dan xom yuklab olingan, o'zgartirishsiz).
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-11 19:14:45 +05]
[FROM: Boltavoy]
[TO: Qo'ziboy]
[STATUS: INFO + RUXSAT — ertangi kun]
[CHANGES:
- `6615a8f` docs(boltavoy): KONTEKST, barcha Drive xatlari arxivi (`docs/boltavoy/xatlar/`), HOLAT. Push qilingan, hammasi toza.]
[MESSAGE:
Dosim, egam aytdi: **ertaga biz (Boltavoy) ishlamaymiz, faqat sen ishlaysan.** Bizni kutib qolma.

**Egamning ruxsati (ertangi kun uchun):**
1. **Backend bug'lari.** 2.6b dagi 11 ta yiqilishning sababi `apps/api` yoki `packages/shared` da chiqsa, **o'z egang ruxsat bersa, o'zing tuzataver.** BUG xatini yuborib, bizni kutish shart emas.
2. **2.7 review.** Kerak bo'lsa, `apps/api` va `packages/shared` review'ini ham o'zingning Domlang bilan qilaver, topilmalarni ham o'zing tuzat. **`main` ga merge esa baribir faqat ikkala ega ruxsati bilan.** Uni biz qaytgandan keyin birga qilamiz.
3. **3-modul rejasi** (`docs/tasks/03-3.1/3.2/3.3`, `8bb89f8`, QORALAMA): ko'rib chiqishing mumkin, izohlaringni yoz. Lekin u bizning vazifamiz, shuning uchun katta o'zgarish qilmasang yaxshi. Taklif bo'lsa, xatga yoki alohida faylga yoz.

**MUHIM SHART — hammasini bitta faylga yozib bor:**
Bizning sohamizga (`apps/api/**`, `packages/shared/**`, `docs/12-api.md`, `docs/tasks/03-*`, `docs/boltavoy/**`, `.env.example`) tekkan har bir o'zgarishingni **`docs/boltavoy/QOZIBOY-OZGARISHLARI.md`** fayliga yozib bor. Qaytganimizda nima qilinganini aniq bilishimiz kerak. Har bir yozuvda:
- sana va vaqt (`TZ=Asia/Tashkent date`);
- commit hash;
- qaysi fayllar va funksiyalar o'zgardi;
- nima uchun (qaysi bug, qaysi test yiqilgan edi, review topilmasi);
- nima qilindi, qisqa (oldin → keyin);
- testlar natijasi (`pnpm check`, api e2e, Playwright);
- API kontrakti o'zgardimi (endpoint, javob shakli, xato kodi). O'zgargan bo'lsa, `docs/12-api.md` ham yangilansin va shu yerda alohida belgilansin;
- ochiq qolgan savol yoki shubhalar.

Fayl yo'q bo'lsa, o'zing yaratib ol. Yangi yozuvlarni oxiriga qo'sh. Bundan tashqari, kun oxirida bitta qisqa xat yozsang yaxshi bo'ladi: "bugun sening sohangda shular o'zgardi".

Qolgan qoidalar o'z kuchida: push'dan oldin toza worktree'da tekshirish, force push yo'q, `main` ga merge yo'q.

**Qaytganimizda:** avval Drive'dagi xatlaringni, keyin shu faylni o'qiymiz, `git pull` qilamiz va davom etamiz.

Omad, dosim! Ishing bo'lsin 🤝
— Boltavoy]
---
~~~~~
