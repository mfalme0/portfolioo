"use client";

import { useMemo, useState } from "react";
import { repos } from "@/data/repos.generated";
import { RepoCard } from "@/components/projects/RepoCard";
import { languageColor } from "@/lib/languages";

/**
 * Everything else.
 *
 * The old site linked to two repos that 404. Everything rendered here comes
 * from the live API at build time, so a link on this page cannot be dead —
 * if a repo stops existing it simply stops appearing.
 */
export function RepoGrid() {
  const everything = useMemo(() => repos.filter((repo) => !repo.featured), []);

  // Language filters are derived from what actually exists, so the filter row
  // can never offer a language with no repos behind it.
  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const repo of everything) {
      for (const name of Object.keys(repo.languages)) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [everything]);

  const [filter, setFilter] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      filter
        ? everything.filter((repo) => repo.languages[filter] !== undefined)
        : everything,
    [everything, filter],
  );

  return (
    <section id="repos" className="section">
      <div className="container-page">
        <header className="mb-10">
          <p className="eyebrow">Everything else</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {everything.length} repositories
          </h2>
        </header>

        {languages.length > 1 && (
          <div
            className="mb-10 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter repositories by language"
          >
            <FilterChip
              active={filter === null}
              onClick={() => setFilter(null)}
              label="All"
            />
            {languages.map(([name, count]) => (
              <FilterChip
                key={name}
                active={filter === name}
                onClick={() => setFilter(filter === name ? null : name)}
                label={name}
                count={count}
                color={languageColor(name)}
              />
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="text-ink-muted">
            Nothing tagged with {filter} yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((repo) => (
              <li key={repo.name}>
                <RepoCard repo={repo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-quick ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink"
      }`}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {label}
      {count !== undefined && (
        <span className="text-xs text-ink-subtle">{count}</span>
      )}
    </button>
  );
}