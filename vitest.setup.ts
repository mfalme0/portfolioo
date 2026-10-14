import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// jsdom lacks these; R3F and the scroll-driven background both touch them.
if (typeof window !== "undefined") {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;

  window.scrollTo = window.scrollTo ?? (() => {});

  if (!("IntersectionObserver" in window)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds: number[] = [];
    }
    // @ts-expect-error test shim
    window.IntersectionObserver = IO;
    // @ts-expect-error test shim
    globalThis.IntersectionObserver = IO;
  }

  if (!("ResizeObserver" in window)) {
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    // @ts-expect-error test shim
    window.ResizeObserver = RO;
    // @ts-expect-error test shim
    globalThis.ResizeObserver = RO;
  }
}