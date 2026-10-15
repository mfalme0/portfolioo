#!/usr/bin/env node
/**
 * Build-time GitHub repo fetch.
 *
 * Runs once during `npm run build` and writes a typed TypeScript data file.
 * No runtime API calls, so the site cannot be broken by GitHub being down or
 * rate-limiting us.
 *
 * Fails soft: if the fetch fails for any reason, the previously committed
 * data file is left untouched and the build continues. That is why
 * `src/data/repos.generated.ts` is committed rather than gitignored — a fresh
 * clone can build and deploy with no network access at all.
 */

import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, "..", "src", "data", "repos.generated.ts");

const USERNAME = process.env.GITHUB_USERNAME ?? "mfalme0";
const API = "https://api.github.com";

/** Repos pinned to the top of the work section, in display order. */
const FEATURED = [
  "nexus",
  "resu-clean",
  "kifaru",
  "atlas",
  "neo-learn",
  "mfalme0-GSI",
  "open-zengee",
];

/** Excluded from the grid — templates, profile readme, this site, mirrors. */
const EXCLUDE = new Set([
  USERNAME,
  "portfolioo",
  "portfolioo2",
  "github-readme-stats",
]);

/** One-liners for repos whose GitHub description is empty. */
const CURATED_SUMMARY = {
  kifaru:
    "Transaction reliability platform in Rust — a correctness-first simulation of mobile-money transfer processing, built against a live PostgreSQL.",
  atlas:
    "Go service with the full open-source hygiene: changelog, contributing guide, security policy and docs.",
  "mfalme0-GSI":
    "Gaming setup indexer — drives RGB lighting across seven titles from one themed UI.",
  "open-zengee":
    "Python suite for controlling WLED and Tuya LED strips, including OpenMagic and Zengee hardware.",
  monies:
    "A rewrite of a personal finance tracker, done properly.",
  CS2RGB: "Counter-Strike 2 state to RGB — maps game state to lighting effects.",
  fps: "A sample frame-rate monitor written in Python.",
  archie: "Document archival software for physical paperwork.",
};

