import type { Config } from "tailwindcss";

/**
 * Tailwind v4 is CSS-first. This file only carries the few things that cannot
 * live in `@theme` (content sources + plugins). Every design token — colour,
 * type scale, spacing, easing, radius, shadow — is declared in
 * `app/globals.css` inside `@theme`.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  plugins: [],
};

export default config;