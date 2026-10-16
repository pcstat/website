# Deployment guide

How to take the Programming Club project from three GitHub repos and a brand-new Cloudflare account to a
live website, a live database and a live admin panel. Nothing here needs a server or Cloudflare's own build
system — **GitHub Actions does all the building and deploying**.

This one guide covers all three repos:

| Repo | What it is | Ends up as |
|---|---|---|
| [`pcstat/database`](https://github.com/pcstat/database) | JSON content + photos | A Cloudflare **Pages** site (plain files) |
| [`pcstat/website`](https://github.com/pcstat/website) (this repo) | The public website | A Cloudflare **Pages** site (static HTML) |
| [`pcstat/admin`](https://github.com/pcstat/admin) | The editor for the database | A Cloudflare **Worker** |

```
 you ─▶ admin panel ──one commit──▶ database repo ──▶ GitHub Action ──▶ Cloudflare Pages (database)
                                                           │
                                                           └─ starts ──▶ website repo's GitHub Action
                                                                           builds the static site on GitHub
                                                                           └─▶ Cloudflare Pages (website)
```

**Why it is built on GitHub:** the website is static, so it is built once in GitHub Actions and only the
finished files are uploaded to Cloudflare. Cloudflare never runs a build, so it spends no build minutes.

---

## 0. Checklist at a glance

1. [Collect two values from Cloudflare](#1-cloudflare) — Account ID and an API token — and register your `workers.dev` name.
2. [Create two GitHub tokens](#2-github-tokens) and [the admin password](#3-the-admin-password).
3. [Add secrets (and optional variables) to each repo](#4-add-the-secrets-to-github).
4. [Decide the project names](#5-choose-the-cloudflare-project-names-your-urls) — they become your URLs.
5. [Deploy in the right order](#6-first-deployment-in-this-order): database → website → admin → connect them.
6. [Test the whole chain](#7-test-the-whole-chain).

---

## 1. Cloudflare

You need a free Cloudflare account (you just opened one). Everything below is in <https://dash.cloudflare.com>.
Button and menu names are quoted from memory of the dashboard and may be worded slightly differently — the
*permission names* in 1.2 are what matter.

### 1.1 Account ID → `CLOUDFLARE_ACCOUNT_ID`

1. Log in. In the left menu open **Workers & Pages**.
2. That page shows an **Account ID** (a 32-character code) with a copy button.
   - Shortcut: it is also the part of the address bar right after `dash.cloudflare.com/`.
3. Keep it — it goes into GitHub as `CLOUDFLARE_ACCOUNT_ID`.

### 1.2 API token → `CLOUDFLARE_API_TOKEN`

This is the key GitHub uses to upload to your Cloudflare account.

1. Top-right profile icon → **My Profile** → **API Tokens** → **Create Token**.
2. Next to **Edit Cloudflare Workers** click **Use template**. (Or choose *Create Custom Token* and add the
   permissions yourself.)
3. Make sure the token has at least these **permissions** (add the missing one with *+ Add more*):

   | Scope | Permission | Access |
   |---|---|---|
   | Account | **Cloudflare Pages** | **Edit** |
   | Account | **Workers Scripts** | **Edit** |
   | Account | **Account Settings** | Read |

4. **Account Resources** → *Include* → your account. (The template's zone permissions can stay or be removed; they are not used.)
5. **Continue to summary** → **Create Token**.
6. **Copy the token now** — Cloudflare shows it only once. It goes into GitHub as `CLOUDFLARE_API_TOKEN`.

If you lose it, create a new one and replace the GitHub secret.

### 1.3 Register your `workers.dev` name (new accounts only, once)

The admin panel runs as a Worker, and Workers live at `https://<worker>.<your-name>.workers.dev`.
A brand-new account has not chosen `<your-name>` yet, and an automatic deployment cannot choose it for you.

1. Dashboard → **Workers & Pages**.
2. If Cloudflare shows a prompt to choose a subdomain ("Your Workers will be deployed to …workers.dev"), pick a name
   (for example `pcstat`) and confirm. Otherwise look for **Account details → Subdomain** on the same page and set it there.

If you skip this, the first admin deployment fails with a message mentioning the **workers.dev subdomain** —
do this step and re-run the workflow.

> The database and the website use **Pages**, which gives every project its own `*.pages.dev` address
> automatically; they do not need this step.

---

## 2. GitHub tokens

Two tokens, both **fine-grained personal access tokens** (they can be limited to a single repo). Create them at
GitHub → your profile picture → **Settings** → **Developer settings** → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**.

> If `pcstat` is a GitHub *organization*, set **Resource owner** to `pcstat`. An organization owner may need
> to allow fine-grained tokens (Organization → Settings → Personal access tokens). If a token is rejected
> later, this is the first thing to check.
>
> Tokens act as the person who created them. If that person leaves the organization, the tokens stop working.

### 2.1 Admin → database token → `DATABASE_REPO_TOKEN`

Lets the admin panel read and commit to the database repo.

| Field | Value |
|---|---|
| Token name | `pcstat-admin-database` |
| Expiration | Your choice. GitHub tokens expire (usually within a year) — **put the expiry date in your calendar**; the admin panel stops saving when the token expires. |
| Repository access | **Only select repositories** → `pcstat/database` |
| Permissions → Repository | **Contents: Read and write** (Metadata: Read is added automatically) |

Generate and copy the token (`github_pat_…`). It goes into the **admin** repo as `DATABASE_REPO_TOKEN`.

> Why not `GITHUB_TOKEN`? GitHub does not allow secret names that start with `GITHUB_`.
> The deploy workflow stores this value in the Worker under the name `GITHUB_TOKEN`, which is what the code reads.

### 2.2 Database → website token → `WEBSITE_REPO_TOKEN`

Lets the database repo start the website's rebuild whenever content changes.

| Field | Value |
|---|---|
| Token name | `pcstat-database-triggers-website` |
| Expiration | Your choice — note the date |
| Repository access | **Only select repositories** → `pcstat/website` |
| Permissions → Repository | **Actions: Read and write** |

It goes into the **database** repo as `WEBSITE_REPO_TOKEN`.

---

## 3. The admin password

The admin panel stores only a hash of the password and a random key for its login cookie. Generate both on your computer
(needs [Node.js](https://nodejs.org) 24 or newer):

```bash
git clone https://github.com/pcstat/admin.git
cd admin
corepack enable pnpm
pnpm install
pnpm hash-password
```

Type the password you want (the input is hidden). It prints two lines:

```
ADMIN_PASSWORD_HASH=…long hex…
AUTH_SESSION_SECRET=…random text…
```

Keep both values (without the `NAME=` part) — they go into the **admin** repo as secrets with those names.
To change the password later, run the command again and replace both secrets; everybody is signed out.

---

## 4. Add the secrets to GitHub

For each repo: **Settings** → **Secrets and variables** → **Actions**.

* **Secrets** tab → **New repository secret** → type the *Name* exactly as below → paste the *Value* → **Add secret**.
* **Variables** tab → **New repository variable** — only for the optional items.

> If `pcstat` is an organization you can add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` once as
> *organization secrets* (Organization → Settings → Secrets and variables → Actions) and share them with the three repos.

### Secrets (required)

| Secret | `database` | `website` | `admin` | Value from |
|---|:-:|:-:|:-:|---|
| `CLOUDFLARE_API_TOKEN` | ✅ | ✅ | ✅ | [1.2](#12-api-token--cloudflare_api_token) |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | ✅ | ✅ | [1.1](#11-account-id--cloudflare_account_id) |
| `DATABASE_REPO_TOKEN` | | | ✅ | [2.1](#21-admin--database-token--database_repo_token) |
| `ADMIN_PASSWORD_HASH` | | | ✅ | [3](#3-the-admin-password) |
| `AUTH_SESSION_SECRET` | | | ✅ | [3](#3-the-admin-password) |
| `WEBSITE_REPO_TOKEN` | ✅ | | | [2.2](#22-database--website-token--website_repo_token) — add it **later**, in [step 6.5](#65-connect-database--website) |

Add each repo's secrets **before** you push its workflow (step 6), otherwise the first run stops with a message telling you which one is missing.

The admin workflow copies `DATABASE_REPO_TOKEN`, `ADMIN_PASSWORD_HASH` and `AUTH_SESSION_SECRET` into the Worker
(as Worker secrets) on every deployment, so **you never have to paste anything into the Cloudflare dashboard**.

### Variables (all optional)

| Variable | Repo | Default | Purpose |
|---|---|---|---|
| `CLOUDFLARE_PROJECT_NAME` | `database` | `pcstat-database` | Cloudflare Pages project name = `<name>.pages.dev` ([step 5](#5-choose-the-cloudflare-project-names-your-urls)) |
| `CLOUDFLARE_PROJECT_NAME` | `website` | `pcstat` | Same, for the website |
| `WEBSITE_REPO` | `database` | `<owner>/website` | `owner/name` of the website repo, if it is not called `website` |
| `NEXT_PUBLIC_SITE_URL` | `website` | `https://pcstat.org` | Public address used in the page `<head>` (canonical / social-share links) |
| `NEXT_PUBLIC_WEBSITE_URL` | `admin` | *(preview off)* | The website's address — enables the admin's **Preview site** button and the sidebar link |
| `NEXT_PUBLIC_ADMIN_ORIGIN` | `website` | *(preview off)* | The admin panel's address — lets the admin's live preview send drafts to the site ([step 12](#12-live-preview-in-the-admin-panel-optional)) |

---

## 5. Choose the Cloudflare project names (your URLs)

The GitHub Actions **create the Cloudflare projects for you** if they do not exist — you never have to click
*Create project* in the dashboard. The only decision is the **name**, because for Cloudflare Pages

> **project name = address:** a project called `pcstat` is served at `https://pcstat.pages.dev`.

| Project | Default name | Resulting address | Where to change the name |
|---|---|---|---|
| Website (Pages) | `pcstat` | `https://pcstat.pages.dev` | repo variable `CLOUDFLARE_PROJECT_NAME` in `website` |
| Database (Pages) | `pcstat-database` | `https://pcstat-database.pages.dev` | repo variable `CLOUDFLARE_PROJECT_NAME` in `database` |
| Admin (Worker) | `pcstat-admin` | `https://pcstat-admin.<your-name>.workers.dev` | `name = "…"` in `admin/wrangler.toml` |

How to pick:

* Use 3–58 characters: lowercase letters, digits and hyphens; no hyphen at the start or end.
* Names are **global across all of Cloudflare**. If `pcstat` is already taken by someone else, Cloudflare adds a random
  suffix (you get something like `pcstat-7ab.pages.dev`). **The real address is printed in the workflow run's summary**
  (*Cloudflare Pages project → https://…*) — always use that one.
* To change a name, set the variable **before the first deployment**. A Pages project cannot be renamed afterwards;
  changing the variable later simply creates a *second* project (delete the old one in the dashboard).
* Do **not** create the project in the dashboard by connecting a Git repository: Git-connected projects cannot receive
  uploads from GitHub Actions. Let the workflow create it.
* Your own domain (for example `pcstat.org`) can be added later: dashboard → **Workers & Pages** → the project →
  **Custom domains** → **Set up a custom domain**. Then set the repo variable `NEXT_PUBLIC_SITE_URL` to it.

---

## 6. First deployment, in this order

The three repos depend on each other, so the order matters. Each workflow starts when you push to `main`
(applying a patch and pushing is enough) — or run it by hand: **Actions** tab → the workflow → **Run workflow**.

### 6.1 Database

1. Make sure these secrets exist in `pcstat/database`: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
   (Not `WEBSITE_REPO_TOKEN` yet — without it the workflow deploys the data and skips the website rebuild with a notice.)
2. Push to `main`. **Actions** → *Deploy database and rebuild website*. It validates the JSON, creates the Pages project and
   uploads the files.
3. Open the finished run → **Summary** → note the address under **Cloudflare Pages project**.
4. Check it in the browser: `https://<that address>/database.json` must show the index.

### 6.2 Tell the website and the admin where the database is

The website and the admin panel each contain a `database.json` (repo root). **The two files should be identical.**

```json
{
  "repo": "pcstat/database",
  "branch": "main",
  "url": "https://pcstat-database.pages.dev"
}
```

| Field | Meaning |
|---|---|
| `repo` | The database's GitHub repo, `owner/name`. The admin panel reads and commits here. |
| `branch` | Its branch (default `main`). |
| `url` | Where the database is **published** (its Cloudflare Pages address, from 6.1). The website reads its content from here at build time and in the browser. May be left empty (`""`): the website then reads straight from GitHub (`raw.githubusercontent.com`; **public repos only**, can lag a few minutes). |

If the address from 6.1 is not exactly `https://pcstat-database.pages.dev`, edit `url` in **both** files and commit.
The database repo itself contains no address (its `database.json` only lists file names), so nothing changes there.

### 6.3 Website

1. Secrets in `pcstat/website`: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
2. Push to `main`. **Actions** → *Build and deploy website*. It type-checks, lints, builds the static site from the live
   database, creates the Pages project and uploads `out/`.
3. The run summary shows the website address. Open it.

If the build says *Could not load database file …*, the `url` in `database.json` is wrong or 6.1 has not finished.
Nothing is deployed when the build fails, so the site never goes online half-empty.

### 6.4 Admin

1. Do [step 1.3](#13-register-your-workersdev-name-new-accounts-only-once) if you have not yet.
2. Secrets in `pcstat/admin`: all five required ones (table in step 4).
3. Push to `main`. **Actions** → *Deploy admin panel to Cloudflare*. It builds the panel, creates the Worker, uploads it
   and sets its three secrets.
4. Near the end of the **Deploy** step's log you find the Worker's address
   (`https://pcstat-admin.<your-name>.workers.dev`). Open it and sign in with the password from step 3.

### 6.5 Connect database → website

Now the website repo has its workflow, so the database can start it:

1. In `pcstat/database` add the secret `WEBSITE_REPO_TOKEN` ([2.2](#22-database--website-token--website_repo_token)).
   If your website repo is not called `website`, also add the variable `WEBSITE_REPO`.
2. **Actions** → *Deploy database and rebuild website* → **Run workflow**. Its last step, *Rebuild website*, should print
   `Website rebuild started`, and a new *Build and deploy website* run appears in the website repo.

---

## 7. Test the whole chain

1. Open the admin panel and sign in.
2. Change something small (for example an event title) → **Save**.
3. In `pcstat/database` → **Actions**: a run starts (about 1–2 minutes). When it ends, the website repo's **Actions** shows a new run.
4. After that run finishes (a few minutes), reload the website: the list pages show the change.
   Profile, CV and certificate pages read the database live in the browser, so they change as soon as the database run finishes.

---

## 8. Day-to-day

| I want to … | Do this |
|---|---|
| Change content | Admin panel (or edit the JSON in the database repo). The website rebuilds automatically. |
| Rebuild the website manually | `pcstat/website` → Actions → *Build and deploy website* → Run workflow |
| Change the admin password | `pnpm hash-password` again → replace `ADMIN_PASSWORD_HASH` and `AUTH_SESSION_SECRET` in the admin repo → re-run the admin workflow |
| Renew an expired GitHub token | Create a new one ([step 2](#2-github-tokens)) → replace the secret → re-run the workflow |
| Move the database to another address | Change `url` in both `database.json` files |
| Try the admin panel without GitHub | See the `pcstat/admin` README → *Try it locally* |

---

## 9. Troubleshooting

| Message / symptom | Cause and fix |
|---|---|
| `Missing GitHub Actions secrets: …` | You skipped a secret. Add it ([step 4](#4-add-the-secrets-to-github)) and re-run. |
| `CLOUDFLARE_API_TOKEN is not set` | Secret missing or misspelled in **this** repo (secrets are per repo). |
| `Could not read the Pages project … Cloudflare Pages → Edit` | Wrong Account ID, or the token lacks *Account → Cloudflare Pages → Edit* ([1.2](#12-api-token--cloudflare_api_token)). |
| `Invalid Cloudflare project name` | The variable `CLOUDFLARE_PROJECT_NAME` has capitals, underscores or spaces. |
| Admin deploy fails mentioning the **workers.dev subdomain** | Do [step 1.3](#13-register-your-workersdev-name-new-accounts-only-once), re-run. |
| `Authentication error` from wrangler | The token lacks *Workers Scripts: Edit*, or belongs to a different account than `CLOUDFLARE_ACCOUNT_ID`. |
| Website build: `Could not load database file …` | `url` in the website's `database.json` is wrong, or the database was not deployed yet ([6.1](#61-database)). |
| Database run: `Could not start …/deploy.yml … HTTP 404` | The website repo has no `deploy.yml` on `main` yet, or `WEBSITE_REPO` is wrong. |
| Database run: `… HTTP 401` / `403` | `WEBSITE_REPO_TOKEN` expired, or lacks *Actions: Read and write* on the website repo. |
| Admin: "GitHub API 401/403/404" when loading or saving | `DATABASE_REPO_TOKEN` expired or lacks *Contents: Read and write* on the database repo, or `repo` in `database.json` is wrong. |
| Admin: photos are broken thumbnails | `url` in the admin's `database.json` is wrong, or empty while the database repo is private. |
| Admin: "The database changed since you opened it" | Someone saved first (or you edited on GitHub). Reload the page and redo the edit. |
| Website shows old content after a save | Wait for both workflow runs to finish; check the database repo's *Rebuild website* step succeeded. |

---

## 10. Secrets and variables at a glance

| Name | Kind | Repo | Where the value comes from | Used for |
|---|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | secret | all three | Cloudflare → My Profile → API Tokens | Uploading to Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | secret | all three | Cloudflare → Workers & Pages | Selecting your account |
| `DATABASE_REPO_TOKEN` | secret | admin | GitHub fine-grained token (database repo, Contents: write) | Stored in the Worker as `GITHUB_TOKEN`; saves to the database |
| `ADMIN_PASSWORD_HASH` | secret | admin | `pnpm hash-password` | Admin login |
| `AUTH_SESSION_SECRET` | secret | admin | `pnpm hash-password` | Signs the login cookie |
| `WEBSITE_REPO_TOKEN` | secret | database | GitHub fine-grained token (website repo, Actions: write) | Starts the website rebuild |
| `CLOUDFLARE_PROJECT_NAME` | variable | database, website | You choose | Pages project name / address |
| `WEBSITE_REPO` | variable | database | `owner/name` | Which repo to rebuild (default `<owner>/website`) |
| `NEXT_PUBLIC_SITE_URL` | variable | website | Your public address | Canonical / Open Graph URLs |
| `NEXT_PUBLIC_WEBSITE_URL` | variable | admin | The website's address | Preview site button + sidebar link |
| `NEXT_PUBLIC_ADMIN_ORIGIN` | variable | website | The admin panel's address | Allows the admin's live preview |

Nothing secret is ever committed to git. The only values stored in the repos are the non-secret addresses in `database.json`.

---

## 11. Local development (optional)

To run the website against a local copy of the database:

```bash
# terminal 1 — serve a clone of the database repo, with CORS
git clone https://github.com/pcstat/database.git
pnpm dlx serve database --cors -l 8788

# terminal 2 — the website. Temporarily set "url": "http://localhost:8788" in database.json (do not commit that).
pnpm install
pnpm dev
```

---

## 12. Live preview in the admin panel (optional)

The admin panel's **Preview site** button shows the real website in a frame with your **unsaved** changes, so you can check
them before pressing Save. Two variables switch it on — each side must know the other's address:

| Repo | Variable | Value |
|---|---|---|
| `admin` | `NEXT_PUBLIC_WEBSITE_URL` | `https://pcstat.pages.dev` (your website's address, no trailing slash) |
| `website` | `NEXT_PUBLIC_ADMIN_ORIGIN` | `https://pcstat-admin.<your-name>.workers.dev` (your admin panel's address) |

After adding them, **re-run both deploy workflows** (the values are baked in at build time).

How it works and why it is safe: the website only reacts to drafts when it runs inside a frame **and** the message comes from
exactly the origin in `NEXT_PUBLIC_ADMIN_ORIGIN`; the admin only talks to the origin in `NEXT_PUBLIC_WEBSITE_URL`. Drafts are
shown in the browser only — nothing is saved or published. Without the variables the preview button is disabled and the website
ignores all such messages.

Local development: run the admin on `http://localhost:3000` and the website on another port, then set
`NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001` for the admin and `NEXT_PUBLIC_ADMIN_ORIGIN=http://localhost:3000` for the website.

## 13. Members who maintain their own profile and CV

A member can keep their profile and CV in their own public GitHub repository and edit them without any access to the admin
panel. The admin links them in **Member files → Source…** (GitHub username + repository, or pasted links). Nothing has to be set
up in Cloudflare or GitHub for this; see `docs/MEMBER-REPOS.md` in the admin repo for the member-facing instructions and templates.
