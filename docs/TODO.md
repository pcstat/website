# TODO — known issues deferred on purpose

The architecture clean-up changed nothing users can see. These items would change content or
behaviour, so they were left for later. Check them off as they are fixed.

## Content / data consistency
- [ ] **Achievements tally** is typed by hand and does not match the entries (demo: "12 Nobel Prizes" vs 10 entries). Compute it from `achievements.json` or document it as a manual field.
- [ ] **Home stats**: a hard-coded "club website" project is added to the project count, and `research` projects are counted as "publications". Decide the real rule and put it in the data.
- [ ] `total_members` and each member's `session` repeat information already held by the committee. Derive them.
- [ ] Demo data uses famous people as fake members — replace with real data when moving to the real repos.

## Certificates
- [ ] Certificate pages are not in the admin's live preview (they are not content-database documents).
- [ ] Open Graph / social preview image for a shared certificate link (`/c/<ID>`): the page is static, so a per-certificate preview needs a small edge function.
- [ ] A set is downloaded whole on every lookup (about 38 KB gzipped for 4,000 people). If one set ever grows past ~20,000, split it into a second set code.
- [ ] Optional privacy upgrade: the public set files list every recipient's name. If that is a concern, encrypt each record with a key derived from its ID (the holder has the ID).
- [ ] Show on a course card how many certificates were issued for it (a set can already link `course_id`).

## Profile & CV
- [ ] CV JSON is typed as `any`; write a real type + validation in the database repo's `validate.mjs`.
- [ ] Two places define the CV button link (`member.cv_link` and `profile.cv_link`); keep one.
- [ ] When a member has no CV the page only shows an error message; show a friendlier page.
- [ ] Profile/CV editors in the admin panel are raw JSON editors — build form editors.

## Site
- [ ] Route naming: `/exec` vs `/alumni` (nav label "Past Executives").
- [x] `/about` content, contact e-mail, page headings, sidebar, footer and home-page texts now come from the database (`site.json`).
- [ ] Open Graph image is an SVG, which most social networks do not render — add a PNG.
- [ ] `globals.css` is ~2,600 lines; split into modules (without changing the look).
- [ ] 38 ESLint warnings (`any`, state set in effects, unescaped quotes) — fix and turn the rules back to `error` in `eslint.config.mjs`.
- [ ] `docs/skills/club-frontend-design/SKILL.md` (1,100+ lines) needs a review: is it still accurate?

## Tooling
- [ ] Remove the `typescript` → `@typescript/typescript6` alias once typescript-eslint supports TypeScript 7.
- [ ] Move to ESLint 10 once `eslint-config-next` supports it.
