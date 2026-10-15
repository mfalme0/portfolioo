"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contribution calendar.
 *
 * Replaces the old `react-github-calendar` block, which was wrapped in a
 * `min-w-[1200px]` div — the direct cause of the site scrolling sideways on
 * every viewport narrower than 1200px. The heatmap is fetched, measured, and
 * scaled to fit whatever space it is given.
 *
 * Rendered client-side only. GitHub has no unauthenticated heatmap endpoint
 * worth calling from the server, and a third-party component would pull React
 * 18-era code into a React 19 app.
 */

const GITHUB_USERNAME = "mfalme0";
const CELL = 9;
const GAP = 3;
const WEEKS = 53;

interface Day {
  date: string;
  count: number;
  level: number;
}

export function Contributions() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: { totalContributions: number; contributions: Day[] }) => {
        setDays(data.contributions);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => controller.abort();
  }, []);

  // Scale to fit rather than forcing a min-width. This is the actual fix for
  // the horizontal-overflow bug.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || days === null) return;

    const naturalWidth = WEEKS * (CELL + GAP);
    const fit = () => {
      const available = element.clientWidth;
      setScale(Math.min(1, available / naturalWidth));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [days]);

  const total = days?.reduce((sum, day) => sum + day.count, 0) ?? 0;

  return (
    <section id="activity" className="section">
      <div className="container-page">
        <header className="mb-10">
          <p className="eyebrow">Activity</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Days I have shipped something
          </h2>
          {days !== null && (
            <p className="mt-3 text-ink-muted">
              {total.toLocaleString()} contributions in the last year.
            </p>
          )}
        </header>

        {days === null && !failed && (
          <div
            className="h-28 w-full animate-pulse rounded-lg bg-surface-2"
            aria-label="Loading contribution graph"
          />
        )}

        {failed && (
          <p className="text-ink-muted">
            The contribution graph could not be loaded. You can see the same
            data on{" "}
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        )}

        {days !== null && (
          <div ref={containerRef} className="w-full overflow-hidden">
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${scale})`,
                // Reserve the visually-correct height so scaling does not
                // leave a large empty gap underneath.
                height: 7 * (CELL + GAP),
                width: WEEKS * (CELL + GAP),
              }}
              role="img"
              aria-label={`GitHub contributions for the last year: ${total} contributions`}
            >
              <ContributionsGrid days={days} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ContributionsGrid({ days }: { days: Day[] }) {
  // Lay the flat day list into week columns.
  const weeks: Day[][] = [];
  let current: Day[] = [];

  for (const day of days) {
    const date = new Date(day.date);
    // Pad the first week so columns start on Sunday.
    if (current.length === 0 && date.getDay() !== 0 && weeks.length === 0) {
      for (let i = 0; i < date.getDay(); i++) current.push(null as unknown as Day);
    }
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) weeks.push(current);

  const LEVELS = [
    "bg-surface-2",
    "bg-accent/25",
    "bg-accent/50",
    "bg-accent/75",
    "bg-accent",
  ];

  return (
    <div className="flex gap-[3px]">
      {weeks.slice(-WEEKS).map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) =>
            day ? (
              <div
                key={day.date}
                className={`size-[9px] rounded-[2px] ${LEVELS[day.level] ?? LEVELS[0]}`}
                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
              />
            ) : (
              <div key={`pad-${wi}-${di}`} className="size-[9px]" />
            ),
          )}
        </div>
      ))}
    </div>
  );
}