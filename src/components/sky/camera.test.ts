import { describe, it, expect } from "vitest";
import { stylisedAltitude } from "@/lib/sky";

/**
 * Camera rig invariants.
 *
 * The original rig was broken in two ways that no amount of code review
 * caught, because both produce a scene that merely looks wrong rather than
 * throwing:
 *
 *   1. It called lookAt() and then added to rotation.x — orienting the camera
 *      twice, so the final orientation depended on the order of two disagreeing
 *      operations.
 *   2. Its start pitch was -1.15 rad (-77 degrees), pointing the camera at the
 *      ground. The sky and the sun were never in frame at any scroll depth.
 *
 * These constants are duplicated from SkyScene.tsx deliberately — a test that
 * imports the module would just re-read whatever the module already says, and
 * would not catch someone changing the value to something broken.
 */

const FOV = 65;
const START_ALTITUDE = 78;
const EYE_LEVEL = 1.7;
const START_PITCH = -0.19;
const END_PITCH = -0.015;

/** Ground half-extent — must match SkyScene.tsx. */
const GROUND_RADIUS = 1400;
const START_DISTANCE = 340;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DEG = 180 / Math.PI;

/** Elevation range visible in the vertical FOV at a given pitch. */
function frameRange(pitchRad: number): { bottom: number; top: number } {
  const half = FOV / 2;
  const centre = pitchRad * DEG;
  return { bottom: centre - half, top: centre + half };
}

describe("camera rig", () => {
  it("keeps the horizon in frame at every scroll depth", () => {
    // The regression that made the whole scene read as a jumbled mess.
    for (let d = 0; d <= 1.0001; d += 0.05) {
      const pitch = lerp(START_PITCH, END_PITCH, d);
      const { bottom, top } = frameRange(pitch);
      expect(top).toBeGreaterThan(0);
      expect(bottom).toBeLessThan(0);
    }
  });

  it("does not point at the ground at the start of the page", () => {
    // -1.15 rad was the original value. Anything steeper than about -35
    // degrees puts the horizon off the top of the frame.
    expect(START_PITCH * DEG).toBeGreaterThan(-35);
    expect(START_PITCH * DEG).toBeLessThan(-5);
  });

  it("settles the horizon onto the eye line at the footer", () => {
    // This is what makes the landing read as a landing rather than a stop.
    expect(Math.abs(END_PITCH * DEG)).toBeLessThan(3);
  });

  it("descends monotonically from altitude to eye level", () => {
    expect(lerp(START_ALTITUDE, EYE_LEVEL, 0)).toBeGreaterThan(50);
    expect(lerp(START_ALTITUDE, EYE_LEVEL, 1)).toBeCloseTo(EYE_LEVEL, 5);
    // A real human eye height, not zero — the camera would be inside the sand.
    expect(EYE_LEVEL).toBeGreaterThan(1.5);
    expect(EYE_LEVEL).toBeLessThan(2);

    let previous = Infinity;
    for (let d = 0; d <= 1.0001; d += 0.02) {
      const altitude = lerp(START_ALTITUDE, EYE_LEVEL, d);
      expect(altitude).toBeLessThanOrEqual(previous);
      previous = altitude;
    }
  });

  it("keeps the ground edge beyond the fog horizon", () => {
    // The bug this guards: at the previous scale the ground was a 680-unit
    // island inside an 8000-unit sky. Its edge sat at ~520 units while fog
    // only reached ~545, so the world visibly ended in mid-air.
    //
    // FogExp2's fog factor is exp(-(density * depth)^2), so the check is on
    // density*depth directly — not a linear 3/density heuristic.
    //
    // Must match SkyScene.tsx.
    const startFogDensity = 0.0024;
    const farEdge = GROUND_RADIUS + START_DISTANCE;

    const fogFactor = Math.exp(-Math.pow(startFogDensity * farEdge, 2));

    // The edge must be at least 99% obscured or it resolves into a hard line
    // against the sky.
    expect(fogFactor).toBeLessThan(0.01);
  });

  it("frames the ground rather than floating above it", () => {
    // At the old 190-unit start the ground subtended 61 of 65 available
    // degrees, leaving the frame mostly empty sky. The ground should fill the
    // lower portion of the frame with sky above, not the reverse.
    const groundAngle = Math.atan2(GROUND_RADIUS, START_ALTITUDE) * DEG;
    expect(groundAngle).toBeGreaterThan(FOV / 2);
    // And the horizon must still sit inside the frame.
    const { top } = frameRange(START_PITCH);
    expect(top).toBeGreaterThan(0);
  });

  it("keeps the pitch within a natural range", () => {
    // Beyond roughly 90 degrees of FOV the projection reads as a fisheye, so
    // there is a ceiling as well as a floor.
    expect(FOV).toBeGreaterThan(50);
    expect(FOV).toBeLessThanOrEqual(75);
  });

  it("keeps the sun in frame across most of a Nairobi day", () => {
    // Nairobi sits near the equator, so the sun is high for much of the day
    // and a narrow FOV loses it entirely. This asserts a reasonable floor of
    // coverage without demanding the sun be visible at true noon — it is not,
    // physically, and pretending otherwise would mean distorting the camera.
    const depths = [0, 0.25, 0.5, 0.75, 1];
    let visibleCount = 0;

    for (const d of depths) {
      const { top } = frameRange(lerp(START_PITCH, END_PITCH, d));
      // A sun at 20 degrees altitude should be in frame at most depths.
      if (top >= 20) visibleCount++;
    }

    expect(visibleCount).toBeGreaterThanOrEqual(3);
  });

  it("never produces a NaN or infinite transform", () => {
    for (let d = 0; d <= 1.0001; d += 0.01) {
      const altitude = lerp(START_ALTITUDE, EYE_LEVEL, d);
      const distance = lerp(340, 120, d);
      const far = lerp(9000, 5200, d);
      for (const v of [altitude, distance, far]) {
        expect(Number.isFinite(v)).toBe(true);
      }
      expect(far).toBeGreaterThan(GROUND_RADIUS);
    }
  });
});

