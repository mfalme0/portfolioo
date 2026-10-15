import { useEffect, useRef, useState } from "react";

/**
 * Tracks how far the reader has descended through the page, normalised 0..1.
 *
 * This is the single input that drives the camera in the 3D backdrop. It is
 * deliberately *not* per-section — one continuous value across the whole
 * document is what makes the descent read as one movement rather than a
 * series of disconnected effects.
 *
 * Performance: the handler writes to a CSS custom property and updates React
 * state at most once per frame. It never reads layout during scroll, and never
 * triggers a React re-render per event.
 */

export interface ScrollProgress {
  /** Normalised page progress, 0 at the top, 1 at the footer. */
  progress: number;
  /** Eased altitude — fast early, settling as it approaches ground level. */
  descent: number;
  /** True while the reader is actively scrolling. */
  scrolling: boolean;
  /** Attach a ref to the element whose progress should be measured. */
  scrollRef: React.RefObject<HTMLElement | null>;
}

const IDLE_DELAY_MS = 140;

/**
 * Easing that makes the descent land rather than stop.
 *
 * A linear map is wrong here: it makes the ground rush at you in the last
 * few percent, which reads as a collision. This curve is steep while you are
 * high (the world is far away, so movement is subtle) and flattens out as you
 * approach eye level (small changes in altitude become large on screen).
 */
export function easeDescent(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  // Smootherstep, then biased so the last 20% of scroll covers little
  // altitude change — that is what produces a soft landing.
  const smooth = clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
  return smooth * 0.82 + clamped * 0.18;
}

export function useScrollProgress(): ScrollProgress {
  const scrollRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  const progressRef = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      frame.current = null;

      // Prefer the designated container; fall back to the document.
      const element = scrollRef.current;
      const scrollTop = window.scrollY;
      const total =
        element && element !== document.body
          ? element.scrollHeight - element.clientHeight
          : document.documentElement.scrollHeight - window.innerHeight;

      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / total));
      progressRef.current = next;
      setProgress(next);

      // Mirror onto the document so CSS can react without a React render.
      document.documentElement.style.setProperty(
        "--scroll-progress",
        next.toFixed(4),
      );
      document.documentElement.style.setProperty(
        "--scroll-descent",
        easeDescent(next).toFixed(4),
      );
    };

    const schedule = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(measure);
    };

    const onScroll = () => {
      schedule();
      setScrolling(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setScrolling(false), IDLE_DELAY_MS);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return {
    progress,
    descent: easeDescent(progress),
    scrolling,
    scrollRef,
  };
}