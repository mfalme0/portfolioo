import { useId } from "react";
import type { Repo } from "@/data/repos.generated";
import { languageColor } from "@/lib/languages";

/**
 * Generated project artwork.
 *
 * Each project gets a deterministic abstract cover derived from its own
 * metadata — no stock screenshots, no generic gradient blobs. The pattern is
 * seeded from the repo name so it is stable across builds and never
 * mismatches between server and client.
 *
 * Rendered as an inline SVG rather than an image so it costs no network
 * request, scales to any density, and stays sharp on any display.
 */

/**
 * Per-project accent hues. Chosen to sit beside the site accent without
 * competing with it — the lime stays reserved for interaction states.
 */
const ACCENTS: Record<string, [string, string]> = {
  nexus: ["#3DF5D0", "#1E7F8C"],
  "resu-clean": ["#C8FF4D", "#5A8F1F"],
  kifaru: ["#FFB067", "#B35A1F"],
  atlas: ["#8BA7FF", "#3A4F9E"],
  "neo-learn": ["#C4A7FF", "#6B4BA8"],
  "mfalme0-GSI": ["#FF8FA3", "#A83E56"],
  "open-zengee": ["#7FE8C4", "#2C8468"],
};

/** Fallback derived from the primary language colour. */
function accentsFor(repo: Repo): [string, string] {
  const known = ACCENTS[repo.name];
  if (known) return known;

  const base = languageColor(repo.language ?? null);
  return [base, "#0B1226"];
}

/** Stable string hash so the pattern never shifts between renders. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function RepoArtwork({ repo }: { repo: Repo }) {
  const [from, to] = accentsFor(repo);
  const seed = hash(repo.name);
  const rand = mulberry32(seed);

  // Gradient ids are namespaced per instance. Hashing the name alone means two
  // cards for the same repo would share <defs> ids, and the second would
  // silently render using the first one's gradients.
  //
  // useId rather than a module counter: a counter produces different ids on
  // the server and the client depending on render order, which is a
  // hydration mismatch. useId is stable across both.
  const instanceId = useId();
  const id = `art-${seed.toString(36)}${instanceId.replace(/:/g, "")}`;

  // A handful of rings, positioned from the seed. More than a dozen turns to
  // visual noise at card size.
  const rings = Array.from({ length: 5 }, (_, i) => ({
    cx: 40 + rand() * 220,
    cy: 30 + rand() * 100,
    r: 18 + rand() * 52,
    opacity: 0.12 + rand() * 0.22,
    width: 1 + rand() * 1.6,
    index: i,
  }));

  const bars = Array.from({ length: 7 }, (_, i) => ({
    x: 24 + i * 40,
    h: 20 + rand() * 70,
  }));

  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full w-full"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0C1018" />
          <stop offset="100%" stopColor={to} stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.75" cy="0.15" r="0.8">
          <stop offset="0%" stopColor={from} stopOpacity="0.35" />
          <stop offset="100%" stopColor={from} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#${id}-bg)`} />
      <rect width="320" height="180" fill={`url(#${id}-glow)`} />

      {/* Concentric rings — reads as a signal or a target. */}
      {rings.map((ring) => (
        <circle
          key={ring.index}
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth={ring.width}
          opacity={ring.opacity}
        />
      ))}

      {/* Signal bars, like a level meter. */}
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={160 - bar.h}
          width="18"
          height={bar.h}
          rx="4"
          fill={from}
          opacity={0.14 + (i / bars.length) * 0.3}
        />
      ))}

      {/* A single diagonal to give the composition a direction. */}
      <line
        x1="0"
        y1="180"
        x2="320"
        y2="0"
        stroke={`url(#${id}-stroke)`}
        strokeWidth="1"
        opacity="0.16"
      />
    </svg>
  );
}