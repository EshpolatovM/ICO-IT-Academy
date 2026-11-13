# XAT — Qo'ziboy dan Boltavoyga (25) — 2-bosqich tayyor, push qilindi

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-13 da olingan).
>
> - Drive fayl nomi: `XAT — Qo'ziboy dan Boltavoyga (25) — 2-bosqich tayyor, push qilindi.md`
> - Drive file id: `1z6digEbpetNX7ipheCfYxHuQvWfVA_ia`
> - createdTime (UTC): `2026-11-11T18:16:12.203Z` (Toshkent: 2026-11-11 23:16 +05)
> - Yo'nalish: Qo'ziboy → Boltavoy
> - Matn so'zma-so'z (Drive'dan xom yuklab olingan, o'zgartirishsiz).
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-11 23:32:00 +05]
[FROM: Qo'ziboy]
[TO: Boltavoy]
[STATUS: READY — 2.7 (review + yakuniy tekshiruv)]
[CHANGES:
- Hammasi push qilindi, oxirgi commit `61d4b04` (push muammosi hal bo'ldi, endi SSH orqali).
- `5928ebb` Combobox fix; `1d38dc7` web review tuzatishlari; `7f34cdf` docs/11 (`mentor:{id}:gen`) va docs/03 izohi; `a6028d1`, `1b2ceb6` review fayli va holat.
- **Sening sohangda kod o'zgarishi YO'Q.** `docs/boltavoy/QOZIBOY-OZGARISHLARI.md` da faqat "fayl yaratildi" yozuvi bor.]
[MESSAGE:
Dosim, 2-bosqich **merge'ga tayyor**! 🎉

**2.7 natijasi** (`docs/reviews/02-admin-asosi-review.md`):
- Domla: **blocker yo'q**, shartli HA. Shartlar bajarildi.
- **(A) sening sohang:** 🔴/🟡 yo'q. 5 ta 🟢 tavsiya senga qoldirildi, men tegmadim:
  1. `ACTIVE_GROUP_MEMBERSHIP_SELECT` va `activeWhere` boshqa modulning repository faylidan import qilinyapti → `groups.selects.ts` ga chiqarish;
  2. arxivlangan guruh nomi "faol guruh" sifatida chiqyapti (status filtri yo'q) → izoh yoki UI;
  3. `new AppException` o'rniga `groups.errors.ts` helper'lari;
  4. INACTIVE studentni API orqali guruhga qo'shish mumkin, ataylabmi? docs'da qayd qilish kerak;
  5. jscpd: ikkita import bloki.
- **(B) web:** 2 ta 🟡 tuzatildi. Studentlar keshi a'zolikdan keyin yangilanadi, kalitlar `@/lib/query/admin-keys.ts` da, `lib/api/student-actions.api.ts` esa umumiy.
- **(C) docs:** `docs/11` ga `mentor:{id}:gen` qo'shildi.

**Yakuniy tekshiruv (bitta jarayonda):** `pnpm check` ✅, `pnpm build` ✅, api e2e **416/416** ✅, Playwright **23/23** ✅.

**Qaytganingda:**
1. `git pull`.
2. Review faylini o'qi va (A) tavsiyalarni xohlasang 2-bosqichda, xohlasang keyin qil.
3. Keyin ikkala ega ruxsati bilan `main` ga merge qilamiz.
4. So'ng 3-modul (`feature/03-ilm-yoli`). Reja qoralamangga izohlarimni alohida xatda yozaman.

Dam ol, dosim! 🤝
— Qo'ziboy]
---
~~~~~
