import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RepoArtwork } from "@/components/projects/RepoArtwork";
import type { Repo } from "@/data/repos.generated";
import { expectNoAxeViolations } from "@/test-utils/axe";

/**
 * Generated artwork.
 *
 * The determinism requirement is the point of these tests: the SVG is
 * seeded from the repo name, and a non-deterministic pattern would be a
 * server/client hydration mismatch plus a visibly different card on every
 * reload.
 */

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    name: "nexus",
    description: "test",
    url: "https://github.com/mfalme0/nexus",
    homepage: null,
    language: "Python",
    languages: { Python: 100 },
    totalBytes: 100,
    stars: 0,
    forks: 0,
    openIssues: 0,
    topics: [],
    license: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    isArchived: false,
    featured: true,
    featuredOrder: 0,
    ...overrides,
  };
}

describe("RepoArtwork", () => {
  it("is hidden from assistive tech", () => {
    // Purely decorative — the repo name beside it carries the meaning.
    const { container } = render(<RepoArtwork repo={makeRepo()} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("role", "presentation");
  });

  it("produces an identical pattern for the same repo", () => {
    // The visual output must be stable — a pattern that shifted on reload
    // would be a hydration mismatch and would make the same card look
    // different every visit. The <defs> ids are intentionally NOT stable:
    // they are namespaced per instance via useId so that two cards for the
    // same repo do not collide. Compare geometry only.
    const repo = makeRepo();
    const geometryOf = (markup: string) =>
      markup.replace(/id="[^"]*"/g, "").replace(/url\(#[^)]*\)/g, "url(#)");

    const a = geometryOf(render(<RepoArtwork repo={repo} />).container.innerHTML);
    const b = geometryOf(render(<RepoArtwork repo={repo} />).container.innerHTML);
    expect(a).toBe(b);
  });

  it("produces a different pattern for different repos", () => {
    const geometryOf = (markup: string) =>
      markup.replace(/id="[^"]*"/g, "").replace(/url\(#[^)]*\)/g, "url(#)");

    const a = geometryOf(
      render(<RepoArtwork repo={makeRepo({ name: "nexus" })} />).container.innerHTML,
    );
    const b = geometryOf(
      render(<RepoArtwork repo={makeRepo({ name: "kifaru" })} />).container.innerHTML,
    );
    expect(a).not.toBe(b);
  });

  it("uses unique gradient ids so multiple cards do not collide", () => {
    const { container } = render(
      <>
        <RepoArtwork repo={makeRepo({ name: "nexus" })} />
        <RepoArtwork repo={makeRepo({ name: "nexus" })} />
      </>,
    );

    // Two cards for the same repo must not share defs, or the second would
    // render with the first one's gradients.
    const ids = [...container.querySelectorAll("linearGradient")].map((n) =>
      n.getAttribute("id"),
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
  });

  it("falls back to the language colour for unlisted projects", () => {
    const { container } = render(
      <RepoArtwork repo={makeRepo({ name: "unknown-project", language: "Rust" })} />,
    );
    // Must still render valid SVG rather than throwing on a missing accent.
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("handles a repo with no language at all", () => {
    const { container } = render(
      <RepoArtwork repo={makeRepo({ name: "no-lang", language: null, languages: {} })} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RepoArtwork repo={makeRepo()} />);
    await expectNoAxeViolations(container);
  });
});