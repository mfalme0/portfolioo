"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSky } from "./SkyProvider";
import { usePageProgress } from "@/components/ScrollShell";
import { useRenderGate } from "@/hooks/useRenderGate";
import { easeDescent } from "@/hooks/useScrollProgress";
import type { SkyState } from "@/lib/sky";
import type { Coordinates } from "@/lib/solar";

/**
 * The persistent backdrop.
 *
 * Three layers, in order of preference:
 *
 *   1. A CSS sky painted by the pre-paint script. Free, instant, works with
 *      JS disabled, and guarantees text contrast. Always present.
 *   2. A WebGL scene on top of it, for the descent and the lighting. Mounted
 *      lazily so it never competes with LCP, and skipped entirely when the
 *      reader does not want motion or the device cannot manage it.
 *
 * The CSS layer is never removed. If WebGL fails, is slow, or the reader
 * prefers reduced motion, they still get a correct-looking sky — just without
 * the 3D. That is why the scene is additive rather than a replacement.
 */

const SkyScene = dynamic(() => import("./SkyScene").then((m) => m.SkyScene), {
  ssr: false,
});

export function SkyBackdrop() {
  const { state, coordinates, reduceMotion } = useSky();
  const { progress } = usePageProgress();
  const gate = useRenderGate({ progress });

  const [mounted, setMounted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Never mount the canvas during first paint — that would put a WebGL
  // context on the critical rendering path.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const descent = easeDescent(progress);

  const sceneEnabled =
    mounted && state !== null && gate.enabled && !reduceMotion;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/*
        Layer 1 — CSS sky.

        This is the fallback and the first-paint layer: it renders before the
        canvas mounts, so there is never a blank frame. Once the 3D scene has
        drawn its own sky dome it is hidden, because two skies disagreeing
        (this gradient versus the scene's own fog and dome) is what made the
        scene look like a jumbled mess.
      */}
      <div
        className="sky-gradient absolute inset-0 transition-opacity duration-slow ease-sky"
        style={{ opacity: sceneReady ? 0 : 1 }}
      />

      {/* Layer 2 — the descent. */}
      {sceneEnabled && (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <SkyScene
              sky={state as SkyState}
              coords={coordinates as Coordinates}
              descent={descent}
              quality={gate.quality === "full" ? "full" : "reduced"}
              onContextLost={gate.onContextLost}
              onFirstFrame={() => setSceneReady(true)}
            />
          </Suspense>
        </div>
      )}

      {/* Vignette. Keeps the page edges readable regardless of what the scene
          is doing behind them. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, rgb(8 9 12 / 0.35) 100%)",
        }}
      />
    </div>
  );
}