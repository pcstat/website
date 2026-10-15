# Architecture

## Three repositories

| Repo | Contains | Deployed as |
|---|---|---|
| Website (this repo) | Next.js code, CSS, fonts, certificate SVG templates, `database.json` (address of the database) | Cloudflare Pages (static `out/`, built on GitHub) |
| Database | `database.json` (relative paths), content JSON, `members/`, `photos/` | Cloudflare Pages (plain static files, CORS enabled) |
| Admin | Next.js app with login + editors, `database.json` (same as the website's) | Cloudflare Workers (OpenNext) |

The website never imports content from its own repo: everything comes from the database over HTTP. Its own `database.json` only says where the database is published.

## Data flow

```
 admin  ──(GitHub API, one atomic commit)──▶  database repo (GitHub)
                                                   │ push to main
                                                   ▼
                      GitHub Action: validate JSON → upload to Cloudflare Pages (project created if missing)
                                                   │ wait until the database site serves the new files
                                                   ▼
                      start the website repo's workflow (workflow_dispatch, WEBSITE_REPO_TOKEN)
                                                   ▼
                      GitHub Action: typecheck → lint → build static site → upload out/ to Cloudflare Pages
```

* Nothing is built by Cloudflare; both sites are direct uploads from GitHub Actions.
* The database workflow waits until the database site actually serves the committed JSON before starting the website build, so the build never sees stale content.
* `pnpm build` fails when the database is unreachable or malformed, and the workflow then deploys nothing. The previous deployment stays online.

## Loading layers (`src/lib/database/`)

* `shared.ts` — resolves links. The database index and the data files hold **relative** paths (no domain):
  `icon_link` → relative to `imageBase`; `profile_link` / `cv_link` → relative to the database root.
* `server.ts` — build-time loaders (`getExecutives()`, `getProjects()`, …). Retries 3×, memoised per process, cache-busted
  so neither a CDN nor Next's data cache can serve an older copy.
* `client.ts` — browser loaders for the `?id=` pages and certificate verification (needs CORS on the database site).

## Rendering

| Route | Rendering | Data |
|---|---|---|
| `/`, `/exec`, `/alumni`, `/projects`, `/achievements`, `/events`, `/courses`, `/about` | Static HTML at build | build-time loaders |
| `/profile?id=`, `/cv?id=` | Static shell, data in the browser | client loaders |
| `/certificate`, `/certificate/view?id=` | Static shell, data in the browser | client loaders + SVG template from `public/resources/certificates/svg/` |

## Theme

Light/dark via CSS variables and `ThemeContext`; an inline script in `layout.tsx` applies the saved theme before hydration.

## Tooling notes

* TypeScript: the `typescript` dependency is an alias of `@typescript/typescript6` (the JS API that Next.js and
  typescript-eslint still need); the TypeScript 7 compiler is installed beside it as `@typescript/native` and provides the `tsc` binary.
  Drop the alias once typescript-eslint supports TypeScript 7.
* ESLint 9: `eslint-config-next` does not support ESLint 10 yet.
