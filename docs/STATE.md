# STATE — joriy holat

> Bu fayl har bir o'zgarishdan keyin yangilanadi. Yangi sessiya shu yerdan davom etadi.

**Oxirgi yangilanish:** 2026-11-10

| Maydon | Qiymat |
|---|---|
| Joriy modul | 1-bosqich: Poydevor (hali boshlanmagan) |
| Joriy bosqich | Rejalashtirish: 1-bosqich rejasi egasiga ko'rsatildi, tasdiq kutilmoqda |
| Joriy git branch | `main` (faqat hujjatlar va agentlar). 1-bosqich `feature/01-poydevor` branch'ida boshlanadi |
| Ish rejimi | Sekin: har bir vazifadan keyin hisobot va "Davom etaymi?" |

## Oxirgi bajarilgan vazifa
0-qadam yakunlandi:
- 6 ta subagent yaratildi: `.claude/agents/{database-engineer, backend-developer, ui-designer, frontend-developer, qa-tester, code-reviewer}.md`.
- `CLAUDE.md` ga jarayon qoidalari qo'shildi.
- Egasining javoblari (S-15, S-30, S-45, S-61) hujjatlarga kiritildi, yangi savollar S-67 va S-68 qo'shildi.
- 46 ta Mermaid diagrammasi `@mermaid-js/mermaid-cli` bilan tekshirildi: xatosiz (bittasi tuzatildi: 01).

## Keyingi aniq vazifa
1. Egasi Claude Code'ni qayta ishga tushiradi (agentlar yuklanishi uchun) va `/agents` da 6 ta agent ko'rinishini tekshiradi.
2. Egasi 1-bosqich rejasini tasdiqlaydi va quyidagi savollarga javob beradi.
3. Tasdiqdan keyin: `git checkout -b feature/01-poydevor`, so'ng **1.1-vazifa** — monorepo skeleti (`backend-developer` agentiga: pnpm workspaces + Turborepo, `apps/api`, `apps/web`, `packages/shared` (`@lms/shared`), TypeScript strict, ESLint/Prettier, `compose.yaml` (Postgres, Redis, MinIO), `.env.example`). Tayyorlik mezoni: `pnpm install`, `pnpm lint`, `pnpm typecheck` o'tadi va ilovalar bo'sh holatda ishga tushadi.

## Egasidan kutilayotgan javoblar
- **S-01 / S-02** Yo'llar soni, guruh yo'lga qanday biriktiriladi, student bir vaqtda nechta guruhda bo'ladi. 1-bosqichga ta'sir qilmaydi, 2-bosqichdan oldin kerak.
- **S-65** Jamoa hajmi, muddat, MVP tarkibi.
- **S-67** Ota-ona "kodi" — uzun tokenning o'zimi yoki qisqa kodmi? 1-bosqichga (parent exchange) ta'sir qiladi.
- **S-68** Lokal muhit: Podman (mashinada bor) yoki Docker? 1.1-vazifaga ta'sir qiladi.
- **pnpm** mashinada o'rnatilmagan: `npm i -g pnpm` bilan o'rnatishga ruxsat kerak.
- **GitHub repo:** CI (GitHub Actions) uchun remote repo bormi?
- **Wireframe token qiymatlari:** asosiy rang, shrift va tema bo'yicha tasdiq (1-bosqichning frontend qismidan oldin).
