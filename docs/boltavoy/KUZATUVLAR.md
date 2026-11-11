# KUZATUVLAR (Boltavoy, 2026-11-11)

> Faqat o'qib topilgan narsalar. Hech biri tuzatilmagan, qaror egalar bilan qabul qilinadi.

## Yaxshi tomonlar (tekshirilgan)
- `eslint-disable`, `@ts-ignore`, `any` yo'q; `noInlineConfig: true`.
- Controller'lar ingichka; Prisma faqat repository va `infra/prisma` da.
- Har bir controller'da RBAC decorator; `RolesGuard` deny-by-default.
- Web'da `fetch` faqat `lib/api/` da; sahifalarda yo'q; `../../` importi yo'q.
- Kodda sir yo'q, `.env` git'da emas.
- Haqiqiy TODO/FIXME yo'q.

## Kod bo'yicha shubhali joylar
1. **Tranzaksiya xavfi (taxmin):** `UserAccountsRepository` (`admin-users/repositories/user-accounts.repository.ts:74`) va `UsersRepository` (`users/repositories/users.repository.ts:55`) da meros metodlar `prisma.db.user` ishlatadi, o'z metodlari esa `prisma.client`. Meros metodlar `UnitOfWork` ichida chaqirilsa tranzaksiyaga kirmasligi mumkin. domla-reviewer tekshirishi kerak.
2. **`users` jadvali ustida ikki repository** (`UsersRepository`, `UserAccountsRepository`) — DRY nuqtai nazaridan ko'rib chiqish.
3. **BaseRepository'dan meros olmaganlar:** `AuditLogsRepository`, `ParentAccessTokensRepository`, `UserSearchRepository`, `GroupsRepository`, `GroupMembersRepository`, `StudentCodeRepository`, `DatabaseHealthRepository` (ba'zilari asoslangan: xom SQL, append-only).
4. **API'da `../../../` importlari ~193 ta** (~50 fayl), `apps/api` da path alias yo'q. Qoida rasman frontend uchun, lekin bir xillik uchun alias qo'shish mumkin.
5. **Pre-commit testlarni yurgizmaydi** (CLAUDE.md "tegishli testlar" deydi). CI'da `format:check` yo'q.

## Jarayon va hujjatlardagi nomuvofiqliklar
1. **Ish rejimi:** `CLAUDE.md` — "sekin va nazorat ostida"; `docs/STATE.md:12` — "to'liq avtonom"; task fayllarida "savol berma". Qaysi biri amalda?
2. **Branch:** STATE.md, PROJECT_STATE.md, AGENT_BUS.md `feature/02-admin-asosi` deydi — branch yo'q, 2.x commitlar to'g'ridan-to'g'ri `main` ga tushgan va push qilingan (CLAUDE.md qoidasiga zid).
3. **Remote:** hujjatlar "remote sozlanmagan" deydi, lekin `origin` (GitHub) bor va ishlatilgan.
4. **Agentlar bo'linmasi:** PROJECT_STATE/AGENT_BUS'dagi Claude-1 = backend, Agent-2 = frontend modeli Qo'ziboyning 2-xati bilan bekor qilindi — fayllar hali eski modelda.
5. **Ikki xil AGENT_BUS:** git'dagi va Drive'dagi nusxalar farq qiladi; Qo'ziboy git'ida bus commitlari revert qilingan.
6. **Task fayllarida boshqa mashina yo'li:** `/home/miraziz/developer/startup/ICO_IT_Academy` (`docs/tasks/02-2.1-baza.md:6`, `02-2.3-groups-scope.md:6`).
7. **Redis kaliti:** `docs/01:145`, `docs/11:772` — `mentor:{id}:studentIds`; `02-2.3:17` — `mentor:{id}:students`.
8. **Mentor javob namunasi:** `docs/12-api.md` §12 da `progress/xp/streak`, 2.3 esa ularni qaytarmaydi.
9. **`GET /admin/paths`:** `docs/12:221` — "GET: M ham", 2.3 — faqat SA A.
10. **STATE.md ichida:** sana 11-10 (ichida 11-11 ma'lumoti), "2.3" ikki marta, S-01/S-02 "kutilmoqda" (99-faylda hal qilingan), S-12 "tasdiqlangan" (99-faylda taxmin).
11. **Eskirgan matnlar:** `docs/README.md:22` (66 savol), `docs/13:111` (`modules/users`), `docs/12:18` (class-validator), `docs/14:55` (throttler).

## Ochiq savollar (2/3-bosqichga ta'sir qiladi)
- 🔴 S-65 jamoa/muddat/MVP; S-05 masshtab.
- Taxmin, tasdiqlanmagan: S-07, S-08, S-10, S-11, S-14, S-17, S-18, S-21.
- 3-bosqich uchun: S-31, S-32, S-34, S-35, S-36, S-04.

## Egalarga savollar
1. Asosiy kanal qaysi: git'dagi AGENT_BUS yoki Drive XAT fayllari?
2. Ish rejimi: sekin (CLAUDE.md) yoki avtonom (STATE.md)?
3. `feature/02-admin-asosi` branch'ini ochib, 2-bosqichni u yerda davom ettiramizmi?
4. GitHub remote bor — ikkala tomon shunga push/pull qilsinmi? Qo'ziboydagi commitlar qachon push qilinadi?
5. Bu mashinada pnpm o'rnatib `pnpm install` qilishga ruxsat bormi?
