# AGENT_BUS — Agentlararo aloqa logi

> Claude-1 (Backend Lead / Arxitektor) ↔ Agent-2 (Frontend) o'rtasidagi yagona aloqa kanali.
> Joriy vazifalar taqsimoti va statuslar: [`PROJECT_STATE.md`](PROJECT_STATE.md). API manbasi: [`docs/12-api.md`](docs/12-api.md).

## Qoidalar

1. Har qanday kod yozishdan **oldin** shu faylning oxirgi blokini o'qing.
2. Faqat faylning **oxiriga** yozing. Eski bloklar tahrirlanmaydi va o'chirilmaydi (append-only).
3. Vazifa tugagach: avval `PROJECT_STATE.md` dagi statusni yangilang, keyin shu yerga blok qo'shing.
4. Sinxronizatsiya git orqali: yozishdan oldin `git pull --rebase`, yozgandan keyin commit + push. Konflikt bo'lsa ikkala blok ham saqlanadi (vaqt tartibida).
5. Vaqt formati: `YYYY-MM-DD HH:MM:SS +05` (Toshkent).

## Status qiymatlari

| STATUS        | Ma'nosi                                              |
| ------------- | ---------------------------------------------------- |
| `INIT`        | Kanal ochildi / agent ulandi                         |
| `READY`       | Vazifa tugadi, ikkinchi agent ishni boshlashi mumkin |
| `IN_PROGRESS` | Ish boshlandi (boshqa agent shu sohaga tegmasin)     |
| `BLOCKED`     | To'siq bor, javob kerak                              |
| `QUESTION`    | Savol (javob `REPLY` bilan)                          |
| `REPLY`       | Savolga javob                                        |

## Blok formati

```
---
[TIMESTAMP: YYYY-MM-DD HH:MM:SS +05]
[FROM: Claude-1 (Backend) | Agent-2 (Frontend)]
[STATUS: INIT | READY | IN_PROGRESS | BLOCKED | QUESTION | REPLY]
[CHANGES: qilingan ishlar ro'yxati (fayllar, endpointlar, migratsiyalar)]
[MESSAGE: ikkinchi agent uchun aniq yo'riqnoma va API spec havolasi]
---
```

## Log

---

[TIMESTAMP: 2026-11-11 14:31:00 +05]
[FROM: Claude-1 (Backend)]
[STATUS: INIT]
[CHANGES:

- `AGENT_BUS.md` (shu fayl) va `PROJECT_STATE.md` yaratildi.
- Backend / Frontend vazifalar bo'linmasi `PROJECT_STATE.md` ga yozildi (2-bosqich: Admin asosi).]
  [MESSAGE: Agent-2, aloqa kanali ochildi.

1. Avval o'qing: `CLAUDE.md` (jarayon va kod qoidalari), `PROJECT_STATE.md`, `docs/STATE.md`, `docs/tasks/02-reja.md`.
2. Branch: `feature/02-admin-asosi`. 1-bosqich `main` da; 2.1 (baza) va 2.4 (UI komponentlar: Table, Pagination, Dialog, Tabs, SecretReveal...) tayyor.
3. Backend hozir 2.2 (`/super/admins`, `/admin/mentors`, `/admin/students` CRUD, CSV import) ustida ishlayapti; keyin 2.3 (guruhlar, mentor scope). Spec: `docs/12-api.md` §2, vazifa fayllari `docs/tasks/02-2.2-users.md`, `docs/tasks/02-2.3-groups-scope.md`.
4. Sizning navbatdagi ishingiz — 2.5 (admin/mentor sahifalari). Endpointlar tayyor bo'lmaguncha faqat sahifa skeleti va `@lms/shared` dagi tiplar asosida tayyorlang; API ulanishini men `READY` blokini yozgandan keyin boshlang.
5. `apps/api/**`, `apps/api/prisma/**` — mening sohamda, o'zgartirmang. `packages/shared/**` ga o'zgarish kerak bo'lsa avval shu yerda `QUESTION` yozing.
   Ulanganingizni `STATUS: INIT` blok bilan tasdiqlang.]

---
