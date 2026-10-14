# Statistics Programming Club Website

Official website of the **Programming Club**, Department of Statistics, University of Chittagong.

Next.js 16 (App Router) · React 19 · TypeScript · pnpm · static export hosted on Cloudflare Pages.

## The three repos

| Repo | Role |
|---|---|
| **`programming-club-demo`** (this one) | The website. Contains **no content** — only code, styles, fonts and the certificate SVG templates. |
| **`programming-club-demo-data`** | The database: JSON files + photos, published on Cloudflare Pages. |
| **`programming-club-demo-admin`** | The admin panel: edits the database repo through the GitHub API. |

```
admin ──commit──▶ database repo ──▶ GitHub Action ──deploy hook──▶ website rebuilds
                        │
                        └──▶ Cloudflare Pages serves database.json, *.json, photos/
```

## Getting started

```bash
corepack enable pnpm     # once
pnpm install
pnpm dev                 # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server. |
| `pnpm build` | Static export into `out/`. **Fails if the database is unreachable or malformed** — by design. |
| `pnpm start` | Serves `out/` locally. |
| `pnpm typecheck` | TypeScript check (type errors are never ignored by the build). |
| `pnpm lint` | ESLint. |

Requires Node ≥ 24 (`.nvmrc` pins 26).

## Where the content comes from

`src/lib/config.ts` holds the address of the database index (`database.json`). Override it with environment variables (see `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DATABASE_INDEX_URL` | `https://programming-club-demo-data.pages.dev/database.json` | Where the content lives. |
| `NEXT_PUBLIC_SITE_URL` | `https://pcstat.org` | Canonical / Open Graph URL. |

To work against local data, serve a clone of the database repo (`pnpm dlx serve ../programming-club-demo-data --cors -l 8788`, after `pnpm set-base-url http://localhost:8788` **in a throw-away copy**) and set `NEXT_PUBLIC_DATABASE_INDEX_URL=http://localhost:8788/database.json` in `.env.local`.

| Pages | How they load data | Why |
|---|---|---|
| Home stats, Executives, Past Executives, Projects, Achievements, Events, Courses | At **build time** (`src/lib/database/server.ts`) → plain static HTML | Best for SEO; refreshed by the automatic rebuild the database repo triggers on every change. |
| Profile (`/profile?id=`), CV (`/cv?id=`), Certificate verification | In the **browser** (`src/lib/database/client.ts`) | They depend on a query string; always show the live data. |

## Project structure

```
src/
  app/            Pages (App Router). One folder per route.
  components/     LayoutWrapper (sidebar/nav), Terminal (home typing effect)
  context/        ThemeContext (light/dark)
  lib/
    config.ts     Site URL + database index URL
    types.ts      Types of every database file
    format.ts     Role / medal formatting helpers
    database/     shared.ts (link resolution) · server.ts (build time) · client.ts (browser)
public/
  fonts/ · resources/images/ · resources/certificates/svg/   (design assets)
docs/             ARCHITECTURE.md · DEPLOYMENT.md · TODO.md · skills/
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Short version: Cloudflare Pages, build command `pnpm build`, output directory `out`, `NODE_VERSION=26`.

## Common tasks

* **Change content** (executives, projects, events…) → use the admin panel, or edit the JSON in the database repo. Never edit content in this repo.
* **Add a page** → create `src/app/<name>/page.tsx`, add it to the nav list in `src/components/LayoutWrapper.tsx`, add a loader to `src/lib/database/server.ts` if it needs new data.
* **Change the accent colour** → `--ac` in `src/app/globals.css`.
* **Add a certificate design** → add an SVG with `{{name}}`, `{{course}}`, `{{date}}`, `{{id}}` … placeholders to `public/resources/certificates/svg/` and reference it from `template` in `certificates.json`.

## Maintainers

| Name | Role | Year |
|---|---|---|
| **Muhammad N. Naim** | **Creator** | **2026** |

If you maintain this repo after me, add your name here.

Known cleanup work is tracked in [docs/TODO.md](docs/TODO.md).
