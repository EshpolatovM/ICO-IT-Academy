# Qo'ziboy o'zgarishlari — Boltavoy sohasida

> B17 (2026-11-11 19:14) kelishuvi: Boltavoy yo'qligida Qo'ziboy `apps/api/**`, `packages/shared/**`, `docs/12-api.md`, `docs/tasks/03-*`, `docs/boltavoy/**`, `.env.example` ga tegsa, har bir o'zgarish shu yerga yoziladi. Yangi yozuvlar oxiriga qo'shiladi.
>
> Yozuv formati: **sana/vaqt (Toshkent)** · **commit** · **fayllar va funksiyalar** · **nima uchun** · **oldin → keyin** · **testlar** · **API kontrakti o'zgardimi** (o'zgarsa docs/12 ham) · **ochiq savollar**.

## 2026-11-11 23:00 — fayl yaratildi
- Hali Boltavoy sohasida hech qanday kod o'zgarishi yo'q.
- 2.6b (Playwright) jonli 2.3 API bilan 23/23 yashil, API bug topilmadi.
- Navbatda (agar qilinsa, shu yerga yoziladi): (1) 2.7 review'dagi (A) bo'lim topilmalari; (2) `apps/api/test/support/web-e2e-users.ts` ga `delete-groups` buyrug'i (e2e arxivlangan test guruhlari yig'ilib qolyapti; `deleteTestGroups` tayyor).

## 2026-11-11 23:32 — kechki ishlar xulosasi (Boltavoy uchun)
- **Sening sohangda KOD o'zgarishi YO'Q** (`apps/api`, `packages/shared`, `.env.example`, `docs/12-api.md`, `docs/tasks/03-*` — tegilmagan).
- 2.7 review: (A) bo'limda faqat 🟢 tavsiyalar, ular senga qoldirildi → `docs/reviews/02-admin-asosi-review.md`.
- Yakuniy tekshiruv `feature/02-admin-asosi`: check, build, api e2e 416/416, Playwright 23/23 — yashil. **02 merge'ga tayyor**, ikkala ega ruxsati kutilmoqda.
- 3-modul reja qoralamang frontend nuqtai nazaridan ko'rib chiqildi → `docs/reviews/03-reja-frontend-izoh.md`: B-1, B-2 QIZIL va Q-1…Q-9 savollari (Drive (26)-xat).
- **Yangi branch `feature/03-ilm-yoli`** ochildi (stacked, 02 ustidan). Hozircha unda faqat `components/ui` dagi 3.4a ishlari bor. 3.1–3.3 ni shu branch'da qilasan; 02 merge bo'lgach `main` ustiga rebase qilamiz.
- Drive xatlari: (24) 2.6b READY, (25) 2.7 READY, (26) 3-modul savollari.
