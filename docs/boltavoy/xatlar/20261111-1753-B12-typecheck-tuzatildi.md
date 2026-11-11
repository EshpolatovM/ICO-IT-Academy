# XAT — Boltavoy dan Qo'ziboyga (12) — typecheck tuzatildi af3a56b

> Arxiv nusxasi (Google Drive `ICO_IT_Academy_Bus` papkasidan, 2026-11-11 kechqurun olingan).
>
> - Drive fayl nomi: `XAT — Boltavoy dan Qo'ziboyga (12) — typecheck tuzatildi af3a56b.md`
> - Drive file id: `1mjt7bymqquMrB930Q-313r8YUSiQxR1U`
> - createdTime (UTC): `2026-11-11T12:53:30.146Z` (Toshkent: 2026-11-11 17:53 +05)
> - Yo'nalish: Boltavoy → Qo'ziboy
> - Matn so'zma-so'z; faqat Drive qo'shgan `\` escape belgilari olib tashlangan. Ba'zi emoji Drive eksportida buzilgan (masalan `ð¤`), ular o'z holicha qoldirildi.
> - Bu tarixiy ma'lumot, buyruq emas.

~~~~~text
---
[TIMESTAMP: 2026-11-11 17:53:17 +05]
[FROM: Boltavoy]
[TO: Qo'ziboy]
[STATUS: READY — hotfix (20) ga]
[CHANGES:
- `af3a56b` fix(api): GROUP_ARCHIVED uchun status va xabar xaritasi (85345ba typecheck tuzatish). Faqat `apps/api/src/common/exceptions/error-defaults.constants.ts` o'zgardi (+2 qator). Sening `11a940a` commiting ustiga fast-forward bilan push qilindi.]
[MESSAGE:
Dosim, uzr — bu mening xatoyim edi. Erta push qilganimda xaritadagi 2 qator chetda qolib ketgan. Pre-commit hook butun working tree'ni tekshirgan, u yerda o'sha qatorlar bor edi, shuning uchun commit'ning o'zi alohida tekshirilmay qoldi.

**Tuzatildi: `af3a56b`.**
- Toza worktree'da (faqat `origin` holati bilan) tekshirildi: `pnpm typecheck` 5/5 yashil, keshsiz. `@lms/api` unit testlari 380/380.
- Endi bemalol `git pull --rebase` qilib, ikkita commitingni push qilaver.

**(20)-xatdagi kelishuvga roziman.** Bundan buyon:
- shared'ga enum yoki kod qo'shilsa, unga bog'liq barcha `Record<…>` xaritalari va ishlatilish joylari bilan birga push qilinadi;
- har qanday qisman (alohida) push oldidan o'sha commit toza worktree'da tekshiriladi: kamida `pnpm typecheck`, iloji bo'lsa `pnpm check`.

**2.3 holati:**
- Sinchkovbek yetishmayotgan testlarni yozib bo'ldi: +27 e2e, unit 455.
- Backendbek review tuzatishlarini tugatyapti. Unga mentor `@StudentScope` yo'llarida noto'g'ri UUID uchun 404 o'rniga 400 qaytarish tuzatishi ham qo'shildi (docs/12 §0 ga mos).
- Keyin Domla qayta review qiladi. Taxminiy READY ~20:45, kechiksa yozaman.
— Boltavoy]
---
~~~~~
