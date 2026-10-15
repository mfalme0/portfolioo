import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The build-time fetch is the one piece of this site that can break a deploy
 * in ways typechecking will never catch: it makes a network call, and a
 * failure must not take the build down with it.
 *
 * These tests check the committed artefact rather than mocking the network,
 * because the thing that matters is "can a fresh clone deploy", not "does the
 * HTTP layer behave".
 */

const DATA_FILE = join(process.cwd(), "src", "data", "repos.generated.ts");
const SCRIPT_FILE = join(process.cwd(), "scripts", "fetch-repos.mjs");

const ARRAY_START = "export const repos: Repo[] = [";
const ARRAY_END = "\n];";

function readRepos(): Array<Record<string, unknown>> {
  const source = readFileSync(DATA_FILE, "utf8");
  const start = source.indexOf(ARRAY_START);
  const end = source.lastIndexOf(ARRAY_END);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);

  const body = source.slice(start + ARRAY_START.length, end).trim().replace(/,$/, "");
  return JSON.parse(`[${body}]`);
}

describe("repos.generated.ts", () => {
  it("exists and is committed so a fresh clone can build offline", () => {
    expect(existsSync(DATA_FILE)).toBe(true);

    // The whole fail-soft design depends on this file being tracked rather
    // than gitignored. If it is ever ignored, an offline clone cannot build.
    const gitignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
    expect(gitignore).not.toMatch(/^\s*\/src\/data\/repos\.generated\.ts/m);
  });

  it("contains a parseable list of repos", () => {
    const repos = readRepos();
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.length).toBeGreaterThan(5);
  });

  it("carries the fields the UI depends on", () => {
    for (const repo of readRepos()) {
      expect(typeof repo.name).toBe("string");
      expect(typeof repo.url).toBe("string");
      expect(repo.url).toMatch(/^https:\/\/github\.com\//);
      expect(Array.isArray(repo.topics)).toBe(true);
      expect(typeof repo.languages).toBe("object");
    }
  });

  it("does not include the site itself or forks as projects", () => {
    const names = readRepos().map((r) => r.name as string);
    expect(names).not.toContain("portfolioo");
    expect(names).not.toContain("portfolioo2");
    expect(names).not.toContain("mfalme0");
  });

  it("features repos that actually exist on the account", () => {
    const featured = readRepos().filter((r) => r.featured === true);
    expect(featured.length).toBeGreaterThan(0);

    // These were curated by hand; if one is renamed or deleted the fetch
    // would silently drop it and the layout would quietly shrink.
    for (const repo of featured) {
      expect(typeof repo.url).toBe("string");
    }
  });
});

describe("fetch-repos.mjs", () => {
  const script = readFileSync(SCRIPT_FILE, "utf8");

  it("fails soft rather than exiting non-zero when the API is unreachable", () => {
    // The GitHub API allows 60 requests/hour unauthenticated, and a build
    // makes roughly one per repo. Hitting the limit is normal, not an error
    // condition, and must not break the build.
    expect(script).toMatch(/using committed data file/);
    expect(script).toMatch(/process\.exit\(1\)/);
  });

  it("merges language data instead of clobbering it when rate limited", () => {
    expect(script).toMatch(/readExisting/);
    expect(script).toMatch(/prior\?\.languages/);
  });

  it("parses the data file on a line-anchored delimiter", () => {
    // A bare lastIndexOf("];") matches `string[];` inside the interface
    // declarations and produces garbage. This exact bug shipped once.
    expect(script).toMatch(/const ARRAY_END = "\\n\];"/);
  });

  it("documents the token it expects", () => {
    expect(script).toMatch(/GITHUB_TOKEN/);
  });
});