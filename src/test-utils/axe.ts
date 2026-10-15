/**
 * Thin wrapper over `jest-axe`'s matchers.
 *
 * The alternative is augmenting Vitest's `Assertion` interface globally. That
 * is fragile in practice: `declare module "vitest"` in an ambient .d.ts
 * *replaces* the module rather than merging with it (stripping `describe`,
 * `it` and `expect` from the whole project), while augmenting the `Vi`
 * global does not reach `expect` imported directly from `"vitest"`.
 *
 * A local helper is explicit, survives library upgrades, and fails loudly at
 * the call site instead of silently at build time.
 */
import { expect } from "vitest";
import { axe, type AxeViolation } from "jest-axe";

/**
 * Assert that an element has no automatically detectable accessibility
 * violations.
 */
export async function expectNoAxeViolations(
  container: Element | HTMLElement,
): Promise<void> {
  const results = await axe(container);

  if (results.violations.length > 0) {
    const summary = results.violations
      .map(
        (v: AxeViolation) =>
          `  - ${v.id} (${v.impact ?? "unknown"}): ${v.help}\n    ${v.nodes
            .map((n) => String(n.html).slice(0, 120))
            .join("\n    ")}`,
      )
      .join("\n");

    expect.fail(`Expected no accessibility violations, found ${results.violations.length}:\n${summary}`);
  }
}