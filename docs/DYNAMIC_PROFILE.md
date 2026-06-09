# Dynamic Profile Feature Documentation

The Dynamic Profile feature allows specific executive members of the Statistics Programming Club to opt into an immersive, full-width, magazine-style editorial portfolio. This feature is fully data-driven, allowing a member's profile layout, statistics, projects, and achievements to be self-contained in a single local or external JSON file.

## 🚀 Overview

- **Route**: `/profile?id=<student_id>` (e.g., `/profile?id=2020001`)
- **Data Source**: Self-contained JSON file specified by `profile_link`.
- **Configuration**: Defined via the `profile_link` property in `public/resources/data/executives.json`.
- **Fallback Behavior**: If a member does not have a `profile_link` or the custom JSON file fails to load (due to network or parsing errors), the system silently logs a warning and seamlessly falls back to the standard `DefaultProfile` view.

---

## 🛠 Configuration

### 1. Linking a Dynamic Profile to a Member
To enable the Dynamic Profile for an executive, add the `profile_link` property to their member object in `public/resources/data/executives.json`.

**Example (Local File):**
```json
{
  "name": "Elon Musk",
  "student_id": "2020001",
  "profile_link": "resources/data/profile_elon.json"
}
```

**Example (External URL):**
```json
{
  "name": "Elon Musk",
  "student_id": "2020001",
  "profile_link": "https://raw.githubusercontent.com/username/repo/main/profile.json"
}
```
*Note: Any link starting with `http` will be fetched remotely; otherwise, the loader treats it as a relative path to the public root.*

---

## 📋 JSON Schema & Data Structure

The dynamic profile JSON is completely self-contained. It does not reference `projects.json` or `achievements.json`.

### Schema Specification

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name of the member. (Required) |
| `tagline` | String | Sub-title tagline printed as a header comment (e.g., "builds things that think."). |
| `role` | String | Executive/Professional title (e.g., "Chief Engineer"). |
| `subtitle` | String | Secondary subtitle (e.g., "Software & Machine Learning"). |
| `photo` | String | URL or path to profile picture. If omitted, falls back to `icon_link` in `executives.json`. |
| `bio` | String | Monospaced biography/about paragraph. |
| `location` | String | Current location (e.g., "Dhaka, BD"). |
| `session` | String | Academic session (e.g., "2026-27"). |
| `socials` | Array | List of social links (`type`, `label`, `url`). |
| `stats` | Array | Metric grid values (`value`, `label` e.g., `{"value": "12+", "label": "Projects"}`). |
| `focus_areas`| Array | List of string pills representing focus fields. |
| `skills` | Array | Categorized skill pill groups (`category`, `icon`, `items`). |
| `timeline` | Array | Monospace experience history (`role`, `year`, `current` boolean). |
| `projects` | Array | List of projects (`title`, `description`, `tags`, `featured` boolean, `links` object). |
| `publications`| Array | List of papers (`title`, `venue`, `tags`, `featured` boolean, `links` object). |
| `achievements`| Array | List of honors (`title`, `event`, `year`). |
| `cv_link` | String | Custom CV page redirection. If omitted or set to `/cv`, automatically maps to `/cv?id=<id>`. |

### JSON Example

```json
{
  "name": "Elon Musk",
  "tagline": "builds things that think.",
  "role": "Chief Engineer",
  "subtitle": "Software & Machine Learning",
  "photo": "https://upload.wikimedia.org/...",
  "bio": "Elon Musk is the Chief Engineer...",
  "location": "Dhaka, BD",
  "session": "2026-27",
  "socials": [
    { "type": "github", "label": "GitHub", "url": "https://github.com/..." }
  ],
  "stats": [
    { "value": "4+", "label": "Years" },
    { "value": "12+", "label": "Projects" }
  ],
  "focus_areas": ["Deep Learning", "MLOps"],
  "skills": [
    {
      "category": "ML / AI",
      "icon": "brain",
      "items": ["PyTorch", "TensorFlow"]
    }
  ],
  "timeline": [
    { "role": "ML Engineer", "year": "2021", "current": false },
    { "role": "Senior ML Engineer", "year": "2023–present", "current": true }
  ],
  "projects": [
    {
      "title": "Distribution Detective",
      "description": "21-distribution detection pipeline...",
      "tags": ["Python", "SciPy"],
      "featured": true,
      "links": {
        "github": "https://...",
        "demo": "https://..."
      }
    }
  ],
  "cv_link": "/cv"
}
```

---

## 🎨 Layout & Design Integration

1. **Standard Sidebar Layout**: The Dynamic Profile is integrated into the site's standard layout. To maximize focus on the content, the sidebar is collapsed by default upon navigation to a profile page, though users can manually expand it.
2. **Global Top Navigation**: Features the site's global top navigation bar. This provides a consistent unified top bar containing the club logo, theme toggle switch, and hamburger menu.
3. **Typography & Brand Style**: Inherits the club's brand typography:
   * **Syne** (`--fh`) for large, magazine-cover typographic headers.
   * **SpaceMono** (`--fm`) for monospaced numbers, tag labels, experience timeline, and body copy.
4. **Signature Hover Effect**: All cards in the dynamic profile (Projects, Publications, Achievements, and Skills Categories) feature the site's signature hover effect:
   * Translates up by `-3px`.
   * Border transitions to `--b2` (border-2).
   * Background highlights with `--s2` (surface-2).
   * An accent-colored top line (`::after` border) slides in smoothly from the left.
   * In light mode, cards utilize a subtle box-shadow for depth and a refined cool-grey border palette.

---

## 🏛 Code Architecture

* **Orchestrator ([page.tsx](file:///home/naim/Projects/claude_code/ProgrammingClubWeb/programming-club-2.1/src/app/profile/page.tsx))**: Decides which profile view to mount. It reads the member database first, checks for `profile_link`, and calls `clientLoadProfile` in a `try/catch` block.
* **Layout Component ([LayoutWrapper.tsx](file:///home/naim/Projects/claude_code/ProgrammingClubWeb/programming-club-2.1/src/components/LayoutWrapper.tsx))**: Manages the shared navigation structure. For `/profile` and `/cv` routes, it ensures the sidebar is collapsed by default to provide a more focused viewing experience while maintaining access to global navigation.
* **Fallback Component ([DefaultProfile.tsx](file:///home/naim/Projects/claude_code/ProgrammingClubWeb/programming-club-2.1/src/app/profile/DefaultProfile.tsx))**: Contains the original, standard layout logic for club profiles.

## 📱 Mobile Timeline Fix

### Issue
The mobile layout of the experience/timeline section was only showing half of the timeline cards because it was hiding the left slot completely while only showing the right slot cards.

### Solution
Implemented two distinct wireframe layouts:

**Desktop (≥ 651px)**: Alternating left/right layout with centered spine  
**Mobile (≤ 650px)**: Vertical single-column layout with proper node positioning

### Key Changes
- **CSS Only Solution**: Uses media queries to switch layouts without JavaScript
- **Wireframe Match**: Mobile layout matches `docs/experience_timeline_midfi_variantB.html` exactly
- **Node Positioning**: Timeline dots at `left: -18px, top: 16px` (exact wireframe match)
- **Spine Positioning**: Spine at `left: 5px` (exact wireframe match)

### Files Modified
- `src/app/profile/DynamicProfile.module.css`: Mobile media query with proper positioning
- `src/app/profile/DynamicProfile.tsx`: Clean alternating logic (no complex class conditions)
