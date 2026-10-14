# TODO — known issues deferred on purpose

The architecture clean-up changed nothing users can see. These items would change content or
behaviour, so they were left for later. Check them off as they are fixed.

## Content / data consistency
- [ ] **Achievements tally** is typed by hand and does not match the entries (demo: "12 Nobel Prizes" vs 10 entries). Compute it from `achievements.json` or document it as a manual field.
- [ ] **Home stats**: a hard-coded "club website" project is added to the project count, and `research` projects are counted as "publications". Decide the real rule and put it in the data.
- [ ] `total_members` and each member's `session` repeat information already held by the committee. Derive them.
- [ ] Demo data uses famous people as fake members — replace with real data when moving to the real repos.

## Certificates & courses (kept simple for now)
- [ ] `/courses` and `/certificate` are not in the sidebar / mobile nav.
- [ ] Certificate `SPC-2024-0003` has `course1`/`course2` but no `course`, so the verification card shows an empty course.
- [ ] Certificate IDs say `2024` but dates are 2026; the `status` field is not used by the UI.
- [ ] Certificate templates (SVG) live in the website repo while certificates live in the database — decide whether templates should move too.
- [ ] Verification fetches the whole certificate list in the browser; fine for a few hundred, revisit if it grows.

## Profile & CV
- [ ] CV JSON is typed as `any`; write a real type + validation in the database repo's `validate.mjs`.
- [ ] Two places define the CV button link (`member.cv_link` and `profile.cv_link`); keep one.
- [ ] When a member has no CV the page only shows an error message; show a friendlier page.
- [ ] Profile/CV editors in the admin panel are raw JSON editors — build form editors.

## Site
- [ ] Route naming: `/exec` vs `/alumni` (nav label "Past Executives").
- [ ] `/about` content and the contact e-mail are hard-coded in `src/app/about/page.tsx`; move to the database.
- [ ] Open Graph image is an SVG, which most social networks do not render — add a PNG.
- [ ] `globals.css` is ~2,600 lines; split into modules (without changing the look).
- [ ] 38 ESLint warnings (`any`, state set in effects, unescaped quotes) — fix and turn the rules back to `error` in `eslint.config.mjs`.
- [ ] `docs/skills/club-frontend-design/SKILL.md` (1,100+ lines) needs a review: is it still accurate?

## Tooling
- [ ] Remove the `typescript` → `@typescript/typescript6` alias once typescript-eslint supports TypeScript 7.
- [ ] Move to ESLint 10 once `eslint-config-next` supports it.
- [ ] Node 26 becomes LTS on 28 Oct 2026 — verify Cloudflare Pages' build image supports it.
