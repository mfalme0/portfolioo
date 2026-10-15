import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useScrollProgress, easeDescent } from "@/hooks/useScrollProgress";
import { useRenderGate } from "@/hooks/useRenderGate";

describe("easeDescent", () => {
  it("pins both endpoints", () => {
    expect(easeDescent(0)).toBe(0);
    expect(easeDescent(1)).toBe(1);
  });

  it("clamps outside 0..1", () => {
    expect(easeDescent(-5)).toBe(0);
    expect(easeDescent(12)).toBe(1);
  });

  it("is monotonically increasing", () => {
    let previous = -1;
    for (let t = 0; t <= 1.0001; t += 0.01) {
      const value = easeDescent(t);
      expect(value).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = value;
    }
  });

  it("stays within bounds", () => {
    for (let t = -1; t <= 2; t += 0.05) {
      const value = easeDescent(t);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("eases out near the end so the descent lands rather than stops", () => {
    // The last 10% of scroll should cover a small fraction of the altitude
    // change — that is what produces a soft touchdown at the footer.
    const nearEnd = easeDescent(1) - easeDescent(0.9);
    const middle = easeDescent(0.55) - easeDescent(0.45);
    expect(nearEnd).toBeLessThan(middle);
  });
});

describe("useScrollProgress", () => {
  const originalHeight = Object.getOwnPropertyDescriptor(
    document.documentElement,
    "scrollHeight",
  );

  beforeEach(() => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 5000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 1000,
    });
    window.scrollY = 0;
  });

  afterEach(() => {
    if (originalHeight) {
      Object.defineProperty(
        document.documentElement,
        "scrollHeight",
        originalHeight,
      );
    }
  });

  it("starts at zero", () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current.progress).toBe(0);
    expect(result.current.descent).toBe(0);
  });

  it("normalises scroll position against scrollable distance", async () => {
    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      window.scrollY = 2000; // halfway of 4000 scrollable
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(result.current.progress).toBeCloseTo(0.5, 2);
    });
  });

  it("clamps to 1 at the bottom and 0 at the top", async () => {
    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      window.scrollY = 99999;
      window.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(result.current.progress).toBe(1));

    act(() => {
      window.scrollY = -500;
      window.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(result.current.progress).toBe(0));
  });

  it("handles a page shorter than the viewport without dividing by zero", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 400,
    });

    const { result } = renderHook(() => useScrollProgress());
    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(Number.isFinite(result.current.progress)).toBe(true);
      expect(result.current.progress).toBeGreaterThanOrEqual(0);
      expect(result.current.progress).toBeLessThanOrEqual(1);
    });
  });

  it("mirrors progress onto the document as CSS variables", async () => {
    renderHook(() => useScrollProgress());

    act(() => {
      window.scrollY = 1000;
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue("--scroll-progress"),
      ).not.toBe("");
      expect(
        document.documentElement.style.getPropertyValue("--scroll-descent"),
      ).not.toBe("");
    });
  });

  it("flags scrolling, then clears it once idle", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.scrolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.scrolling).toBe(false);

    vi.useRealTimers();
  });

  it("removes its listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useScrollProgress());
    unmount();

    const removed = removeSpy.mock.calls.map((c) => c[0]);
    expect(removed).toContain("scroll");
    expect(removed).toContain("resize");
    removeSpy.mockRestore();
  });
});

describe("useRenderGate", () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalHardwareConcurrency = Object.getOwnPropertyDescriptor(
    navigator,
    "hardwareConcurrency",
  );

  beforeEach(() => {
    // Default to "WebGL is available" so the enabled path is exercised.
    const getContext = vi.fn(() => ({
      getExtension: () => ({ loseContext: () => {} }),
    }));
    HTMLCanvasElement.prototype.getContext = getContext as never;
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 16,
    });
  });

  afterEach(() => {
    // Restore matchMedia spies — a leaked reduced-motion mock makes every
    // subsequent test in this file see the gate as disabled.
    vi.restoreAllMocks();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    if (originalHardwareConcurrency) {
      Object.defineProperty(
        navigator,
        "hardwareConcurrency",
        originalHardwareConcurrency,
      );
    }
  });

  it("enables the scene when WebGL is available and motion is allowed", async () => {
    const { result } = renderHook(() => useRenderGate());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.quality).toBe("full");
  });

  it("disables entirely when WebGL is unavailable", async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;

    const { result } = renderHook(() => useRenderGate());
    await waitFor(() => expect(result.current.enabled).toBe(false));
    expect(result.current.quality).toBe("off");
    expect(result.current.shouldRender).toBe(false);
  });

  it("disables when the reader prefers reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }) as never);

    const { result } = renderHook(() => useRenderGate());
    await waitFor(() => expect(result.current.enabled).toBe(false));
  });

  it("does not render while the reader is idle at the top of the page", async () => {
    const { result } = renderHook(() => useRenderGate({ progress: 0 }));
    await waitFor(() => expect(result.current.enabled).toBe(true));
    // A full-viewport canvas rendering continuously with nobody scrolling is
    // the most expensive mistake available here.
    expect(result.current.shouldRender).toBe(false);
  });

  it("renders once the reader engages with the page", async () => {
    const { result } = renderHook(() => useRenderGate({ progress: 0.4 }));
    await waitFor(() => expect(result.current.shouldRender).toBe(true));
  });

  it("degrades quality on constrained hardware instead of failing", async () => {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 2,
    });

    const { result } = renderHook(() => useRenderGate({ progress: 0.4 }));
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.quality).toBe("reduced");
  });
});