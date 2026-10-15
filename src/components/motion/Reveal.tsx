"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals content as it enters the viewport.
 *
 * Deliberately restrained. The 3D descent is the centrepiece; if every
 * section also animates in, the page reads as busy rather than considered.
 * One motion, one duration, one easing — matching the token scale in
 * globals.css so the whole site feels like a single system.
 *
 * Motion is transform and opacity only. Both are compositor properties, so
 * this never triggers layout — which matters because the fixed canvas behind
 * makes any layout shift immediately visible.
 */

interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds. Used sparingly, for lists. */
  delay?: number;
  /** Travel distance in pixels. Small values read as "settled", not "flying". */
  distance?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

export function Reveal({
  children,
  delay = 0,
  distance = 24,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Read the motion preference as lazy initial state rather than inside an
  // effect. Setting it in an effect would flash the hidden state for one
  // frame on every load for reduced-motion users — the exact opposite of
  // what the preference asks for.
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            // One-shot: content stays visible once revealed.
            observer.disconnect();
          }
        }
      },
      {
        // Fire slightly before the element fully enters, so the motion is
        // already underway by the time the reader's eye arrives.
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Reduced motion means the final state immediately — no transform, no
  // transition, no hidden frame.
  const shown = visible || reduceMotion;

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0, ${distance}px, 0)`,
        transition: reduceMotion
          ? undefined
          : `opacity var(--duration-slow) var(--ease-out-soft) ${delay}ms, transform var(--duration-slow) var(--ease-out-soft) ${delay}ms`,
        // Without this, the invisible element still takes clicks.
        pointerEvents: shown ? undefined : "none",
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers a list of items on reveal.
 *
 * The cap matters: a 200ms stagger across 12 cards is 2.4 seconds before the
 * last one appears, which reads as the page being broken rather than as
 * polish. Anything past 6 items gets a flat delay.
 */
export function RevealGroup({
  children,
  step = 60,
  max = 6,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode[];
  step?: number;
  max?: number;
  className?: string;
  as?: "div" | "ul";
}) {
  return (
    <Tag className={className}>
      {children.map((child, index) => (
        <Reveal
          key={index}
          delay={Math.min(index, max) * step}
          as={Tag === "ul" ? "li" : "div"}
        >
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}