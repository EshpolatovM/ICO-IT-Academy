# PROGRESS — ish jurnali

Yangi yozuvlar pastga qo'shiladi.

---

## 2026-11-10 — Tahlil hujjatlari
- **Nima qilindi:** loyiha tavsifi `CLAUDE.md` ga saqlandi. 00–14, 99 va README tahlil hujjatlari yozildi.
- **Fayllar:** `CLAUDE.md`, `docs/00…14-*.md`, `docs/99-ochiq-savollar.md`, `docs/README.md`.

## 2026-11-10 — 0-qadam: agentlar va jarayon
- **Nima qilindi:**
  - 6 ta subagent yaratildi (database-engineer, backend-developer, ui-designer, frontend-developer, qa-tester, code-reviewer). Har birida umumiy qoidalar to'liq: kod sifati, frontend state, avtomatik sifat nazorati, wireframe dizayn qoidasi, to'xtash qoidalari, hisobot formati.
  - `CLAUDE.md` ga Tech Lead jarayon qoidalari qo'shildi.
  - Egasining javoblari hujjatlarga kiritildi: S-15 (har farzandga alohida token, havola + kod orqali kirish, token brauzerda `HttpOnly` cookie'da saqlanadi), S-30 (kunlik limit admin sozlamasidan), S-45 (LiveKit), S-61 (hosting'ga bog'lanmagan arxitektura).
  - Yangi savollar: S-67 (ota-ona kodi formati), S-68 (Podman/Docker).
  - Mermaid tekshiruvi: 46 diagramma, 1 ta xato tuzatildi (`01` dagi `@Roles`), qolganlari xatosiz.
  - Git repozitoriy ishga tushirildi, boshlang'ich commit `main` ga qilindi.
- **Fayllar:** `.claude/agents/*.md`, `CLAUDE.md`, `docs/01, 02, 05, 08, 10, 12, 13, 99`, `docs/STATE.md`, `docs/PROGRESS.md`, `.gitignore`.
- **Testlar:** kod hali yo'q.
- **Keyingi qadam:** Claude Code'ni qayta ishga tushirish, 1-bosqich rejasini tasdiqlash.

## 2026-11-10 — 1-bosqich boshlandi
- **Nima qilindi:**
  - Egasi rejani tasdiqladi. Dizayn oddiy standart token'lar bilan qilinadi.
  - S-67 (kod = token) va S-68 (Podman) qarorlari yozildi.
  - pnpm 10.34.9 `~/.local` ga o'rnatildi.
  - `feature/01-poydevor` branch'i ochildi.
  - 1.1 topshirig'i `docs/tasks/` ga saqlandi.
  - `backend-developer` agenti hali yuklanmagan (Claude Code qayta ishga tushirilishi kerak).
- **Fayllar:** `docs/99-ochiq-savollar.md`, `docs/STATE.md`, `docs/PROGRESS.md`, `docs/tasks/01-1.1-monorepo-skeleti.md`.
