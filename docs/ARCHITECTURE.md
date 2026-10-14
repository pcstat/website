# Architecture

## Three repositories

| Repo | Contains | Deployed as |
|---|---|---|
| Website (this repo) | Next.js code, CSS, fonts, certificate SVG templates | Cloudflare Pages (static `out/`) |
| Database | `database.json`, content JSON, `members/`, `photos/` | Cloudflare Pages (plain static files, CORS enabled) |
| Admin | Next.js app with login + editors | Cloudflare Workers (OpenNext) |

The website never imports content from its own repo: everything comes from the database over HTTP.

## Data flow

```
 admin  ──(GitHub API, one atomic commit)──▶  database repo (GitHub)
                                                   │ push to main
                                                   ▼
                                  GitHub Action: validate JSON
                                                   │ wait until the database site serves the new files
                                                   ▼
                                  Cloudflare Pages deploy hook ──▶ website rebuild
```

* The database repo's workflow (`.github/workflows/redeploy-website.yml`) waits until the database site actually
  serves the committed JSON before triggering the website build, so the build never sees stale content.
* `pnpm build` fails when the database is unreachable or `database.json` is malformed. The previous deployment
  stays online — nothing is silently published with empty pages.

## Loading layers (`src/lib/database/`)

* `shared.ts` — resolves links. Data files hold **relative** paths (no domain):
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
