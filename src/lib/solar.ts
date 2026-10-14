/**
 * Solar position math.
 *
 * Implements the NOAA solar position algorithm to derive true sun altitude and
 * azimuth for an arbitrary instant, latitude, and longitude. This module is the
 * single source of truth for "where is the sun" across the whole site:
 *
 *   - Phase 1.5 drives the CSS sky tokens from it
 *   - Phase 1.6 positions the 3D key light and sun/moon discs from it
 *   - Phase 1.7 selects day (beach) vs night (street) scenery from it
 *
 * All angles are in DEGREES at the public boundary; the algorithm works in
 * radians internally. Azimuth is measured clockwise from true north (N=0,
 * E=90, S=180, W=270), which matches the scene's -Z-forward convention.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SolarPosition {
  /** Degrees above the horizon. Negative when the sun has set. */
  altitude: number;
  /** Degrees clockwise from true north. */
  azimuth: number;
  /** Angular radius of the sun's disc in degrees (~0.2665). */
  angularRadius: number;
}

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** Nairobi — the default sky for this portfolio. */
export const NAIROBI: Coordinates = {
  latitude: -1.2864,
  longitude: 36.8172,
};

/** Names of the twilight bands used to classify the sky. */
export type SkyPhase =
  | "night"
  | "astronomical"
  | "nautical"
  | "civil"
  | "golden"
  | "day";

/**
 * Solar depression thresholds, in degrees below the horizon.
 * Standard astronomical definitions.
 */
const SOLAR_DEPRESSION = {
  /** Sun's upper limb touching horizon. Sunrise/sunset proper. */
  sunUpperLimb: -0.833,
  /** Civil twilight — horizon visible, brightest stars appear. */
  civil: -6,
  /** Nautical twilight. */
  nautical: -12,
  /** Astronomical twilight — sun illuminates the sky but no visible gradient. */
  astronomical: -18,
} as const;

function toJulianDay(date: Date): number {
  // Unix epoch (1970-01-01T00:00:00Z) is JD 2440587.5
  return date.getTime() / 86_400_000 + 2440587.5;
}

/**
 * Julian centuries since J2000.0.
 */
function julianCentury(julianDay: number): number {
  return (julianDay - 2451545) / 36525;
}

/**
 * Geometric mean longitude of the sun, degrees.
 */
function geometricMeanLongitude(t: number): number {
  const l0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  return ((l0 % 360) + 360) % 360;
}

/**
 * Geometric mean anomaly of the sun, degrees.
 */
function geometricMeanAnomaly(t: number): number {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
}

/**
 * Eccentricity of Earth's orbit (dimensionless, near 0.0167).
 */
