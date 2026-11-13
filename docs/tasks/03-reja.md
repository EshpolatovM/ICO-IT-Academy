# 3-bosqich rejasi — Ilm yo'li va darslar

> Tech Lead (Qo'ziboy) rejasi, 2026-11-11. Holat: **QORALAMA**. 2-bosqich `main` ga qo'shilgandan keyin boshlanadi. Vazifalarni Boltavoy bilan taqsimlash 2.7 da kelishiladi.
> Manba: `docs/14-yol-xaritasi.md` §3, `docs/05-ilm-yoli-va-takrorlash.md` §1–3, `docs/11-database.md` (yo'l jadvallari), `docs/12-api.md` §3–§4, `docs/03-sahifalar.md` §2.1–2.2 va §4 (Ilm yo'llari, Dars muharriri), `docs/01` §2.2.
> Branch: `feature/03-ilm-yoli` (2-bosqich `main` ga qo'shilgandan keyin `main` dan ochiladi).

## Maqsad (tayyorlik mezoni, docs/14 §3)
Admin yo'l yaratadi va nashr qiladi. Student xaritani ko'radi, darslarni ketma-ket o'qiydi, progress foizi to'g'ri ko'rsatiladi.

## Vazifalar
| # | Agent | Vazifa |
|---|---|---|
| 3.1 | usta-baza | `path_sections`, `topics`, `lessons`, `path_chests`, `skills`, `topic_skills`, `student_path_enrollments`, `topic_progress`, `lesson_progress` (`learning_paths` 2.1 da bor). Tartib (`order`), unique va FK indekslar. Enrollment: guruh yo'lidan avtomatik biriktirish (S-01 B). Dev seed: "Frontend" yo'lida 2 bo'lim, 4 mavzu, 8 dars, 1 sandiq |
| 3.2 | oga-backend | Admin kontent API (docs/12 §3): yo'l, bo'lim, mavzu, dars, sandiq va ko'nikmalar CRUD; tartiblash (`PUT …/order`); nashr qilish (`DRAFT → PUBLISHED`). Mentor uchun `GET /admin/paths`, `/tree` faqat o'qish (Q18 qarori) |
| 3.3 | oga-backend | Student API (docs/12 §4): `GET /student/path` (Redis kesh + invalidatsiya), `/topics/:id`, `/lessons/:id`, `start`, `complete`; ochilish qoidalari (docs/05 §2.1, §2.3); progress materializatsiyasi (§3); `lesson.completed` va `topic.completed` domen hodisalari. Takrorlash bloki uchun hook (`REVIEW_REQUIRED` 6-bosqichda yoqiladi, hozir doim "o'tkazadi"). XP/coin berish 5-bosqichda (hodisa orqali) bo'ladi. Sandiq holati `LOCKED/READY` ko'rsatiladi, ochish 5-bosqichda |
| 3.4 | rassom-dizayner | UI: daraxt (tree) ro'yxati va tartiblash tugmalari (yuqoriga va pastga; drag-and-drop keyinroq), Markdown ko'rinishi (preview), xarita tugunlari (mavzu, sandiq, holatlar: LOCKED/AVAILABLE/IN_PROGRESS/COMPLETED). Wireframe: animatsiya yo'q |
| 3.5 | birchka-frontend | Admin: `/admin/paths` (ro'yxat), yo'l daraxti muharriri, `/admin/lessons/:id` Markdown muharriri + preview. Student: `/path` xarita (zanjir, sandiqlar, progress), mavzu va dars o'qish sahifasi (Markdown, kod bloklari, video havola) |
| 3.6 | sinchkov-tester | Ketma-ketlik qoidalari (LOCKED dars → 403), nashr qilinmagan kontent studentga ko'rinmaydi, progress hisoblash, RBAC matritsasi (mentor faqat o'qiydi). Playwright: admin yo'l yaratib nashr qiladi, student 2 darsni ketma-ket o'qiydi va progress oshadi |
| 3.7 | domla-reviewer | Review → tuzatishlar → yakuniy test → `main` ga merge (egasi ruxsati bilan) |

## Tech Lead qarorlari (taklif)
- **S-31 (mavzu yakunlanishi):** 3-bosqichda mavzu = barcha darslar yakunlangan. Savollar bo'yicha `pass_threshold` 4-bosqichda (savollar bazasi) qo'shiladi.
- **S-35:** docs/05 §1.1 dagi taxmin qabul: ochilgan narsa qayta yopilmaydi, dars versiyalanmaydi.
- **S-36:** test-out yo'q.
- **Drag-and-drop:** 3-bosqichda yuqoriga/pastga tugmalari bilan. DnD kutubxonasi (yangi paket) keyinroq, alohida qaror bilan.
- **Markdown renderer** uchun yangi paket kerak bo'ladi (masalan `react-markdown` + sanitizatsiya). Lockfile umumiy fayl, shuning uchun Boltavoy bilan kelishib, bitta commitda qo'shiladi. XSS: HTML o'chiriladi, faqat xavfsiz Markdown.
- **M-4 / Q-11 (B20 kelishuvi):** `/admin/skills` va mavzuga ko'nikma biriktirish UI'si 3.5 dan chiqarildi → 3.5b (7-modul oldidan); backend API 3.2 da qoladi. Dars muharriridagi "bog'langan savollar" — 4-modul.
- **3.5 frontend holati (2026-11-13):** 3.4b Markdown `f998fb0`, 3.5a student sahifalari `e774819`, 3.5-admin kontent sahifalari `efe40d2` — mock API bilan; 3.2/3.3 tayyor bo'lgach real API'ga ulanadi.
- **Xarita dizayni** ("asosiy dizayn ishi", docs/14) hozir wireframe darajasida: oddiy vertikal ro'yxat va holat belgilari. Haqiqiy dizaynni egasi keyin beradi.

## Bog'liqliklar va xavflar
- 2-bosqich (`groups.path_id`) `main` da bo'lishi kerak.
- 5-bosqich (XP/coin) va 6-bosqich (takrorlash) uchun hozirdan hook va hodisalar qoldiriladi, kod qattiq bog'lanmaydi.
- Ochiq savollar (`docs/99`): S-31 🟡. Yuqoridagi taklif egasi yoki Tech Lead qarori bilan yopiladi.
