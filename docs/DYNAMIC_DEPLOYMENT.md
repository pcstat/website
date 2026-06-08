# Transitioning to Dynamic Deployment on Cloudflare Workers

This document outlines the requirements and steps to transition the project from a Static HTML Export to a dynamic site running on Cloudflare Workers (via Cloudflare Pages Functions).

## Overview
Currently, the project uses `output: 'export'` in `next.config.mjs`, which bakes all data into static HTML at build time. To make the site dynamic—allowing data changes to reflect instantly without a redeploy—the project must be migrated to the Cloudflare Edge Runtime.

## 1. Configuration Changes
To enable dynamic rendering, the following changes are required:

- **Modify `next.config.mjs`**: Remove the `output: 'export'` configuration.
- **Set the Runtime**: Cloudflare Workers use the Edge Runtime. Pages or layouts requiring dynamic logic must export the runtime configuration:
  ```typescript
  export const runtime = 'edge';
  ```

## 2. Critical Change: Removing `fs` Dependency
Cloudflare Workers run in a V8 Isolate environment and **do not have access to the Node.js File System (`fs`)**.

The current data loading logic in `src/lib/data.ts` uses `fs.readFile` for local fallbacks. This will cause the application to crash on Cloudflare Workers.

**Required Fixes:**
- **Option A**: Remove local filesystem fallbacks entirely and rely solely on remote HTTP fetches.
- **Option B**: Bundle JSON data by using `import` statements instead of `fs.readFile`, as bundled assets are available at runtime.

## 3. Tooling & Build Process
The build pipeline must be updated to use the `@cloudflare/next-on-pages` adapter.

### Installation
```bash
npm install --save-dev @cloudflare/next-on-pages
```

### Build Command
The build command must be changed from `npm run build` to:
```bash
npx @cloudflare/next-on-pages
```

## 4. Cloudflare Dashboard Configuration
The project settings in the Cloudflare Pages dashboard must be updated:

- **Framework Preset**: Change from `Next.js static html export` $\rightarrow$ `Next.js`.
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`

## Comparison: Static vs. Dynamic

| Feature | Static Export (Current) | Cloudflare Workers (Dynamic) |
| :--- | :--- | :--- |
| **Rendering** | Build-time (SSG) | Request-time (Edge SSR) |
| **Data Freshness** | Requires redeploy to update | Live updates from remote JSON |
| **Speed** | Extremely fast (Static) | Very fast (Edge compute) |
| **Runtime** | Node.js (Build) / Browser (Client) | Edge Runtime (V8 Isolate) |
| **Complexity** | Low | Medium (Runtime constraints) |