const headers = {
  "User-Agent": "portfolioo-build-fetch",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function github(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

/**
 * Read the previously committed data file so we can merge rather than clobber.
 *
 * The unauthenticated GitHub API allows 60 requests/hour. A full build makes
 * one request for the repo list plus one per repo for its language breakdown —
 * enough to exhaust that budget on a fresh machine. Merging means a
 * rate-limited build keeps whatever language data we already had rather than
 * silently degrading every repo to "unknown".
 */
const ARRAY_START = "export const repos: Repo[] = [";
const ARRAY_END = "\n];";

async function readExisting() {
  if (!existsSync(OUT_FILE)) return new Map();
  try {
    const source = await readFile(OUT_FILE, "utf8");
    const start = source.indexOf(ARRAY_START);
    // Must anchor on a line-leading "];". A bare lastIndexOf("];") would match
    // `string[];` inside the interface declarations above the array.
    const end = source.lastIndexOf(ARRAY_END);
    if (start === -1 || end === -1 || end < start) return new Map();

    const body = source
      .slice(start + ARRAY_START.length, end)
      .trim()
      .replace(/,$/, "");

    const parsed = JSON.parse(`[${body}]`);
    return new Map(parsed.map((r) => [r.name, r]));
  } catch {
    return new Map();
  }
}

async function fetchRepos(existing) {
  const repos = await github(
    `/users/${USERNAME}/repos?per_page=100&sort=updated`,
  );

  const kept = repos.filter(
    (r) => !r.fork && !r.archived && !EXCLUDE.has(r.name) && !EXCLUDE.has(r.full_name),
  );

  let rateLimitHit = false;

  // Languages are a separate endpoint per repo. Fetch them concurrently but
  // bounded, and treat a failure as "unknown" rather than aborting the build.
  const withLanguages = await Promise.all(
    kept.map(async (repo) => {
      let languages = {};
      try {
        languages = await github(`/repos/${repo.full_name}/languages`);
      } catch (error) {
        if (String(error).includes("403") || String(error).includes("429")) {
          rateLimitHit = true;
        }
      }
      return { repo, languages };
    }),
  );

  let missingLanguages = 0;

  const result = withLanguages.map(({ repo, languages }) => {
    const prior = existing.get(repo.name);

    // Prefer a fresh breakdown; fall back to the committed one; if neither,
    // synthesise a single-entry breakdown from the primary language so the
    // stack visualisation never shows a repo with no colour at all.
    let finalLanguages = languages;
    if (Object.keys(finalLanguages).length === 0 && prior?.languages) {
      finalLanguages = prior.languages;
    }
    if (Object.keys(finalLanguages).length === 0 && repo.language) {
      finalLanguages = { [repo.language]: 1 };
    }
    if (Object.keys(finalLanguages).length === 0) {
      missingLanguages += 1;
    }

    const totalBytes = Object.values(finalLanguages).reduce((a, b) => a + b, 0);
    const summary =
      repo.description?.trim() || CURATED_SUMMARY[repo.name] || "";

    return {
      name: repo.name,
      description: summary,
      url: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language ?? Object.keys(finalLanguages)[0] ?? null,
      languages: finalLanguages,
      totalBytes,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      topics: repo.topics ?? [],
      license: repo.license?.spdx_id ?? null,
      createdAt: repo.created_at,
      updatedAt: repo.pushed_at ?? repo.updated_at,
      isArchived: repo.archived,
      featured: FEATURED.includes(repo.name),
      featuredOrder: FEATURED.indexOf(repo.name),
    };
  });

  return { result, rateLimitHit, missingLanguages };
}

function serialise(repos) {
  const header = `/**
 * AUTO-GENERATED by scripts/fetch-repos.mjs — do not edit by hand.
 *
 * Regenerated on every build. Committed so the site can build with no
 * network access; the fetch script fails soft and leaves this file intact.
 */

export interface RepoLanguageBreakdown {
  [language: string]: number;
}

export interface Repo {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  languages: RepoLanguageBreakdown;
  totalBytes: number;
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  license: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  featured: boolean;
  featuredOrder: number;
}

export const FETCHED_AT = new Date().toISOString();
`;

  const body = repos
    .sort((a, b) => {
      // Featured repos first in their curated order, then by recency.
      if (a.featured && b.featured) return a.featuredOrder - b.featuredOrder;
      if (a.featured) return -1;
      if (b.featured) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    })
    .map((r) => `  ${JSON.stringify(r)},`)
    .join("\n");

  return `${header}
export const repos: Repo[] = [
${body}
];

export default repos;
`;
}

async function main() {
  if (!existsSync(OUT_FILE)) {
    console.warn("[fetch-repos] no existing data file and fetch failed will be fatal");
  }

  try {
    const existing = await readExisting();
    const { result: repos, rateLimitHit, missingLanguages } =
      await fetchRepos(existing);

    if (repos.length === 0) {
      throw new Error("fetch returned zero repos");
    }
    await writeFile(OUT_FILE, serialise(repos), "utf8");

    const featured = repos.filter((r) => r.featured).length;
    console.log(
      `[fetch-repos] wrote ${repos.length} repos (${featured} featured) to src/data/repos.generated.ts`,
    );

    if (rateLimitHit) {
      console.warn(
        "[fetch-repos] GitHub rate limit hit — language data was merged from the committed file. Set GITHUB_TOKEN in .env.local to avoid this.",
      );
    }
    if (missingLanguages > 0) {
      console.warn(
        `[fetch-repos] ${missingLanguages} repo(s) have no language data available.`,
      );
    }

    const undescribed = repos.filter((r) => !r.description);
    if (undescribed.length > 0) {
      console.warn(
        `[fetch-repos] ${undescribed.length} repo(s) have no description: ${undescribed
          .map((r) => r.name)
          .join(", ")}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (existsSync(OUT_FILE)) {
      const existing = await readFile(OUT_FILE, "utf8");
      if (existing.includes("export const repos")) {
        console.warn(
          `[fetch-repos] FAILED (${message}) — using committed data file, build continues.`,
        );
        return;
      }
    }
    console.error(`[fetch-repos] FAILED and no usable data file: ${message}`);
    process.exit(1);
  }
}

main();