# Deployment

## Website → Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → connect this GitHub repo.
2. Build settings

   | Setting | Value |
   |---|---|
   | Framework preset | None (or Next.js – Static HTML Export) |
   | Build command | `pnpm build` |
   | Build output directory | `out` |
   | Environment variable | `NODE_VERSION` = `26` (use `24` if the build image does not offer 26 yet) |

3. Optional environment variables: `NEXT_PUBLIC_DATABASE_INDEX_URL`, `NEXT_PUBLIC_SITE_URL` (see `.env.example`).
4. Settings → Builds → **Deploy hooks** → create one and store its URL as the secret
   `WEBSITE_DEPLOY_HOOK` in the **database** repo. That is what makes every database change rebuild the site.

GitHub Actions (`.github/workflows/ci.yml`) only type-checks, lints and builds; Cloudflare does the deployment.

## Moving to the real repos

1. Push this repo to the real website repo and connect it to Cloudflare Pages as above.
2. Set `NEXT_PUBLIC_DATABASE_INDEX_URL` to the real database's `database.json` and `NEXT_PUBLIC_SITE_URL` to the real domain.
3. Create the deploy hook and add it to the real database repo (see above).
