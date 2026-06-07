# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- Install dependencies: `npm install`
- Start local server: `npm run dev` (Open `http://localhost:3000`)
- Build for production: `npm run build`

### Testing & Validation
- The project uses Next.js built-in linting: `npm run lint`
- Type checking is handled by TypeScript during build/dev.

## File Read Guidelines
- If you see "waste call" error/warning and you do not have the file in your context then you should try to read the file using a large number of lines (example: line 1-3000).

## Architecture Overview

The Statistics Programming Club website is a **data-driven Next.js 16 application** using **React 19** and **TypeScript**.

### Core Patterns
- **Content-as-Data**: All dynamic content is stored in JSON files in `public/resources/` and fetched via server-side utilities in `src/lib/data.ts`.
- **App Router**: Uses Next.js App Router for routing, layouts, and server-side rendering.
- **Theme System**: Driven by CSS variables with a React Context provider (`src/context/ThemeContext.tsx`) for light/dark mode switching and persistence via `localStorage`.
- **Dynamic Profile**: Opt-in magazine-cover style portfolio (`src/app/profile/DynamicProfile.tsx`) that renders on `/profile?id=...` if `profile_link` is configured in `executives.json`. Automatically falls back to `DefaultProfile.tsx` if fetching fails.

### Data Management (`src/lib/data.ts`)
A centralized utility for loading data:
- **Type Safety**: Every data source has a corresponding TypeScript interface (e.g., `Member`, `Project`, `ClubEvent`).
- **Universal Loader**: Uses `loadJsonData<T>(source)` to fetch JSON from either the local filesystem (`public/resources/`) or an external URL (starting with `http`).
- **Registry-Based Loading**: Data paths are mapped in `public/resources/data/database.json`. When adding or moving a data file, update this registry first.
- **Fetching**: Server-side rendering utilities (e.g., `getDatabase`, `getProjects`) leverage this registry and the universal loader.

### Data Schema & Registry (`public/resources/data/database.json`)
- The `database.json` file is the single source of truth for data locations.
- It maps data types (e.g., `executives`, `projects`) to their relative paths or external URLs.
- **Important**: When adding new data files, ensure they are registered in `database.json`.

## Development Guidelines

### Adding New Content
1. Update the corresponding JSON file in `public/resources/data/`.
2. Use the unified Admin Panel at `/admin` (in development mode) to make changes via GUI or raw JSON.
3. If the content requires a new UI representation, update the relevant page component in `src/app/`.

### Transitioning to a New Academic Year
1. Open the Admin Panel at `/admin` (ensure development server is running: `npm run dev`).
2. Go to the **Executives** editor.
3. Add a new committee with a unique Session ID (e.g., `2027-28`).
4. Add new executives and set the `total_members` headcount.
5. Set the new committee as the **Active Committee**.
6. Click **Save** (in local dev mode) or click **Export** to manually replace `public/resources/data/executives.json`, then commit the change.

### Resource Editors (Admin Panel)
A unified admin interface is provided at `/admin` to edit all data files:
- Executives Editor $\rightarrow$ `executives.json`
- Projects Editor $\rightarrow$ `projects.json`
- Events Editor $\rightarrow$ `events.json`
- Courses Editor $\rightarrow$ `courses.json`
- Achievements Editor $\rightarrow$ `achievements.json`
*Note: The Admin Panel is a built-in Next.js page (`src/app/admin/page.tsx`). Files can be saved directly in development mode.*

## Quick Reference

### Key Components & Logic
- `src/app/layout.tsx`: Root layout, Metadata, and Theme flash prevention script.
- `src/components/LayoutWrapper.tsx`: Shared navigation structure. Supports `isFullscreen` toggle via `LayoutContext` to hide menus.
- `src/context/ThemeContext.tsx`: Theme state and toggle logic.
- `src/lib/data.ts` & `src/lib/clientData.ts`: Data fetching and universal loading functions.
- `src/app/profile/page.tsx`: Portfolio view orchestrator (`/profile?id=...`).
- `src/app/profile/DynamicProfile.tsx`: Immersive, full-width magazine-style portfolio view.
- `src/app/profile/DefaultProfile.tsx`: Standard card-based fallback profile view.
- `src/app/cv/page.tsx`: CV view (`/cv?id=...`).

### CSS Variable System (`src/app/globals.css`)
- `--bg`: Background color
- `--fg`: Foreground/Text color
- `--ac`: Accent color (Primary brand color)
- `--mut`: Muted text color
- `--gap`: Standard spacing unit
- `--rad`: Global border radius
