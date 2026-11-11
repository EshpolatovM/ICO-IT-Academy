# 2.7 Review — 2-bosqich (Admin asosi)

> domla-reviewer, 2026-11-11 ~23:10. Xulosa: **blocker yo'q, `main` ga qo'shishga shartli HA.** `pnpm check` yashil (api 464, web 280, depcruise toza, jscpd 0.17%).

## (A) apps/api + packages/shared + prisma — Boltavoy sohasi
🔴/🟡 yo'q. RBAC, scope (404), kesh invalidatsiyasi (commit'dan keyin, `gen` hisoblagichi), `FOR UPDATE`, tartiblangan insert, audit tranzaksiyada, javob shakllari docs/12 ga mos.

🟢 tavsiyalar (Boltavoy qaytgach hal qiladi, Qo'ziboy tegmaydi):
1. `users.repository.ts:8`, `user-accounts.repository.ts:7` → `ACTIVE_GROUP_MEMBERSHIP_SELECT` `groups/repositories/group-members.repository.ts` dan import qilinadi; `mentor-groups.repository.ts:6` → `activeWhere` `parent-access/repositories/` dan. Select/where'larni alohida eksport faylga (`groups.selects.ts`) chiqarish kerak.
2. `ACTIVE_GROUP_MEMBERSHIP_SELECT` guruh `status` ini filtrlamaydi: arxivlangan guruh nomi "faol guruh" sifatida chiqadi (ota-ona, admin studentlar). `parent.types.ts:6` izohi aniqlashtirilsin yoki UI'da holat ko'rsatilsin.
3. `group-members.service.ts:67`, `mentor-groups.service.ts:47`, `group-enrollment.service.ts:71` da `new AppException(...)` o'rniga `groups.errors.ts` helper'lari ishlatilsin.
4. `group-candidates.repository.ts:26` INACTIVE studentni guruhga qo'shishga ruxsat beradi. Ataylabmi? docs'da qayd qilinsin.
5. jscpd: `admin-mentors.controller` ↔ `super-admins.controller`, `student-account-creator` ↔ `student-import-writer` (import bloklari).

## (B) apps/web — Qo'ziboy sohasi
🟡 1. a'zolik mutatsiyalaridan keyin admin-users studentlar keshi invalidate qilinmaydi. → tuzatilmoqda (chaqqon-tuzatkich).
🟡 2. `POST /students/:id/reset-password` o'rami ikki joyda yozilgan (admin-users, mentor-panel). → umumiy `lib/api` ga chiqarilmoqda (+ parent-tokens api).
🟢 `lookupsApi.group(id)` to'liq tafsilot yuklaydi; filtrlarda `w-64`/`w-48` (FormField `width` prop'i taklif); AddMembersForm'da studentning joriy guruhini variant yorlig'ida ko'rsatish; Combobox fix'dan keyin Playwright qayta tekshirilsin.

## (C) docs
🟡 `docs/11` §16 da `mentor:{id}:gen` yo'q edi → **tuzatildi** (`7f34cdf`).
🟢 docs/03 §3 ga 2-bosqich izohi → **qo'shildi** (`7f34cdf`). docs/01:143 `@GroupScope` izohi; guruh nomi unique emasligi (CSV import) — egaga ochiq savol; `docs/tasks/03-*` va `docs/boltavoy/xatlar/*` ham main ga ketadi (sir yo'q).

## Merge shartlari
1. (B) 🟡 1–2 tuzatilsin.
2. Keyin `pnpm build`, api e2e va Playwright (bitta jarayonda) to'liq yashil.
3. Ikkala ega ruxsati (Boltavoy qaytgach).
