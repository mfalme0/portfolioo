"use client";

import { useEffect, useState } from "react";
import { ArrowDown, MapPin } from "lucide-react";
import { useSky } from "@/components/sky/SkyProvider";
import { usePageProgress } from "@/components/ScrollShell";

/**
 * Hero.
 *
 * Deliberately NOT gated on the 3D scene — the CSS sky underneath already
 * guarantees the right colour and contrast, so this renders identically with
 * WebGL off, JS partially blocked, or reduced motion on.
 *
 * Contrast note: the previous implementation paired a `yellow-400 →
 * orange-500` gradient with `text-gray-800`, which is roughly 3.1:1 and fails
 * WCAG AA. Here the foreground comes from `sky.fg`, which is computed by
 * picking whichever of black or white contrasts better against the current sky.
 */

function greetingFor(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function Hero() {
  const { state, usingPreciseLocation, requestPreciseLocation } = useSky();
  const { progress } = usePageProgress();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // As the reader descends, the hero recedes. Pure opacity and translate —
  // both compositor-only properties, so this never triggers layout.
  const recede = Math.min(1, progress * 3.2);

  const phaseLabel = state
    ? {
        night: "Night",
        astronomical: "Astronomical twilight",
        nautical: "Nautical twilight",
        civil: "Civil twilight",
        golden: "Golden hour",
        day: "Daylight",
      }[state.phase]
    : null;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-gutter py-24"
      style={{
        opacity: 1 - recede * 0.85,
        transform: `translate3d(0, ${recede * -60}px, 0)`,
        // Fades out entirely before it would collide with the next section.
        pointerEvents: recede > 0.6 ? "none" : undefined,
      }}
    >
      <div className="container-page flex flex-col items-center text-center">
        <p className="eyebrow mb-6 flex items-center gap-2">
          <MapPin size={12} aria-hidden="true" />
          Nairobi, Kenya
          {time ? <span aria-hidden="true">· {time}</span> : null}
        </p>

        <h1 className="text-5xl font-semibold tracking-tight">
          <span className="sky-fg">
            {greetingFor(new Date().getHours())}.
          </span>{" "}
          <span className="text-gradient-sky">I build software that stays up.</span>
        </h1>

        <p className="sky-fg-muted mt-8 max-w-2xl text-balance text-lg leading-relaxed">
          Transaction reliability in Rust. AI SRE tooling for homelabs. A
          self-hosted resume pipeline that refuses to fabricate a single fact.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#work"
            className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition-transform duration-quick ease-sky hover:scale-[1.03] active:scale-[0.99]"
          >
            See what I have built
          </a>
          <a
            href="#contact"
            className="rounded-full border border-hairline-strong px-6 py-3 font-medium text-ink transition-colors duration-quick hover:border-accent hover:text-accent"
          >
            Get in touch
          </a>
        </div>

        <div className="mt-10 flex min-h-7 flex-wrap items-center justify-center gap-3 text-xs text-ink-subtle">
          {phaseLabel ? (
            <span className="rounded-full border border-hairline px-3 py-1 font-mono">
              {phaseLabel}
            </span>
          ) : null}

          {!usingPreciseLocation ? (
            <button
              type="button"
              onClick={requestPreciseLocation}
              className="rounded-full border border-hairline px-3 py-1 font-mono transition-colors duration-quick hover:border-accent hover:text-accent"
            >
              Show my sky
            </button>
          ) : (
            <span className="font-mono">Using your location</span>
          )}
        </div>
      </div>

      <a
        href="#work"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-subtle transition-colors hover:text-accent"
        aria-label="Scroll to work"
      >
        <ArrowDown className="animate-bounce" size={22} aria-hidden="true" />
      </a>
    </section>
  );
}