# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands
- Install: `pnpm install` · Dev: `pnpm dev` · Build: `pnpm build` · Check: `pnpm typecheck && pnpm lint`
- Use **pnpm** only (never npm/yarn). Node ≥ 24.

## Architecture in one paragraph
Static Next.js export (`output: 'export'`). Content lives in a **separate database repo** and is fetched
through `database.json` (`src/lib/config.ts`). List pages read it at build time
(`src/lib/database/server.ts`); `?id=` pages read it in the browser (`src/lib/database/client.ts`).
There is no admin code and no API route in this repo — the admin panel is its own repo.

## Rules
- Do not put content (names, events, projects…) in this repo; it belongs in the database repo.
- Do not change the visual design unless asked; CSS lives in `src/app/globals.css` and `*.module.css`.
- Data loaders must fail loudly — never add silent fallbacks.
- New data fields: update `src/lib/types.ts` and the database repo's README/validator.
- Pending cleanup items are listed in `docs/TODO.md`.
