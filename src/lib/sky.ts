import type { Coordinates } from "./solar";
import {
  classifySky,
  kelvinToRgb,
  solarPosition,
  sunColorTemperature,
  sunIntensity,
  NAIROBI,
} from "./solar";
import { moonPosition } from "./moon";

export type SceneMood = "beach" | "street";

export interface SkyState {
  /** Twilight band. */
  phase: ReturnType<typeof classifySky>;
  /** Sun altitude in degrees. */
  altitude: number;
  /** Sun azimuth in degrees clockwise from north. */
  azimuth: number;
  /** 0..1 directional light strength. */
  intensity: number;
  /** Sunlight colour temperature in Kelvin. */
  temperature: number;
  /** Sunlight colour as hex, ready for CSS. */
  lightColor: string;
  /** CSS-ready gradient stops, zenith -> horizon -> ground. */
  zenith: string;
  mid: string;
  horizon: string;
  ground: string;
  /** Text colour guaranteed to contrast with the sky. */
  foreground: string;
  /** Muted foreground for secondary text. */
  foregroundMuted: string;
  /**
   * Foreground for text placed over the horizon band. Separate from
   * `foreground` because the horizon can be bright amber at golden hour while
   * the mid sky is still dark enough to want white text.
   */
  foregroundHorizon: string;
  /** 0..1 star opacity. */
  starOpacity: number;
  /** Which scenery the descent passes through. */
  mood: SceneMood;
  /** True when the scene is dark enough to need light surfaces. */
  isDark: boolean;
  /** Sun/moon disc screen position as a fraction of viewport width/height. */
  disc: { x: number; y: number };
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const to = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/**
 * Sky gradient keyframes, indexed by sun altitude.
 *
 * Real skies do not change linearly. These stops are placed at the altitudes
 * where the sky actually does something: the -6 civil-twilight boundary is a
 * sharp visual cliff, golden hour is a narrow band just above the horizon,
 * and the zenith-vs-horizon split widens dramatically once the sun is high.
 */
const SKY_KEYFRAMES: Array<{
  altitude: number;
  zenith: string;
  mid: string;
  horizon: string;
  ground: string;
}> = [
  { altitude: -18, zenith: "#04060F", mid: "#070B1A", horizon: "#0B1226", ground: "#05070E" },
  { altitude: -12, zenith: "#070C1C", mid: "#0E1730", horizon: "#16213F", ground: "#070A14" },
  { altitude: -6, zenith: "#101C3C", mid: "#1E2C55", horizon: "#2B3E6B", ground: "#0A0E1B" },
  { altitude: -3, zenith: "#1A2A52", mid: "#33436F", horizon: "#5A5A82", ground: "#12121F" },
  { altitude: 0, zenith: "#26406F", mid: "#5C5A85", horizon: "#C4703C", ground: "#2A1B18" },
  { altitude: 4, zenith: "#2F5591", mid: "#6E7FA8", horizon: "#E89A4A", ground: "#3A2A1E" },
  { altitude: 12, zenith: "#2F6BB5", mid: "#5E9BD4", horizon: "#BCD9F2", ground: "#6B5B44" },
  { altitude: 35, zenith: "#2A6FD0", mid: "#4E9BE4", horizon: "#A8D4F5", ground: "#9A876A" },
  { altitude: 70, zenith: "#1F63CC", mid: "#3D8FE0", horizon: "#8CC7F2", ground: "#B5A183" },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ] as [number, number, number];
}

