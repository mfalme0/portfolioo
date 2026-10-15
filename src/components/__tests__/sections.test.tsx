import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepoGrid } from "@/components/sections/RepoGrid";
import { Hero } from "@/components/sections/Hero";
import { SkyProvider } from "@/components/sky/SkyProvider";
import { Contact } from "@/components/sections/Contact";
import { ScrollShell } from "@/components/ScrollShell";

/**
 * Sections that need the sky context, plus the filter interaction.
 *
 * Hero is worth testing for a specific reason: it derives its text colour
 * from the sky rather than hard-coding it, so a regression there would be
 * invisible in a snapshot but would ship unreadable text at some hour of the
 * day.
 */

function renderWithSky(ui: React.ReactElement) {
  // Hero reads scroll progress through context, so it must sit inside
  // ScrollShell.
  return render(
    <SkyProvider>
      <ScrollShell>{ui}</ScrollShell>
    </SkyProvider>,
  );
}

describe("Hero", () => {
  it("renders exactly one h1", () => {
    // The old hero rendered two <h1> elements.
    const { container } = renderWithSky(<Hero />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("never renders mojibake in its visible text", () => {
    // Corrupted UTF-8 shipped before as "Good Afternoon! dYO�".
    const { container } = renderWithSky(<Hero />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\uFFFD/);
  });

  it("greets the reader with a time-appropriate salutation", () => {
    const { container } = renderWithSky(<Hero />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Still up|Good morning|Good afternoon|Good evening|Good night/);
  });

  it("offers both primary actions as real links", () => {
    renderWithSky(<Hero />);
    expect(
      screen.getByRole("link", { name: /see what i have built/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get in touch/i })).toBeInTheDocument();
  });

  it("labels its scroll affordance rather than leaving an unlabelled icon", () => {
    renderWithSky(<Hero />);
    expect(
      screen.getByRole("link", { name: /scroll to work/i }),
    ).toBeInTheDocument();
  });

  it("stays interactive at the top of the page", () => {
    const { container } = renderWithSky(<Hero />);
    const section = container.querySelector("section");
    // At rest the hero must be fully visible and clickable.
    expect(parseFloat(section?.style.opacity ?? "0")).toBe(1);
    expect(section?.style.pointerEvents).not.toBe("none");
  });

  it("offers a location control for visitors who want their own sky", () => {
    renderWithSky(<Hero />);
    expect(
      screen.getByRole("button", { name: /show my sky/i }),
    ).toBeInTheDocument();
  });
});

describe("RepoGrid", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists the non-featured repositories", () => {
    render(<RepoGrid />);
    const list = screen.getByRole("list");
    expect(list.children.length).toBeGreaterThan(0);
  });

  it("filters to a single language and back to all", async () => {
    const user = userEvent.setup();
    render(<RepoGrid />);

    const allCount = screen.getByRole("list").children.length;

    // JavaScript is present across several non-featured repos, so this
    // exercises a filter that genuinely narrows the list.
    const js = screen.getByRole("button", { name: /javascript/i });
    await user.click(js);

    expect(js).toHaveAttribute("aria-pressed", "true");

    const filtered = screen.getByRole("list").children.length;
    expect(filtered).toBeLessThan(allCount);
    expect(filtered).toBeGreaterThan(0);

    // Clicking the active filter again resets it.
    await user.click(screen.getByRole("button", { name: /javascript/i }));
    expect(screen.getByRole("list").children.length).toBe(allCount);
  });

  it("marks the active filter for assistive tech", async () => {
    const user = userEvent.setup();
    render(<RepoGrid />);

    const all = screen.getByRole("button", { name: /^all/i });
    expect(all).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /javascript/i }));
    expect(screen.getByRole("button", { name: /^all/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("only offers filters for languages that actually have repos", () => {
    render(<RepoGrid />);
    // Rust lives only in kifaru, which is featured and therefore not in this
    // grid. Offering a Rust filter here would show an empty result.
    expect(screen.queryByRole("button", { name: /rust/i })).toBeNull();
    expect(screen.getByRole("button", { name: /javascript/i })).toBeInTheDocument();
  });

  it("exposes the filter group with an accessible name", () => {
    render(<RepoGrid />);
    expect(
      screen.getByRole("group", { name: /filter repositories by language/i }),
    ).toBeInTheDocument();
  });
});

describe("Contributions", () => {
  it("does not force a minimum width that would overflow the viewport", async () => {
    // The old calendar was wrapped in min-w-[1200px], which made the entire
    // page scroll sideways on any viewport narrower than that.
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        totalContributions: 100,
        contributions: Array.from({ length: 365 }, (_, i) => ({
          date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
          count: i % 5,
          level: i % 5,
        })),
      }),
    }) as never;

    const { Contributions } = await import("@/components/sections/Contributions");
    const { container } = render(<Contributions />);

    await waitFor(() => {
      expect(screen.getByRole("img", { name: /contributions/i })).toBeInTheDocument();
    });

    // No element in the component may impose a fixed width larger than a
    // typical viewport.
    const html = container.innerHTML;
    expect(html).not.toContain("1200px");
    expect(html).not.toContain("min-w-[1200px]");

    global.fetch = originalFetch;
  });
});

describe("Contact", () => {
  it("renders the GitHub and email links", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();
  });
});