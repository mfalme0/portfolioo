import { describe, it, expect } from "vitest";
import {
  computeSkyState,
  readableForeground,
  luminance,
  darkness,
} from "@/lib/sky";
import { NAIROBI } from "@/lib/solar";

/** WCAG relative luminance contrast ratio between two hex colours. */
function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * A Nairobi day in 15-minute steps, plus a summer and a winter day, so the
 * gradient is sampled across every phase it can reach.
 */
function sampleYear(month = 8): Date[] {
  const dates: Date[] = [];
  for (let day = 1; day <= 28; day++) {
    for (let minutes = 0; minutes < 1440; minutes += 15) {
      const d = new Date(Date.UTC(2026, month, day, 0, 0, 0));
      d.setUTCMinutes(d.getUTCMinutes() + minutes);
      dates.push(d);
    }
  }
  return dates;
}

describe("readableForeground", () => {
  it("returns white on dark backgrounds and black on light ones", () => {
    expect(readableForeground("#000000")).toBe("#FFFFFF");
    expect(readableForeground("#FFFFFF")).toBe("#000000");
  });

  it("closes the mid-luminance gap where neither pure black nor pure white suffices", () => {
    // The specific failure mode this guards against: a background around
    // luminance 0.18 where a lifted "ink" colour leaves both options just
    // under 4.5:1. Pure black is what closes it.
    for (const grey of ["#69749d", "#69769f", "#6a769f", "#707a90"]) {
      const fg = readableForeground(grey);
      expect(contrastRatio(grey, fg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("always achieves at least 4.5:1", () => {
    // Sweep the whole greyscale plus a range of saturated hues.
    const samples: string[] = [];
    for (let v = 0; v <= 255; v += 5) {
      const hex = v.toString(16).padStart(2, "0");
      samples.push(`#${hex}${hex}${hex}`);
    }
    samples.push("#26406F", "#C4703C", "#BCD9F2", "#2B3E6B", "#E89A4A");

    for (const bg of samples) {
      const fg = readableForeground(bg);
      expect(contrastRatio(bg, fg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("computeSkyState", () => {
  it("always returns text that meets WCAG AA against its own sky", () => {
    // This is the guarantee that replaces the old hardcoded colour pairs,
    // which failed at 3.1:1 during the morning gradient.
    const dates = [...sampleYear(8), ...sampleYear(0), ...sampleYear(5)];
    let worstPrimary = Infinity;
    let worstMuted = Infinity;
    let worstHorizon = Infinity;

    for (const date of dates) {
      const state = computeSkyState(date, NAIROBI);

      // Primary text is measured against the mid sky, which is what hero copy
      // actually sits on. Text placed over the horizon uses a separate token,
      // checked below.
      worstPrimary = Math.min(
        worstPrimary,
        contrastRatio(state.mid, state.foreground),
      );

      worstHorizon = Math.min(
        worstHorizon,
        contrastRatio(state.horizon, state.foregroundHorizon),
      );

      // Secondary text is real content too — not decoration — so it is held
      // to the same bar.
      worstMuted = Math.min(
        worstMuted,
        contrastRatio(state.mid, state.foregroundMuted),
      );
    }

    expect(worstPrimary).toBeGreaterThanOrEqual(4.5);
    expect(worstMuted).toBeGreaterThanOrEqual(4.5);
    expect(worstHorizon).toBeGreaterThanOrEqual(4.5);
  });

  it("never emits an invalid hex colour", () => {
    for (const date of sampleYear()) {
      const state = computeSkyState(date, NAIROBI);
      for (const colour of [
        state.zenith,
        state.mid,
        state.horizon,
        state.ground,
        state.foreground,
        state.foregroundMuted,
        state.foregroundHorizon,
        state.lightColor,
      ]) {
        // Case-insensitive: the gradient keyframes are authored uppercase and
        // the interpolator emits lowercase, so both must be valid CSS.
        expect(colour).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it("selects beach by day and street at night", () => {
    const noon = new Date(Date.UTC(2026, 8, 22, 9, 26, 0));
    const midnight = new Date(Date.UTC(2026, 8, 22, 18, 30, 0));

    expect(computeSkyState(noon, NAIROBI).mood).toBe("beach");
    expect(computeSkyState(midnight, NAIROBI).mood).toBe("street");
  });

  it("transitions through every twilight band across a day", () => {
    const phases = new Set<string>();
    for (const date of sampleYear()) {
      phases.add(computeSkyState(date, NAIROBI).phase);
    }
    // Nairobi should pass through all six over a single day.
    expect(phases).toContain("day");
    expect(phases).toContain("golden");
    expect(phases).toContain("civil");
    expect(phases).toContain("nautical");
    expect(phases).toContain("astronomical");
    expect(phases).toContain("night");
  });

  it("keeps the sun and moon inside the viewport", () => {
    for (const date of sampleYear()) {
      const { disc } = computeSkyState(date, NAIROBI);
      expect(disc.x).toBeGreaterThanOrEqual(0);
      expect(disc.x).toBeLessThanOrEqual(1);
      expect(disc.y).toBeGreaterThan(0);
      expect(disc.y).toBeLessThan(1);
    }
  });

  it("fades stars only at night", () => {
    const noon = computeSkyState(new Date(Date.UTC(2026, 8, 22, 9, 26, 0)), NAIROBI);
    const midnight = computeSkyState(new Date(Date.UTC(2026, 8, 22, 18, 30, 0)), NAIROBI);

    expect(noon.starOpacity).toBe(0);
    expect(midnight.starOpacity).toBeGreaterThan(0.9);
  });

  it("is deterministic for a given instant", () => {
    const date = new Date(Date.UTC(2026, 8, 22, 15, 0, 0));
    expect(computeSkyState(date, NAIROBI)).toEqual(
      computeSkyState(new Date(date), NAIROBI),
    );
  });
});

describe("darkness", () => {
  it("ramps from daylight to full night", () => {
    expect(darkness(60)).toBe(0);
    expect(darkness(-12)).toBe(1);
    // Higher sun means less dark.
    expect(darkness(5)).toBeLessThan(darkness(-5));
    expect(darkness(-5)).toBeLessThan(darkness(-15));
  });

  it("stays within 0..1 at the extremes", () => {
    for (let alt = -90; alt <= 90; alt += 1) {
      const d = darkness(alt);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    }
  });
});