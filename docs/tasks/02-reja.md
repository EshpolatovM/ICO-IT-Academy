# 2-bosqich rejasi — Admin asosi: foydalanuvchilar va guruhlar

> Tech Lead rejasi (2026-11-11). Egasi to'liq vakolat bergan — tasdiq kutilmaydi. Manba: `docs/14-yol-xaritasi.md` §2, `docs/01`, `docs/03` §3–§4, `docs/11` §1–§3, `docs/12` §2, `docs/99` (S-01 B, S-02 A, S-03 A, S-07 A, S-08 A, S-10 A, S-11 A, S-14 A, S-21).
> Branch: `feature/02-admin-asosi` (`main` dan, 1-bosqich merge qilingandan keyin).

## Vazifalar
| # | Agent | Vazifa |
|---|---|---|
| 2.1 | usta-baza | `learning_paths` (docs/11 §3 bo'yicha to'liq ustunlar, `ContentStatus` enum; bo'lim/mavzular 3-bosqichda), `groups`, `group_members` (partial unique — bitta faol guruh), indekslar; dev seed: 1 yo'l, 1 guruh (seed mentor biriktirilgan, `ST-10001` a'zo) |
| 2.2 | oga-backend | Foydalanuvchilar: `/super/admins` (SA), `/admin/mentors`, `/admin/students` CRUD (qidiruv, filtr, pagination), deaktivatsiya (`status=INACTIVE`, `token_version++`, sessiyalar va parent token keshi), student yaratishda vaqtinchalik parol (bir marta), CSV import (S-21), audit |
| 2.3 | oga-backend | Guruhlar: `/admin/groups` CRUD, `PUT /admin/groups/:id/mentor`, a'zolar qo'shish/chiqarish; yo'llar ro'yxati (faqat o'qish, guruh formasi uchun); haqiqiy `StudentScopeResolver` (mentor → `group_members`, Redis kesh 60 s, a'zolik o'zgarganda invalidatsiya; scope tashqarisi 404); mentor: `GET /mentor/groups`, `/mentor/groups/:id`, `/mentor/groups/:id/students`, `GET /mentor/students/:id` (progress'siz); mentor uchun reset-password va parent-token endpointlari ochiladi; parent `children[].groupName` |
| 2.4 | rassom-dizayner | UI: `Table` (sarlavha, saralash belgisi, bo'sh holat), `Pagination`, `Select`, `SearchInput`, `Dialog`/`Modal`, `Badge` (status), `Tabs`, `Textarea`, `FileInput` (CSV), `SecretReveal` (vaqtinchalik parol/token — bir marta ko'rsatish + nusxa olish) |
| 2.5 | birchka-frontend | Admin: Studentlar, Mentorlar, Adminlar (SA), Guruhlar (ro'yxat + tafsilot, mentor biriktirish, a'zolar), yaratish/tahrirlash formalari, CSV import; Mentor: Guruhlar, Guruh tafsiloti, Student profili (parol tiklash, ota-ona tokenlari: yaratish/bekor qilish/qayta yaratish) |
| 2.6 | sinchkov-tester | RBAC matritsasini 2-bosqich endpointlari bilan kengaytirish; mentor boshqa guruh studentini ko'ra olmaydi (404); admin admin yarata olmaydi; student ikki faol guruhda bo'la olmaydi; Playwright: admin student/mentor/guruh yaratadi, mentor o'z studentini ko'radi va token beradi |
| 2.7 | domla-reviewer | Butun 2-bosqich review → tuzatishlar → yakuniy test → `main` ga merge |

## Tayyorlik mezoni (docs/14 §2)
Admin student/mentor/guruh yaratadi va mentorni biriktiradi. Mentor faqat o'z studentlarini ko'radi, parolini tiklaydi va ota-ona tokeni beradi. Barcha tekshiruvlar (check, build, api e2e, Playwright) yashil.
