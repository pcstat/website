import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The site is a fully static export (`out/`), hosted on Cloudflare Pages.
 * Content comes from the database repo at build time — see src/lib/database/.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
