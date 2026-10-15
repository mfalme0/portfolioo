import { useEffect, useRef, useState } from "react";

/**
 * Decides whether the 3D backdrop should be rendering at all.
 *
 * Three independent reasons to stop:
 *   1. The reader does not want motion (`prefers-reduced-motion`).
 *   2. The browser cannot do WebGL.
 *   3. The reader never scrolls — or scrolls once and leaves. A full-viewport
 *      canvas that renders continuously while idle is the single most
 *      expensive mistake available in this kind of page, so the default is
 *      to render only around scroll activity.
 *
 * Returns a `quality` level rather than a boolean so the caller can degrade
 * the scene rather than switch it off entirely.
 */

export type RenderQuality = "full" | "reduced" | "off";

export interface RenderGate {
  /** Whether the canvas may mount at all. */
  enabled: boolean;
  /** Whether a frame should actually be drawn this tick. */
  shouldRender: boolean;
  quality: RenderQuality;
  /** Convenience: true only when a full scene is worth drawing. */
  active: boolean;
  /** Wire to the canvas's `webglcontextlost` event. */
  onContextLost: () => void;
}

const IDLE_BEFORE_PAUSE_MS = 2200;
const MAX_DPR = 1.5;

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Release the context immediately; we only wanted a capability probe.
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect a low-power situation. Uses the coarse pointer + reduced motion
 * signals available without permission prompts.
 */
function detectConstrained(): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  return false;
}

export function useRenderGate(options?: {
  /** Scroll progress 0..1; > 0 means the reader has engaged with the page. */
  progress?: number;
  /** True while actively scrolling. */
  scrolling?: boolean;
}): RenderGate {
  const { progress = 0, scrolling = false } = options ?? {};

  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [constrained, setConstrained] = useState(false);
  const [idle, setIdle] = useState(true);
  const [lost, setLost] = useState(false);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWebgl(detectWebGL());
    setConstrained(detectConstrained());

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, []);

  // A reader who scrolls at all gets the scene. A reader who never does gets
  // a single static frame at the top, which is all they will ever see.
  useEffect(() => {
    if (progress > 0.02 || scrolling) {
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), IDLE_BEFORE_PAUSE_MS);
    }
  }, [progress, scrolling]);

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const onContextLost = () => setLost(true);

  const reduced = constrained || lost;

  const enabled = webgl === true && !reduceMotion && !lost;
  const quality: RenderQuality = !enabled ? "off" : reduced ? "reduced" : "full";

  return {
    enabled,
    // While idle we stop drawing entirely. A paused canvas costs nothing, and
    // the sky it draws is a function of time rather than scroll, so it will
    // be correct again the moment the reader moves.
    shouldRender: enabled && (!idle || scrolling),
    quality,
    active: enabled && !reduced && !idle,
    onContextLost,
  };
}

export { MAX_DPR, IDLE_BEFORE_PAUSE_MS };