"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  applySkyState,
  computeSkyState,
  type SkyState,
} from "@/lib/sky";
import { NAIROBI, type Coordinates } from "@/lib/solar";
import { moonPhaseName } from "@/lib/moon";

interface SkyContextValue {
  /** Null until the client takes over from the pre-paint script. */
  state: SkyState | null;
  /** True once the client has taken over from the pre-paint script. */
  ready: boolean;
  coordinates: Coordinates;
  setCoordinates: (c: Coordinates) => void;
  usingPreciseLocation: boolean;
  requestPreciseLocation: () => void;
  reduceMotion: boolean;
}

const SkyContext = createContext<SkyContextValue | null>(null);

/** Recompute at most this often, regardless of how fast the clock ticks. */
const RECOMPUTE_INTERVAL_MS = 60_000;

export function SkyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SkyState | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(NAIROBI);
  const [usingPreciseLocation, setUsingPreciseLocation] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const lastComputedRef = useRef(0);

  const compute = useCallback(() => {
    const next = computeSkyState(new Date(), coordinates);
    applySkyState(document.documentElement, next);
    setState(next);
    lastComputedRef.current = Date.now();
  }, [coordinates]);

  // Take over from the pre-paint script.
  useEffect(() => {
    compute();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    media.addEventListener("change", onMotionChange);

    return () => media.removeEventListener("change", onMotionChange);
  }, [compute]);

  // Recompute on an interval aligned to the minute so crossing a phase
  // boundary is picked up promptly rather than whenever the tick lands.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      if (now - lastComputedRef.current >= RECOMPUTE_INTERVAL_MS) compute();
    };
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [compute]);

  // A laptop asleep across dawn should catch up when it wakes.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") compute();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [compute]);

  const requestPreciseLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setUsingPreciseLocation(true);
      },
      () => {
        // Permission denied or unavailable — keep Nairobi.
      },
      { timeout: 8000, maximumAge: 600_000 },
    );
  }, []);

  const value = useMemo<SkyContextValue>(
    () => ({
      state,
      ready: state !== null,
      coordinates,
      setCoordinates,
      usingPreciseLocation,
      requestPreciseLocation,
      reduceMotion,
    }),
    [state, coordinates, usingPreciseLocation, requestPreciseLocation, reduceMotion],
  );

  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}

export function useSky(): SkyContextValue {
  const ctx = useContext(SkyContext);
  if (!ctx) {
    throw new Error("useSky must be used inside <SkyProvider>");
  }
  return ctx;
}

/**
 * Read sky state without subscribing to updates. Safe during SSR — returns
 * null on the server rather than throwing.
 */
export function useSkyState(): SkyState | null {
  const ctx = useContext(SkyContext);
  return ctx?.state ?? null;
}

export { moonPhaseName };