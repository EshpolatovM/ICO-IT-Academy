# HOLAT (Boltavoy, 2026-11-11)

## Git
- **Yangilanish (17:40):** Qo'ziboy `feature/02-admin-asosi` ni GitHub'ga push qildi (`491e08d`). Boltavoy shu branch'ga o'tdi; ikkala sessiya shu branch'da ishlaydi (`git pull --rebase`, force push yo'q).
- Dastlabki holat: branch `main` (lokal), `feature/02-admin-asosi` o'sha paytda mavjud emas edi.
- Oxirgi commit: `b8c747f chore(agents): Agent-2 INIT, kanalga ulanish tasdig'i`
- `git status`: toza (faqat shu `docs/boltavoy/` fayllari, commit qilinmagan).
- Remote: `origin` → GitHub `EshpolatovM/ICO-IT-Academy`. `origin/main` = `06db851`, lokal 1 commit oldinda (push qilinmagan).
- Qo'ziboy aytgan `a47620b`, `a7551db`, `55cefbd`, `d1c8d01` — bizda ham, `origin` da ham yo'q.

## `pnpm check`
- Avval ishlamadi (pnpm yo'q edi). pnpm 10.34.9 `~/.local/bin` ga o'rnatildi, `pnpm install --frozen-lockfile` qilindi (PATH'ga `~/.local/bin` qo'shish kerak).
- **Natija: EXIT 0, hammasi yashil** — lint, typecheck, jscpd (2 klon, 0.09% < 3%), depcruise (0 buzilish, 468 modul), api unit 380/380 (66 suite), web 144/144 (29 fayl).
- Eslatma: pnpm `@prisma/engines`, `prisma`, `esbuild`, `@parcel/watcher` build skriptlarini o'tkazib yubordi (`pnpm approve-builds`). Migrate/e2e uchun kerak bo'lishi mumkin.
- api e2e va Playwright hali yurgizilmagan (baza/compose kerak).

## Joriy vazifa
- **2.3 — guruhlar API + mentor scope** Boltavoyga berildi (Qo'ziboy xati (4), egalar tasdig'i). Qo'ziboy: 2.5a.
- Kanal: Drive XAT fayllari. Ish rejimi: sekin va nazorat ostida.

## Agentlar
`.claude/agents/` da 6 tasi bor va sessiyada ko'rinadi: usta-baza, oga-backend, rassom-dizayner, birchka-frontend, sinchkov-tester, domla-reviewer.

## 2-bosqich holati
| # | Vazifa | Holat |
|---|---|---|
| 2.1 | Baza: learning_paths, groups, group_members, seed | DONE |
| 2.2 | Foydalanuvchilar API + CSV import | DONE (`186107f`, `aa1f773`) |
| 2.3 | Guruhlar API, mentor scope | TODO — kod boshlanmagan (faqat o'qish repository'lari va `GroupEnrollmentService`) |
| 2.4 | UI komponentlar | DONE |
| 2.5a | Admin: studentlar/mentorlar/adminlar sahifalari | TODO (API tayyor) |
| 2.5b/c | Admin guruhlar, mentor sahifalari | TODO (2.3 kerak) |
| 2.6a/b | API e2e+RBAC, Playwright | TODO |
| 2.7 | Review → merge | TODO |

## Tayyor
- 1-bosqich to'liq: monorepo, sifat nazorati, baza, 3 xil auth, ota-ona kirishi, UI token'lar, frontend auth; review topilmalari (5 HIGH) tuzatilgan.
- 2.2 backend; 2.4 UI komponentlar.

## Chala
- Mentor scope: `role-based-student-scope.resolver.ts:43-48` MENTOR uchun doim 403 (ataylab, 2.3 gacha) → mentor parol tiklash va ota-ona tokeni yopiq.
- Web: admin/mentor/student sahifalari hali stub (ComingSoon). Ishlaydiganlari: login, change-password, parent.
- `modules/groups` `AppModule` ga ulanmagan, controller yo'q.
