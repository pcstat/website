# Statistics Programming Club Website

Official website of the **Programming Club**, Department of Statistics, University of Chittagong.

Next.js 16 (App Router) · React 19 · TypeScript · pnpm · static export hosted on Cloudflare Pages.

## The three repos

| Repo | Role |
|---|---|
| **`pcstat/website`** (this one) | The website. Contains **no content** — only code, styles, fonts and the certificate SVG templates. |
| [`pcstat/database`](https://github.com/pcstat/database) | The database: JSON files + photos, published on Cloudflare Pages. |
| [`pcstat/admin`](https://github.com/pcstat/admin) | The admin panel: edits the database repo through the GitHub API. |

```
admin ──commit──▶ database repo ──▶ GitHub Action ──starts──▶ website's GitHub Action
                        │                                        builds the static site, uploads it
                        └──▶ Cloudflare Pages serves             to Cloudflare Pages
                             database.json, *.json, photos/
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

`database.json` at the root of this repo says where the database lives (the admin repo has an identical file):

```json
{ "repo": "pcstat/database", "branch": "main", "url": "https://pcstat-database.pages.dev" }
```

`url` is the database's Cloudflare Pages address; if it is empty the files are read from GitHub (`repo` + `branch`, public repos only). The only environment variable is the optional `NEXT_PUBLIC_SITE_URL` (canonical / Open Graph URL, default `https://pcstat.org`) — see `.env.example`.

To work against local data, serve a clone of the database (`pnpm dlx serve ../database --cors -l 8788`) and temporarily set `"url": "http://localhost:8788"` in `database.json` (don't commit that).

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
    config.ts     Site URL + database address (from database.json)
    types.ts      Types of every database file
    format.ts     Role / medal formatting helpers
    database/     shared.ts (link resolution) · server.ts (build time) · client.ts (browser)
public/
  fonts/ · resources/images/ · resources/certificates/svg/   (design assets)
docs/             ARCHITECTURE.md · DEPLOYMENT.md · TODO.md · skills/
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — a step-by-step guide for all three repos. Short version: GitHub Actions (`.github/workflows/deploy.yml`) builds the static site and uploads `out/` to Cloudflare Pages, creating the project on the first run.

## Live preview

The admin panel can show this site with unsaved drafts (`NEXT_PUBLIC_ADMIN_ORIGIN`, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) step 12 and `src/lib/preview.ts`). It is off unless that variable is set.

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