function eccentricityOfEarthOrbit(t: number): number {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

/**
 * Equation of centre, degrees.
 */
function equationOfCentre(t: number): number {
  const m = geometricMeanAnomaly(t) * DEG;
  const e = eccentricityOfEarthOrbit(t);
  return (
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289
  );
}

/**
 * Sun's true longitude, degrees.
 */
function sunTrueLongitude(t: number): number {
  return (
    geometricMeanLongitude(t) + equationOfCentre(t)
  );
}

/**
 * Sun's apparent longitude (corrected for nutation and aberration), degrees.
 */
function sunApparentLongitude(t: number): number {
  const o = sunTrueLongitude(t);
  const omega = 125.04 - 1934.136 * t;
  return o - 0.00569 - 0.00478 * Math.sin(omega * DEG);
}

/**
 * Mean obliquity of the ecliptic, degrees.
 */
function meanObliquityOfEcliptic(t: number): number {
  const seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  return 23 + (26 + seconds / 60) / 60;
}

/**
 * Obliquity correction, degrees.
 */
function obliquityCorrection(t: number): number {
  const omega = 125.04 - 1934.136 * t;
  return (
    meanObliquityOfEcliptic(t) + 0.00256 * Math.cos(omega * DEG)
  );
}

/**
 * Sun's declination, degrees. Negative in the southern hemisphere.
 */
function sunDeclination(t: number): number {
  const e = obliquityCorrection(t);
  const lambda = sunApparentLongitude(t) * DEG;
  return Math.asin(Math.sin(e * DEG) * Math.sin(lambda)) * RAD;
}

/**
 * Equation of time, minutes.
 */
function equationOfTime(t: number): number {
  const epsilon = obliquityCorrection(t);
  const l0 = geometricMeanLongitude(t);
  const e = eccentricityOfEarthOrbit(t);
  const m = geometricMeanAnomaly(t);

  const y = Math.tan((epsilon / 2) * DEG) ** 2;

  const eTime =
    y * Math.sin(2 * l0 * DEG) -
    2 * e * Math.sin(m * DEG) +
    4 * e * y * Math.sin(m * DEG) * Math.cos(2 * l0 * DEG) -
    0.5 * y * y * Math.sin(4 * l0 * DEG) -
    1.25 * e * e * Math.sin(2 * m * DEG);

  return eTime * RAD * 4;
}

/**
 * Atmospheric refraction correction in degrees for a given true elevation.
 * Accounts for the fact that the atmosphere lifts the apparent sun, most
 * noticeably near the horizon. Returns a larger correction at low elevation.
 */
function refraction(altitude: number): number {
  if (altitude > 85) return 0;

  const tanAlt = Math.tan(altitude * DEG);
  let correction: number;

  if (altitude > 5) {
    correction =
      58.1 / tanAlt -
      0.07 / tanAlt ** 3 +
      0.000086 / tanAlt ** 5;
  } else if (altitude > -0.575) {
    correction =
      1735 +
      altitude * (-518.2 + altitude * (103.4 + altitude * (-12.79 + altitude * 0.711)));
  } else {
    correction = -20.772 / tanAlt;
  }

  return correction / 3600;
}

/**
 * Compute solar altitude and azimuth.
 *
 * @param date  Instant to evaluate.
 * @param coords Observer location. Defaults to Nairobi.
 * @param timezoneOffsetHours  Hours east of UTC (e.g. 3 for EAT). Pass
 *   `undefined` to use the host's local offset, which is what you want for a
 *   visitor's own timezone.
 */
export function solarPosition(
  date: Date,
  coords: Coordinates = NAIROBI,
  timezoneOffsetHours?: number,
): SolarPosition {
  const jd = toJulianDay(date);
  const t = julianCentury(jd);

  const declination = sunDeclination(t);

  // Offset the "true solar time" from civil time. If the caller does not
  // specify an offset, derive it from the Date itself so the result is correct
  // in whatever timezone the visitor is actually in.
  const offsetHours =
    timezoneOffsetHours ?? -date.getTimezoneOffset() / 60;

  // Minutes past UTC midnight. Derived from the Date's own UTC fields rather
  // than from the Julian day number: `jd * 24` is ~59 million, so taking its
  // fractional part loses precision at midnight boundaries.
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;

  // NOAA: TST = localClockMinutes + eqTime + 4*longitude - 60*utcOffset.
  // Substituting localClock = utcMinutes + 60*offsetHours, the offset terms
  // cancel exactly — solar position is a function of absolute UTC time and
  // longitude alone. Timezone is a display concern, not an astronomy one.
  // `offsetHours` is retained in the signature so callers can be explicit and
  // so the intent stays legible, but it does not affect the result.
  void offsetHours;

  let trueSolarTimeMinutes = utcMinutes + equationOfTime(t) + 4 * coords.longitude;
  trueSolarTimeMinutes = ((trueSolarTimeMinutes % 1440) + 1440) % 1440;

  // Hour angle in degrees: 15 degrees of rotation per hour of solar time.
  let hourAngle = trueSolarTimeMinutes / 4 - 180;

  // Keep hour angle in [-180, 180].
  if (hourAngle < -180) hourAngle += 360;
  if (hourAngle > 180) hourAngle -= 360;

  const zenith =
    Math.acos(
      Math.sin(coords.latitude * DEG) * Math.sin(declination * DEG) +
        Math.cos(coords.latitude * DEG) *
          Math.cos(declination * DEG) *
          Math.cos(hourAngle * DEG),
    ) * RAD;

  // True (unrefracted) altitude.
  const trueAltitude = 90 - zenith;

  // Apply refraction so the sun sets when it visually should.
  const altitude = trueAltitude + refraction(trueAltitude);

  // Azimuth, clockwise from north.
  let azimuth: number;
  const sinZenith = Math.sin(zenith * DEG);
  if (Math.abs(sinZenith) < 1e-9) {
    azimuth = coords.latitude > 0 ? 180 : 0;
  } else {
    const cosZenith = Math.cos(zenith * DEG);
    const ratio = (Math.sin(coords.latitude * DEG) * cosZenith - Math.sin(declination * DEG)) / sinZenith;
    const clamped = Math.min(1, Math.max(-1, ratio));

    azimuth = hourAngle > 0
      ? (Math.acos(clamped) * RAD + 180) % 360
      : (540 - Math.acos(clamped) * RAD) % 360;
  }

  return {
    altitude,
    azimuth,
    angularRadius: 0.2665,
  };
}

/**
 * Classify the sky into a phase band.
 */
export function classifySky(altitude: number): SkyPhase {
  if (altitude < SOLAR_DEPRESSION.astronomical) return "night";
  if (altitude < SOLAR_DEPRESSION.nautical) return "astronomical";
  if (altitude < SOLAR_DEPRESSION.civil) return "nautical";
  if (altitude < SOLAR_DEPRESSION.sunUpperLimb) return "civil";
  if (altitude < 6) return "golden";
  return "day";
}

/** True when the sun is below the horizon (or at the very edge of it). */
export function isNight(altitude: number): boolean {
  return altitude < SOLAR_DEPRESSION.sunUpperLimb;
}

/**
 * Sun's colour temperature in Kelvin, interpolated across the day.
 *
 * Low sun is heavily reddened by atmospheric path length (~2000K at the
 * horizon); midday sun is roughly 6500K. This single curve is what sells
 * "real lighting" more than any geometry choice.
 */
export function sunColorTemperature(altitude: number): number {
  const clamped = Math.max(-6, Math.min(60, altitude));
  // Normalised 0 at the horizon rising to 1 at high altitude.
  const t = (clamped + 6) / 66;
  return Math.round(1900 + t * (6500 - 1900));
}

/**
 * Convert Kelvin colour temperature to a linear RGB triple in 0..1.
 * Tanner Helland's approximation — adequate for a directional light colour.
 */
export function kelvinToRgb(kelvin: number): [number, number, number] {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * (t - 60) ** -0.1332047592;
    g = 288.1221695283 * (t - 60) ** -0.0755148492;
  }

  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  const clamp = (v: number) => Math.min(255, Math.max(0, v)) / 255;
  return [clamp(r), clamp(g), clamp(b)];
}

/**
 * Sunlight intensity 0..1, falling off below the horizon.
 */
export function sunIntensity(altitude: number): number {
  if (altitude <= SOLAR_DEPRESSION.civil) return 0;
  const t = Math.min(1, Math.max(0, (altitude - SOLAR_DEPRESSION.civil) / 40));
  // Smoothstep so dawn ramps rather than switching on.
  return t * t * (3 - 2 * t);
}

/**
 * Unit vector for a given altitude/azimuth, in the scene's coordinate frame.
 *
 * Convention: +Y is up, -Z is north, +X is east. Azimuth is clockwise from
 * north, matching {@link solarPosition}.
 */
export function directionFromAltitudeAzimuth(
  altitude: number,
  azimuth: number,
): { x: number; y: number; z: number } {
  const altRad = altitude * DEG;
  const azRad = azimuth * DEG;
  const cosAlt = Math.cos(altRad);
  return {
    x: cosAlt * Math.sin(azRad),
    y: Math.sin(altRad),
    // North is -Z, so the north component is -cos(az) * cos(alt).
    z: -cosAlt * Math.cos(azRad),
  };
}