# Architecture

## Three repositories

| Repo | Contains | Deployed as |
|---|---|---|
| Website (this repo) | Next.js code, CSS, fonts, `database.json` (addresses of the database and of the certificate registry) | Cloudflare Pages (static `out/`, built on GitHub) |
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
* `client.ts` — browser loaders for the `?id=` pages (needs CORS on the database site).
* `src/lib/certificates/` — certificates. `core.ts` is the shared rule book (ID format, dates, safe template filling) and is **identical** in the certificates repo and the admin panel; `client.ts` loads one set file and one template straight from the registry repository on GitHub (`certificates` in `database.json`; an optional `url` overrides the address).

## Site-wide texts (`site.json`)

Club name, contact e-mail, sidebar entries, home / About / page-heading texts and the terminal come from the database file `site.json`.
`src/app/layout.tsx` (server) loads it with `getSite()` and provides it through `SiteProvider`; client components read it with `useSite()`
(`src/lib/site.tsx`), which returns the admin panel's draft while previewing. Nothing is hard-coded, so these texts change from the admin panel without touching this repo.

## Rendering

| Route | Rendering | Data |
|---|---|---|
| `/`, `/exec`, `/alumni`, `/projects`, `/achievements`, `/events`, `/courses`, `/about` | Static HTML at build | build-time loaders |
| `/profile?id=`, `/cv?id=` | Static shell, data in the browser | client loaders |
| `/certificate`, `/certificate/view?id=` (and `/c/<ID>` → redirect, `public/_redirects`) | Static shell, data in the browser | `src/lib/certificates/client.ts`: the ID's set code selects `sets/<code>.json` in the certificates repo (read from GitHub); the SVG design comes from its `templates/` |

## Theme

Light/dark via CSS variables and `ThemeContext`; an inline script in `layout.tsx` applies the saved theme before hydration.

## Tooling notes

* TypeScript: the `typescript` dependency is an alias of `@typescript/typescript6` (the JS API that Next.js and
  typescript-eslint still need); the TypeScript 7 compiler is installed beside it as `@typescript/native` and provides the `tsc` binary.
  Drop the alias once typescript-eslint supports TypeScript 7.
* ESLint 9: `eslint-config-next` does not support ESLint 10 yet.

## Live preview (admin panel)

`src/lib/preview.ts` + `src/components/PreviewBridge.tsx`. When the page runs inside a frame and `admin` in `database.json` (or `NEXT_PUBLIC_ADMIN_ORIGIN`) is set,
it announces itself to the parent (`club-preview:ready`) and accepts draft database files (`club-preview:data`) from that origin only.
Drafts are held in a tiny external store:

* list pages (home, exec, alumni, projects, events, achievements, courses) render through client views that derive their data with the
  pure functions in `src/lib/views.ts` — from the build-time props normally, from the draft while previewing;
* runtime-loaded pages (profile, CV) get drafts through `fetchJson` (`previewFile`) and reload when a new draft arrives. Certificates are not part of live preview: they are not content-database documents.

Nothing is persisted; without the variable the bridge does nothing.
