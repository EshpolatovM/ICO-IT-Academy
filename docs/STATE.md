# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (reja tasdiqlangan 2026-11-10) |
| Joriy bosqich | 1.1 — monorepo skeleti: topshiriq tayyor, agentlar yuklanishi uchun Claude Code qayta ishga tushirilishi kutilmoqda |
| Joriy git branch | `feature/01-poydevor` |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Egasining qarorlari (2026-11-10, "ha")
- 1-bosqich rejasi tasdiqlandi. Mentor uchun parent-token endpointlari 2-bosqichda qo'shiladi.
- Dizayn: oddiy standart wireframe token'lar (ko'k `#2563EB`, oq fon + neutral kulranglar, `system-ui`, hozircha faqat yorug' tema), keyin egasi to'g'rilaydi.
- S-67: kod = tokenning o'zi. S-68: Podman. Faqat dev muhit uchun seed (1 mentor, 1 student) qilinadi.
- pnpm 10.34.9 `~/.local` ga o'rnatildi (global npm prefix'ga ruxsat yo'q edi).
- `podman compose` ishlaydi (podman-compose 1.6.0 o'rnatilgan).
- Agentlarga ism berildi: usta-baza (DB), oga-backend, rassom-dizayner (UI), birchka-frontend, sinchkov-tester (QA), domla-reviewer (review).

## Oxirgi bajarilgan vazifa
0-qadam yakunlandi:
- 6 ta subagent yaratildi: `.claude/agents/{usta-baza, oga-backend, rassom-dizayner, birchka-frontend, sinchkov-tester, domla-reviewer}.md`.
- `CLAUDE.md` ga jarayon qoidalari qo'shildi.
- Egasining javoblari (S-15, S-30, S-45, S-61) hujjatlarga kiritildi, yangi savollar S-67 va S-68 qo'shildi.
- 46 ta Mermaid diagrammasi `@mermaid-js/mermaid-cli` bilan tekshirildi: xatosiz (bittasi tuzatildi: 01).

## Keyingi aniq vazifa
**1.1-vazifa** — `docs/tasks/01-1.1-monorepo-skeleti.md` dagi matnni to'liq prompt sifatida `oga-backend` agentiga ber (Agent tool, subagent_type: oga-backend). Agent hali yuklanmagan bo'lsa (2026-11-10 da 'not found' xatosi chiqdi), egasidan Claude Code'ni qayta ishga tushirishni so'ra. Qisqa mazmuni: — monorepo skeleti (`oga-backend` agentiga: pnpm workspaces + Turborepo, `apps/api`, `apps/web`, `packages/shared` (`@lms/shared`), TypeScript strict, ESLint/Prettier, `compose.yaml` (Postgres, Redis, MinIO), `.env.example`). Tayyorlik mezoni: `pnpm install`, `pnpm lint`, `pnpm typecheck` o'tadi va ilovalar bo'sh holatda ishga tushadi.

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
