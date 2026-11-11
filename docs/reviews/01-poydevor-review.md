# 1-bosqich review (domla-reviewer, 2026-11-11) — qisqa mazmun

Natija: CRITICAL yo'q, **5 HIGH**, 6 MEDIUM, 10 LOW. Lint/typecheck/jscpd/depcruise/unit — yashil, chetlab o'tish yo'q. Tech Lead qarori (avtonom rejim): H1–H5, M1–M6 va ko'p LOW lar shu bosqichda tuzatiladi (1.11a backend, 1.11b frontend).

## HIGH
| # | Muammo | Joy | Tuzatish qarori |
|---|---|---|---|
| H1 | Login rate limit parallel so'rovlar bilan chetlab o'tiladi (GET → Argon2 → INCR) | `login.service.ts:62`, `fixed-window-rate-limiter.service.ts:20` | Urinish parol tekshiruvidan **oldin** atomar INCR; muvaffaqiyatda reset; IP bo'yicha umumiy login limiti (env) |
| H2 | Bir nechta tab bir vaqtda refresh → reuse detection butun sessiyani o'ldiradi | `refresh-token.service.ts:59`, `session.ts:43` | Backend: grace oynasi (env) ichida almashtirilgan token qayta kelsa oila bekor qilinmaydi, 401 `REFRESH_SUPERSEDED`; Frontend: Web Locks API bilan tablararo refresh qulfi |
| H3 | Ota-ona paneli har yuklanishda exchange → IP limiti to'ladi (CGNAT), docs/02 §5.1 ga zid | `useParentBootstrap.ts:36`, `parent-exchange.service.ts:63` | Frontend avval `GET /auth/me`, faqat 401 da body'siz exchange; backend: GCM bilan autentifikatsiyalangan cookie tokenlari bilan muvaffaqiyatli exchange IP limitiga sanalmaydi |
| H4 | RBAC default-deny yo'q (docs/13 §8) | `roles.guard.ts:27` | `@Roles`/`@Public`/`@AnyAuthenticated` yo'q → 403; barcha route metadata'sini tekshiruvchi test |
| H5 | helmet / xavfsizlik header'lari yo'q (docs/13 §8) | `app.setup.ts`, `next.config.ts` | API'ga `helmet` (HSTS faqat prod), web'ga `X-Content-Type-Options`, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |

## MEDIUM
- M1 `incrementWithTtl` atomar emas → MULTI (INCR + `EXPIRE NX`).
- M2 `token_version` keshi parol tiklangach eskirishi mumkin → xato yutilmaydi (DEL), "faqat kattaroq versiya" yozish (Lua).
- M3 `change-password` da rate limit yo'q → user id bo'yicha limit (env).
- M4 Parent token kesh/revoke poygasi va audit tartibi → tombstone + audit tranzaksiyaga yaqin.
- M5 Production'da `change_me` sirlar o'tib ketadi → prod'da rad etish.
- M6 Frontend refresh vaqtinchalik xatoda ham logout → faqat 401/403 da tozalash.

## LOW (qarorlar)
- L1 `/auth/logout` ga CSRF guard — **tuzatiladi**. L2 access JWT `aud` — **tuzatiladi**. L3 BaseRepository'siz repository'lar — sababi izohda yoziladi. L4 `UsersRepository` boshqa moduldan — 2-bosqichga eslatma. L5 audit tranzaksiyada emas — M4 bilan birga imkon qadar. L6 `?t=` → `#t=` — **egasining qarori kerak** (docs/02 §4.4 ni o'zgartiradi). L7 auth sxemalari `z.strictObject` — **tuzatiladi**. L8 CI `pnpm audit --audit-level high` — **qo'shiladi**. L9 `/design-preview` prod'da — noto'g'ri topilma: `page.tsx:24` da allaqachon `notFound()` bor. L10 README'da TRUST_PROXY zanjir misoli — **qo'shiladi**.