/** Parse `#rrggbb` into `r g b` for use in a CSS `color-mix` or rgba. */
function hexToRgbString(hex: string, alpha = 1): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${alpha})`;
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const out = [
    Math.round((r1 + (r2 - r1) * t) * 255),
    Math.round((g1 + (g2 - g1) * t) * 255),
    Math.round((b1 + (b2 - b1) * t) * 255),
  ];
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Sample the sky gradient at a given sun altitude, interpolating between
 * keyframes. Extrapolates using the end keyframes outside the defined range.
 */
function sampleGradient(altitude: number) {
  const first = SKY_KEYFRAMES[0]!;
  const last = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1]!;

  if (altitude <= first.altitude) return first;
  if (altitude >= last.altitude) return last;

  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    const lo = SKY_KEYFRAMES[i]!;
    const hi = SKY_KEYFRAMES[i + 1]!;
    if (altitude >= lo.altitude && altitude <= hi.altitude) {
      const t = (altitude - lo.altitude) / (hi.altitude - lo.altitude);
      return {
        altitude,
        zenith: mixHex(lo.zenith, hi.zenith, t),
        mid: mixHex(lo.mid, hi.mid, t),
        horizon: mixHex(lo.horizon, hi.horizon, t),
        ground: mixHex(lo.ground, hi.ground, t),
      };
    }
  }
  return last;
}

/**
 * Perceived luminance of a hex colour, 0..1 (sRGB relative luminance).
 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Pick a foreground that meets WCAG AA against a background.
 *
 * Choosing between pure black and pure white is not sufficient. Around a
 * relative luminance of ~0.18 — the mid-sky blue at golden hour — neither
 * reaches 4.5:1: white gives ~4.4 and black gives ~4.35. The crossover band
 * where both fail is exactly where the sky sits twice a day. Using true black
 * closes the gap entirely, so no blending fallback is needed.
 */

function contrastRatioWith(foreground: string, background: string): number {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * The dark foreground. This must be pure black, not a lifted "ink" tone.
 *
 * The reason is arithmetic. White clears AA whenever the background
 * luminance L <= 0.1833, and black clears AA whenever L >= 0.175. Those two
 * bands overlap, so between them *every* possible luminance is reachable by
 * one or the other — but only with true black. A near-black like #08090C
 * sits at luminance 0.003, which lowers its contrast ratio by enough to
 * create a gap at L ~= 0.183 where both options fall just short of 4.5:1.
 * That gap is exactly where the midday-to-golden-hour sky sits.
 */
const DARKSIDE = "#000000";
const LIGHTSIDE = "#FFFFFF";

/**
 * A single foreground cannot serve both the mid sky and the horizon.
 *
 * At golden hour the mid is a mid-dark blue (wants white text) while the
 * horizon is bright amber (wants black text). Forcing one value for both
 * fails badly — white on amber measures 2.6:1.
 *
 * So the contrast-critical pair is resolved against the *mid* sky, which is
 * what the hero copy actually sits on, and the horizon gets its own value for
 * anything placed over it. Anything spanning both needs a scrim, which is
 * what `.scrim-panel` is for.
 */
function readableForeground(background: string): string {
  const withWhite = contrastRatioWith(LIGHTSIDE, background);
  const withBlack = contrastRatioWith(DARKSIDE, background);

  // The bands overlap, so one of these always wins.
  return withWhite >= withBlack ? LIGHTSIDE : DARKSIDE;
}

/**
 * Secondary text still has to meet AA — it is used for real content, not
 * decoration.
 *
 * Candidates are scored against the actual background and the best-scoring
 * one that clears the threshold wins. Choosing a muted tone by "looks right
 * against dark skies" is what let a near-black grey land on a near-black sky
 * at 1.07:1 in an earlier version of this function.
 */
function mutedForeground(background: string): string {
  const candidates = [
    "#E6E9EF",
    "#D4D8E0",
    "#C3C8D2",
    "#B4BAC6",
    "#5A6270",
    "#3A3F4A",
    "#22262E",
  ];

  let best = LIGHTSIDE;
  let bestRatio = contrastRatioWith(LIGHTSIDE, background);

  for (const candidate of candidates) {
    const ratio = contrastRatioWith(candidate, background);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }

  return bestRatio >= 4.5 ? best : readableForeground(background);
}

/** How dark the scene is, 0 (bright day) .. 1 (deep night). */
function darkness(altitude: number): number {
  if (altitude >= 20) return 0;
  if (altitude <= -12) return 1;
  const t = (20 - altitude) / 32;
  return Math.min(1, Math.max(0, t));
}

/**
 * Compute the complete sky state for a moment in time.
 *
 * This is the single function the CSS layer, the 3D scene, and the scenery
 * selection all read from. Keeping it pure and in one place is what stops
 * the layers from disagreeing about what time it is.
 */
export function computeSkyState(
  date: Date,
  coords: Coordinates = NAIROBI,
): SkyState {
  const sun = solarPosition(date, coords);
  const gradient = sampleGradient(sun.altitude);
  const temperature = sunColorTemperature(sun.altitude);
  const intensity = sunIntensity(sun.altitude);
  const isDark = sun.altitude < -0.833;

  const starOpacity = Math.min(1, Math.max(0, (-sun.altitude - 4) / 12));

  // The visible disc is the sun by day, the moon by night.
  const moon = moonPosition(date, coords);
  const discAltitude = isDark ? moon.altitude : sun.altitude;
  const discAzimuth = isDark ? moon.azimuth : sun.azimuth;

  // Project the disc onto the viewport. Azimuth 90 (east) maps to the right,
  // 270 (west) to the left — matching a viewer facing south, which is where
  // the sun sits at Nairobi's latitude.
  const horizontal = ((discAzimuth - 180) / 180) * 0.5 + 0.5;
  const vertical = 0.5 - (Math.max(-15, Math.min(75, discAltitude)) / 90) * 0.62;

  return {
    phase: classifySky(sun.altitude),
    altitude: sun.altitude,
    azimuth: sun.azimuth,
    intensity,
    temperature,
    lightColor: rgbToHex(kelvinToRgb(temperature)),
    zenith: gradient.zenith,
    mid: gradient.mid,
    horizon: gradient.horizon,
    ground: gradient.ground,
    foreground: readableForeground(gradient.mid),
    foregroundMuted: mutedForeground(gradient.mid),
    foregroundHorizon: readableForeground(gradient.horizon),
    starOpacity,
    mood: isDark ? "street" : "beach",
    isDark,
    disc: {
      x: Math.min(1, Math.max(0, horizontal)),
      y: Math.min(0.85, Math.max(0.05, vertical)),
    },
  };
}

/**
 * Push sky state into CSS custom properties on an element.
 *
 * Runs before paint so there is no flash of the wrong sky.
 */
export function applySkyState(root: HTMLElement, state: SkyState): void {
  const s = root.style;
  s.setProperty("--sky-zenith", state.zenith);
  s.setProperty("--sky-mid", state.mid);
  s.setProperty("--sky-horizon", state.horizon);
  s.setProperty("--sky-ground", state.ground);
  s.setProperty("--sky-fg", state.foreground);
  s.setProperty("--sky-fg-muted", state.foregroundMuted);
  s.setProperty("--sky-fg-horizon", state.foregroundHorizon);
  s.setProperty("--sky-light", state.lightColor);
  s.setProperty("--sky-light-intensity", String(state.intensity));
  s.setProperty("--sky-temperature", `${state.temperature}K`);
  s.setProperty("--sky-star-opacity", String(state.starOpacity));
  s.setProperty("--sky-disc-x", `${(state.disc.x * 100).toFixed(2)}%`);
  s.setProperty("--sky-disc-y", `${(state.disc.y * 100).toFixed(2)}%`);
  s.setProperty("--sky-darkness", darkness(state.altitude).toFixed(3));
  s.setProperty("--sky-phase", state.phase);
  s.setProperty("--sky-mood", state.mood);
  s.setProperty("--sky-sun-altitude", `${state.altitude.toFixed(2)}deg`);
  s.setProperty("--sky-scrim", hexToRgbString(state.mid, 0.55));
}

export { darkness, readableForeground, luminance };