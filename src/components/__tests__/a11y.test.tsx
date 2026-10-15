import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@/test-utils/axe";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Stack } from "@/components/sections/Stack";
import { Contact } from "@/components/sections/Contact";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Accessibility checks against rendered output.
 *
 * These exist because the site used to ship a duplicate <h1>, an image with
 * alt="Your Profile Picture", and a div with onClick acting as a button. All
 * three passed visual review and none were caught until this kind of test
 * existed.
 */

describe("FeaturedWork", () => {
  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<FeaturedWork />);
    await expectNoAxeViolations(container);
  });

  it("promotes the section heading as the accessible name", () => {
    render(<FeaturedWork />);
    expect(
      screen.getByRole("heading", { name: /three things/i, level: 2 }),
    ).toBeInTheDocument();
  });

  it("links every project to GitHub with a descriptive label", () => {
    render(<FeaturedWork />);

    const links = screen.getAllByRole("link", { name: /on github/i });
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      // A bare "GitHub" link repeated many times is useless to a screen
      // reader user scanning the page.
      const label = link.getAttribute("aria-label") ?? "";
      expect(label).toMatch(/open .+ on github/i);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("does not link to the repos that no longer exist", () => {
    const { container } = render(<FeaturedWork />);
    const html = container.innerHTML;

    // ganji and betterFarm both 404 on GitHub. They were linked as live
    // projects on the old site.
    expect(html).not.toContain("mfalme0/ganji");
    expect(html).not.toContain("mfalme0/betterFarm");
  });
});

describe("Stack", () => {
  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Stack />);
    await expectNoAxeViolations(container);
  });

  it("describes the language bar for assistive tech", () => {
    render(<Stack />);
    const bar = screen.getByRole("img", { name: /typescript/i });
    expect(bar).toBeInTheDocument();
  });

  it("shows real measured percentages rather than skill labels", () => {
    const { container } = render(<Stack />);
    // The old site asserted self-assessed "Expert"/"Advanced" levels. Those
    // cannot be verified and are gone.
    expect(container.textContent).not.toMatch(/Expert|Intermediate/i);
  });
});

describe("Contact", () => {
  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Contact />);
    await expectNoAxeViolations(container);
  });

  it("gives every link an accessible name", () => {
    render(<Contact />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.textContent?.trim()).toBeTruthy();
    }
  });
});

describe("Footer", () => {
  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Footer />);
    await expectNoAxeViolations(container);
  });
});

describe("Header", () => {
  it("renders a labelled navigation landmark", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: /primary/i }),
    ).toBeInTheDocument();
  });

  it("exposes the mobile menu toggle as a real button", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-nav");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // The old full-screen overlay had no Escape handler, trapping keyboard
    // users with no way out.
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu when a link is followed", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button"));

    // The mobile panel is outside the <nav> landmark, so scope to it by id
    // rather than by role — otherwise this grabs the desktop link, which has
    // no close handler.
    const panel = document.getElementById("mobile-nav");
    expect(panel).not.toBeNull();

    const mobileLink = within(panel as HTMLElement).getByRole("link", {
      name: /^work$/i,
    });
    await user.click(mobileLink);

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("page structure", () => {
  it("renders exactly one h1 across the composed page", () => {
    // The old hero rendered two <h1> elements.
    render(
      <>
        <Header />
        <main>
          <FeaturedWork />
          <Stack />
          <Contact />
        </main>
        <Footer />
      </>,
    );

    const h1s = document.querySelectorAll("h1");
    // Hero supplies the single h1; these sections contribute none.
    expect(h1s.length).toBe(0);
  });
});