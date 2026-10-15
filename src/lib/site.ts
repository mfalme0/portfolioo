/**
 * Single source of truth for site identity, shared by metadata and the
 * build-time route generators (sitemap, robots, manifest, OG image).
 */

export const SITE_NAME = "Mfalme";
export const SITE_AUTHOR = "Joseph Gitau";
export const SITE_TITLE = `${SITE_NAME} — Software Engineer`;
export const SITE_DESCRIPTION =
  "Joseph Gitau — software engineer building transaction reliability systems, AI SRE tooling, and self-hosted software. Nairobi, Kenya.";
export const SITE_LOCALE = "en_KE";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfalme.runs-on.dev"
).replace(/\/+$/, "");
export const GITHUB_USERNAME = "mfalme0";
export const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;