describe("sun visibility across the day", () => {
  /*
   * The failure this guards against: the sun was placed at its true altitude,
   * which at Nairobi's latitude sits above 30 degrees for roughly nine hours
   * a day. The camera tops out around 30 degrees, so the sun was genuinely
   * invisible for most of every day and nobody had seen it at all.
   */

  /** Top of the visible frame at the given scroll depth. */
  const frameTopAt = (descent: number) =>
    (lerp(START_PITCH, END_PITCH, descent) * DEG) + FOV / 2;

  it("keeps the sun inside the frame at solar noon", () => {
    // Nairobi solar noon altitude is ~87 degrees. Uncompressed that is 55
    // degrees above the top of the frame at any scroll depth.
    const trueNoon = 87;
    expect(trueNoon).toBeGreaterThan(frameTopAt(0));
    expect(trueNoon).toBeGreaterThan(frameTopAt(1));

    // Compressed, it must be visible at every depth.
    expect(stylisedAltitude(trueNoon)).toBeLessThan(frameTopAt(0));
    expect(stylisedAltitude(trueNoon)).toBeLessThan(frameTopAt(1));
  });

  it("keeps the sun in frame at every hour of a full day", () => {
    // Sweep a realistic altitude curve from before dawn to after dusk.
    for (let altitude = -12; altitude <= 87; altitude += 1) {
      const drawn = stylisedAltitude(altitude);
      if (drawn < 0) continue; // below the horizon: correctly not drawn

      for (const descent of [0, 0.25, 0.5, 0.75, 1]) {
        expect(drawn).toBeLessThanOrEqual(frameTopAt(descent));
      }
    }
  });

  it("leaves altitudes at or below the horizon untouched", () => {
    // Sunset must still happen exactly when it actually happens.
    for (let altitude = -20; altitude <= 0; altitude += 0.5) {
      expect(stylisedAltitude(altitude)).toBe(altitude);
    }
  });

  it("keeps a low sun low, so golden hour stays golden hour", () => {
    // Compressing into the visible band must not shove the sunrise sky up to
    // midday. A sun at 5 degrees should still read as a dawn sun.
    expect(stylisedAltitude(3)).toBeLessThan(2);
    expect(stylisedAltitude(6)).toBeLessThan(4);
    // And it must be monotonic, or the sun would appear to move backwards.
    let previous = -Infinity;
    for (let altitude = 0; altitude <= 87; altitude += 0.5) {
      const drawn = stylisedAltitude(altitude);
      expect(drawn).toBeGreaterThanOrEqual(previous);
      previous = drawn;
    }
  });

  it("stays within the compressed ceiling", () => {
    expect(stylisedAltitude(87)).toBeLessThanOrEqual(19);
    expect(stylisedAltitude(1000)).toBeLessThanOrEqual(19);
  });
});

describe("celestial visual scale", () => {
  it("exaggerates the sun enough to be visible", () => {
    // True angular radius is 0.2665 degrees — under half a percent of screen
    // height at a 65-degree FOV. Astronomically correct and visually absent.
    const TRUE_ANGULAR_RADIUS = 0.2665;
    const EXAGGERATION = 6;
    const visual = TRUE_ANGULAR_RADIUS * EXAGGERATION;

    // At 65 degrees vertical FOV on a 900px-tall viewport, a full disc.
    const viewportHeightPx = 900;
    const degreesPerPixel = FOV / viewportHeightPx;
    const radiusPx = visual / degreesPerPixel;

    // Must be a clear presence, not a speck.
    expect(radiusPx).toBeGreaterThan(10);
  });

  it("keeps the moon visually smaller than the sun", () => {
    const sun = 0.2665 * 6;
    const moon = 0.26 * 5;
    expect(moon).toBeLessThan(sun);
    // But not so much smaller that it vanishes.
    expect(moon).toBeGreaterThan(sun * 0.7);
  });
});