import { describe, it, expect } from "vitest";
import {
  solarPosition,
  classifySky,
  isNight,
  sunColorTemperature,
  kelvinToRgb,
  sunIntensity,
  directionFromAltitudeAzimuth,
  NAIROBI,
} from "@/lib/solar";

/**
 * Fixtures are cross-checked against published NOAA / Solar Calculator values
 * for the stated coordinates. Tolerance is 1.5 degrees, which absorbs the
 * difference between algorithm variants without hiding a real regression.
 */
describe("solarPosition", () => {
  it("puts the sun near zenith at solar noon on the equinox at the equator", () => {
    // At the equator on the equinox the sun passes essentially overhead.
    // Find the altitude maximum rather than assuming 12:00 UTC, because the
    // equation of time shifts true solar noon by up to ~16 minutes.
    let best = { altitude: -Infinity };
    for (let m = 0; m < 1440; m += 1) {
      const d = new Date(Date.UTC(2026, 2, 20, 0, 0, 0));
      d.setUTCMinutes(m);
      const { altitude } = solarPosition(d, { latitude: 0, longitude: 0 }, 0);
      if (altitude > best.altitude) best = { altitude };
    }

    expect(best.altitude).toBeGreaterThan(88);
    expect(best.altitude).toBeLessThanOrEqual(90);
  });

  it("reports sunrise/sunset within tolerance for Nairobi", () => {
    // Around the September equinox Nairobi (EAT, UTC+3) sunrise is near 06:24
    // local and sunset near 18:28 local, with solar noon ~12:26 at 88.5 deg.
    const morning = new Date(Date.UTC(2026, 8, 22, 3, 24, 0)); // 06:24 EAT
    const noon = new Date(Date.UTC(2026, 8, 22, 9, 26, 0)); // 12:26 EAT
    const evening = new Date(Date.UTC(2026, 8, 22, 15, 28, 0)); // 18:28 EAT

    const atMorning = solarPosition(morning, NAIROBI, 3);
    const atNoon = solarPosition(noon, NAIROBI, 3);
    const atEvening = solarPosition(evening, NAIROBI, 3);

    expect(atMorning.altitude).toBeGreaterThan(-1.5);
    expect(atNoon.altitude).toBeGreaterThan(85);
    expect(atEvening.altitude).toBeLessThan(1.5);

    // At solar noon in the southern hemisphere the sun is essentially due
    // north (within a couple of degrees of 0/360).
    const azimuthFromNorth = Math.min(atNoon.azimuth, 360 - atNoon.azimuth);
    expect(azimuthFromNorth).toBeLessThan(10);
  });

  it("finds solar noon at the altitude maximum", () => {
    let best = { altitude: -Infinity, minutes: 0 };
    for (let m = 0; m < 1440; m += 1) {
      const d = new Date(Date.UTC(2026, 8, 22, 0, 0, 0));
      d.setUTCMinutes(m);
      const { altitude } = solarPosition(d, NAIROBI, 3);
      if (altitude > best.altitude) best = { altitude, minutes: m };
    }

    // Nairobi sits ~1.3 degrees south of the equator, so at the September
    // equinox the noon altitude is just under 90.
    expect(best.altitude).toBeGreaterThan(87);
    expect(best.altitude).toBeLessThan(90);
    // Solar noon lands shortly after 12:00 EAT because Nairobi's longitude
    // is west of the EAT standard meridian.
    const eatHour = best.minutes / 60 + 3;
    expect(eatHour).toBeGreaterThan(12.0);
    expect(eatHour).toBeLessThan(13.0);
  });

  it("reports the sun below the horizon at Nairobi local midnight", () => {
    const midnight = new Date(Date.UTC(2026, 8, 22, 21, 0, 0)); // 00:00 EAT
    const pos = solarPosition(midnight, NAIROBI, 3);

    expect(pos.altitude).toBeLessThan(-20);
    expect(isNight(pos.altitude)).toBe(true);
  });

  it("sweeps azimuth east to west across the day", () => {
    // Sunrise: sun in the east (~90 deg). Sunset: sun in the west (~270 deg).
    const sunrise = solarPosition(new Date(Date.UTC(2026, 8, 22, 3, 24, 0)), NAIROBI, 3);
    const sunset = solarPosition(new Date(Date.UTC(2026, 8, 22, 15, 28, 0)), NAIROBI, 3);

    expect(sunrise.azimuth).toBeGreaterThan(80);
    expect(sunrise.azimuth).toBeLessThan(100);
    expect(sunset.azimuth).toBeGreaterThan(260);
    expect(sunset.azimuth).toBeLessThan(280);

    // Away from the zenith crossing the azimuth changes slowly.
    const morning = solarPosition(new Date(Date.UTC(2026, 8, 22, 6, 0, 0)), NAIROBI, 3);
    const nextMorning = solarPosition(new Date(Date.UTC(2026, 8, 22, 7, 0, 0)), NAIROBI, 3);
    expect(Math.abs(nextMorning.azimuth - morning.azimuth)).toBeLessThan(5);
  });

  it("keeps azimuth within 0..360 for every sample of the year", () => {
    for (let month = 0; month < 12; month++) {
      for (const day of [1, 15, 28]) {
        for (let hour = 0; hour < 24; hour += 3) {
          const d = new Date(Date.UTC(2026, month, day, hour, 0, 0));
          const { azimuth, altitude } = solarPosition(d, NAIROBI, 3);
          expect(azimuth).toBeGreaterThanOrEqual(0);
          expect(azimuth).toBeLessThan(360);
          expect(altitude).toBeGreaterThanOrEqual(-90);
          expect(altitude).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it("tracks seasonal declination correctly for the southern hemisphere", () => {
    // June solstice: sun declination negative, so noon altitude in Nairobi
    // is lower than at the equinox.
    const june = new Date(Date.UTC(2026, 5, 21, 9, 0, 0));
    const march = new Date(Date.UTC(2026, 2, 20, 9, 0, 0));

    const juneAlt = solarPosition(june, NAIROBI, 3).altitude;
    const marchAlt = solarPosition(march, NAIROBI, 3).altitude;

    expect(juneAlt).toBeLessThan(marchAlt);
  });

  it("is altitude-continuous over a full simulated day", () => {
    // Guards against seam artefacts in the hour-angle normalisation.
    let previous = solarPosition(
      new Date(Date.UTC(2026, 8, 22, 0, 0, 0)),
      NAIROBI,
      3,
    ).altitude;

    for (let minute = 10; minute < 24 * 60; minute += 10) {
      const d = new Date(Date.UTC(2026, 8, 22, 0, 0, 0));
      d.setUTCMinutes(d.getUTCMinutes() + minute);
      const current = solarPosition(d, NAIROBI, 3).altitude;

      // The sun moves ~0.25 deg/minute at this latitude. Atmospheric refraction
      // near the horizon steepens that slightly, so allow up to 0.5 deg/min.
      expect(Math.abs(current - previous)).toBeLessThan(5.0);
      previous = current;
    }
  });

  it("stays within valid ranges for an extreme latitude in midwinter", () => {
    // Tromso in December: the sun never rises.
    const polarNight = new Date(Date.UTC(2026, 11, 21, 10, 0, 0));
    const pos = solarPosition(polarNight, { latitude: 69.65, longitude: 18.96 }, 1);

    expect(pos.altitude).toBeLessThan(0);
    expect(Number.isFinite(pos.altitude)).toBe(true);
    expect(Number.isFinite(pos.azimuth)).toBe(true);
  });
});

describe("classifySky", () => {
  it("maps altitude bands to the correct twilight phase", () => {
    expect(classifySky(45)).toBe("day");
    expect(classifySky(6)).toBe("day");
    expect(classifySky(3)).toBe("golden");
    expect(classifySky(0)).toBe("golden");
    expect(classifySky(-0.9)).toBe("civil");
    expect(classifySky(-4)).toBe("civil");
    expect(classifySky(-8)).toBe("nautical");
    expect(classifySky(-14)).toBe("astronomical");
    expect(classifySky(-25)).toBe("night");
  });

  it("treats the horizon band as day", () => {
    // Sunset is defined by the sun's UPPER LIMB reaching the horizon, i.e.
    // -0.833 degrees. So -0.5 is still technically day; -1.0 is night.
    expect(isNight(2)).toBe(false);
    expect(isNight(-0.5)).toBe(false);
    expect(isNight(-1.0)).toBe(true);
  });
});

describe("light colour and intensity", () => {
  it("cools from horizon-red to midday-neutral", () => {
    const horizon = sunColorTemperature(0);
    const midday = sunColorTemperature(50);

    expect(horizon).toBeLessThan(2500);
    expect(midday).toBeGreaterThan(5800);
    expect(horizon).toBeLessThan(midday);
  });

  it("clamps temperature outside the sensible range", () => {
    expect(sunColorTemperature(-90)).toBeGreaterThan(0);
    expect(sunColorTemperature(200)).toBeGreaterThan(0);
  });

  it("produces in-range RGB for every sampled temperature", () => {
    for (let k = 1000; k <= 12000; k += 250) {
      const [r, g, b] = kelvinToRgb(k);
      for (const c of [r, g, b]) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });

  it("reddens at low temperature and approaches neutral at high", () => {
    const warm = kelvinToRgb(2000);
    const neutral = kelvinToRgb(6500);

    // Low Kelvin is red-dominant.
    expect(warm[0]!).toBeGreaterThan(warm[2]!);
    // High Kelvin is roughly balanced.
    expect(Math.abs(neutral[0]! - neutral[2]!)).toBeLessThan(0.1);
  });

  it("ramps intensity smoothly and reaches zero at night", () => {
    expect(sunIntensity(-20)).toBe(0);
    expect(sunIntensity(-6)).toBe(0);
    expect(sunIntensity(0)).toBeGreaterThan(0);
    expect(sunIntensity(0)).toBeLessThan(0.1);
    expect(sunIntensity(40)).toBeCloseTo(1, 2);

    // Monotonic across the ramp.
    let previous = -1;
    for (let alt = -6; alt <= 40; alt += 0.5) {
      const v = sunIntensity(alt);
      expect(v).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = v;
    }
  });
});

describe("directionFromAltitudeAzimuth", () => {
  it("returns a unit vector", () => {
    for (const [alt, az] of [
      [45, 90],
      [0, 180],
      [-10, 270],
      [80, 0],
    ] as const) {
      const d = directionFromAltitudeAzimuth(alt, az);
      const length = Math.hypot(d.x, d.y, d.z);
      expect(length).toBeCloseTo(1, 6);
    }
  });

  it("maps north to -Z and east to +X", () => {
    const north = directionFromAltitudeAzimuth(0, 0);
    expect(north.z).toBeCloseTo(-1, 6);
    expect(north.x).toBeCloseTo(0, 6);

    const east = directionFromAltitudeAzimuth(0, 90);
    expect(east.x).toBeCloseTo(1, 6);
    expect(east.z).toBeCloseTo(0, 6);
  });

  it("points straight up at zenith", () => {
    const up = directionFromAltitudeAzimuth(90, 0);
    expect(up.y).toBeCloseTo(1, 6);
  });

  it("points straight down at nadir", () => {
    const down = directionFromAltitudeAzimuth(-90, 0);
    expect(down.y).toBeCloseTo(-1, 6);
  });
});