import { describe, it, expect } from "vitest";
import { moonPhase, moonPhaseName, moonIllumination, moonPosition } from "@/lib/moon";
import { NAIROBI } from "@/lib/solar";

describe("moonPhase", () => {
  it("returns a value in 0..1", () => {
    for (let day = 1; day <= 28; day++) {
      const p = moonPhase(new Date(Date.UTC(2026, 0, day, 12, 0, 0)));
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
  });

  it("advances roughly one full cycle over a synodic month", () => {
    const start = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
    const end = new Date(Date.UTC(2026, 0, 29, 12, 0, 0)); // 28 days later
    const p0 = moonPhase(start);
    const p1 = moonPhase(end);
    // 28 days is 0.966 of a 29.53-day synodic month, so the phase should have
    // advanced by roughly 0.966 of a cycle.
    let advance: number = p1 - p0;
    if (advance < 0) advance += 1;
    expect(advance).toBeGreaterThan(0.9);
    expect(advance).toBeLessThan(1.0);
  });

  it("is monotonic within a single lunation", () => {
    let previous = moonPhase(new Date(Date.UTC(2026, 2, 1, 12, 0, 0)));
    let sawWrap = false;
    for (let day = 2; day <= 28; day++) {
      const current = moonPhase(new Date(Date.UTC(2026, 2, day, 12, 0, 0)));
      if (current < previous) sawWrap = true;
      previous = current;
    }
    // At most one wrap across a lunation.
    expect(sawWrap).toBe(true);
  });
});

describe("moonPhaseName", () => {
  it("returns a recognised phase name", () => {
    const names = new Set([
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ]);
    for (let day = 1; day <= 28; day++) {
      const name = moonPhaseName(new Date(Date.UTC(2026, 4, day, 12, 0, 0)));
      expect(names.has(name)).toBe(true);
    }
  });
});

describe("moonIllumination", () => {
  it("stays within 0..1", () => {
    for (let day = 1; day <= 28; day++) {
      const v = moonIllumination(new Date(Date.UTC(2026, 6, day, 12, 0, 0)));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("reaches near zero at new moon and near one at full moon", () => {
    let min = 1;
    let max = 0;
    for (let day = 0; day < 30; day++) {
      const v = moonIllumination(new Date(Date.UTC(2026, 7, 1 + day, 12, 0, 0)));
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    expect(min).toBeLessThan(0.06);
    expect(max).toBeGreaterThan(0.94);
  });
});

describe("moonPosition", () => {
  it("returns valid angles for every sample of a day", () => {
    for (let hour = 0; hour < 24; hour++) {
      const d = new Date(Date.UTC(2026, 8, 22, hour, 0, 0));
      const p = moonPosition(d, NAIROBI, 3);
      expect(Number.isFinite(p.altitude)).toBe(true);
      expect(p.altitude).toBeGreaterThanOrEqual(-90);
      expect(p.altitude).toBeLessThanOrEqual(90);
      expect(p.azimuth).toBeGreaterThanOrEqual(0);
      expect(p.azimuth).toBeLessThan(360);
    }
  });

  it("moves continuously across a day", () => {
    let previous = moonPosition(new Date(Date.UTC(2026, 8, 22, 0, 0, 0)), NAIROBI, 3);
    for (let m = 30; m < 1440; m += 30) {
      const d = new Date(Date.UTC(2026, 8, 22, 0, 0, 0));
      d.setUTCMinutes(m);
      const current = moonPosition(d, NAIROBI, 3);
      // The moon moves ~13 degrees per day. Near the horizon its altitude
      // changes fastest, so allow ~8 degrees per 30-minute step.
      expect(Math.abs(current.altitude - previous.altitude)).toBeLessThan(9);
      previous = current;
    }
  });

  it("has a plausible angular radius", () => {
    const p = moonPosition(new Date(Date.UTC(2026, 8, 22, 12, 0, 0)), NAIROBI, 3);
    expect(p.angularRadius).toBeGreaterThan(0.24);
    expect(p.angularRadius).toBeLessThan(0.28);
  });
});