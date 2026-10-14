/**
 * Lunar position math.
 *
 * Lower-precision than the solar module — a truncated series good to roughly
 * a degree, which is far beyond what a decorative moon disc needs. Accurate
 * enough for correct phase, altitude, and rough azimuth.
 */

import type { Coordinates, SolarPosition } from "./solar";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function toJulianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

function julianCentury(jd: number): number {
  return (jd - 2451545) / 36525;
}

/**
 * Lunar phase as a 0..1 cycle. 0 = new, 0.25 = first quarter, 0.5 = full,
 * 0.75 = last quarter.
 */
export function moonPhase(date: Date): number {
  const t = julianCentury(toJulianDay(date));

  // Mean elongation of the moon from the sun.
  const d = 297.8501921 + t * (445267.1114034 - t * 0.0018819);
  // Mean anomaly of the sun.
  const m = 357.5291092 + t * (35999.0502909 - t * 0.0001536);
  // Mean anomaly of the moon.
  const mp = 134.9633964 + t * (477198.8675055 + t * 0.0087414);

  const phase =
    d +
    6.289 * Math.sin(mp * DEG) -
    1.274 * Math.sin((2 * d - m) * DEG) +
    0.658 * Math.sin((2 * d) * DEG) -
    0.186 * Math.sin(m * DEG) -
    0.059 * Math.sin((2 * d - 2 * m) * DEG) -
    0.057 * Math.sin((2 * d + mp - 2 * m) * DEG);

  return ((phase / 360) % 1 + 1) % 1;
}

/** Human-readable phase name. */
export function moonPhaseName(date: Date): string {
  const p = moonPhase(date);
  if (p < 0.03 || p > 0.97) return "New Moon";
  if (p < 0.22) return "Waxing Crescent";
  if (p < 0.28) return "First Quarter";
  if (p < 0.47) return "Waxing Gibbous";
  if (p < 0.53) return "Full Moon";
  if (p < 0.72) return "Waning Gibbous";
  if (p < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

/**
 * Illuminated fraction of the moon's disc, 0..1.
 */
export function moonIllumination(date: Date): number {
  const p = moonPhase(date);
  return (1 - Math.cos(p * 2 * Math.PI)) / 2;
}

/**
 * Compute lunar altitude and azimuth.
 *
 * @param timezoneOffsetHours Hours east of UTC. Pass `undefined` to use the
 *   host's local offset so the result matches the visitor's own timezone.
 */
export function moonPosition(
  date: Date,
  coords: Coordinates,
  timezoneOffsetHours?: number,
): SolarPosition {
  const jd = toJulianDay(date);
  const t = julianCentury(jd);

  const l0 = 218.316 + 13.176396 * (jd - 2451545);
  const m = 134.963 + 13.064993 * (jd - 2451545);
  const f = 93.272 + 13.229350 * (jd - 2451545);

  const lambda = l0 + 6.289 * Math.sin(m * DEG);
  const beta = 5.128 * Math.sin(f * DEG);
  const dist = 385001 - 20905 * Math.cos(m * DEG);

  const eclipticLongitude = lambda * DEG;
  const obliquity = 23.4397 * DEG;

  const rightAscension =
    Math.atan2(
      Math.sin(eclipticLongitude) * Math.cos(obliquity) -
        Math.tan(beta * DEG) * Math.sin(obliquity),
      Math.cos(eclipticLongitude),
    ) * RAD;

  const declination =
    Math.asin(
      Math.sin(beta * DEG) * Math.cos(obliquity) +
        Math.cos(beta * DEG) * Math.sin(obliquity) * Math.sin(eclipticLongitude),
    ) * RAD;

  // Greenwich mean sidereal time.
  const gmst = 280.16 + 360.9856235 * (jd - 2451545);

  const offsetHours =
    timezoneOffsetHours ?? -date.getTimezoneOffset() / 60;

  let localSidereal = gmst + coords.longitude + 15 * offsetHours;
  localSidereal = ((localSidereal % 360) + 360) % 360;

  let hourAngle = rightAscension - localSidereal;
  hourAngle = ((hourAngle % 360) + 540) % 360 - 180;

  const zenith =
    Math.acos(
      Math.sin(coords.latitude * DEG) * Math.sin(declination * DEG) +
        Math.cos(coords.latitude * DEG) *
          Math.cos(declination * DEG) *
          Math.cos(hourAngle * DEG),
    ) * RAD;

  const altitude = 90 - zenith;

  const sinZenith = Math.sin(zenith * DEG);
  let azimuth: number;
  if (Math.abs(sinZenith) < 1e-9) {
    azimuth = coords.latitude > 0 ? 180 : 0;
  } else {
    const ratio =
      (Math.sin(coords.latitude * DEG) * Math.cos(zenith * DEG) -
        Math.sin(declination * DEG)) /
      sinZenith;
    const clamped = Math.min(1, Math.max(-1, ratio));
    azimuth =
      hourAngle > 0
        ? (Math.acos(clamped) * RAD + 180) % 360
        : (540 - Math.acos(clamped) * RAD) % 360;
  }

  return {
    altitude,
    azimuth,
    // Angular radius of the moon varies with distance; roughly 0.259 degrees.
    angularRadius: (Math.atan(1737.4 / dist) * RAD),
  };
}