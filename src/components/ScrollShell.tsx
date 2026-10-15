"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

interface PageProgress {
  progress: number;
  descent: number;
  scrolling: boolean;
}

const ScrollProgressContext = createContext<PageProgress | null>(null);

/**
 * Wraps the page in the single scroll-progress value that drives the 3D
 * descent.
 *
 * Shared via context, not a render prop. A render prop means the page body is
 * a *function* passed from the (server) page into this client component, which
 * the server/client boundary forbids — that is what made `/` un-renderable.
 * Context also limits re-renders to the components that actually read scroll
 * (the backdrop and the hero), rather than the whole tree every frame.
 */
export function ScrollShell({ children }: { children: ReactNode }) {
  const { progress, descent, scrolling } = useScrollProgress();
  const value = useMemo<PageProgress>(
    () => ({ progress, descent, scrolling }),
    [progress, descent, scrolling],
  );

  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function usePageProgress(): PageProgress {
  const ctx = useContext(ScrollProgressContext);
  if (!ctx) {
    throw new Error("usePageProgress must be used inside <ScrollShell>");
  }
  return ctx;
}
