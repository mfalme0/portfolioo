import { Star, GitFork, ExternalLink, Scale } from "lucide-react";
import { GitHubMark } from "@/components/icons/GitHubMark";
import type { Repo } from "@/data/repos.generated";
import { languageColor } from "@/lib/languages";

export function RepoCard({ repo, rank }: { repo: Repo; rank?: number }) {
  const languages = Object.entries(repo.languages).sort((a, b) => b[1] - a[1]);

  return (
    <article className="scrim-soft group relative flex flex-col rounded-lg p-5 transition-all duration-smooth ease-sky hover:-translate-y-1 hover:border-accent/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-base font-medium text-ink">
            <span className="text-ink-subtle" aria-hidden="true">
              {rank !== undefined ? `${rank}. ` : ""}
            </span>
            {repo.name}
          </h3>

          {repo.description ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
              {repo.description}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-ink-subtle">
              No description yet.
            </p>
          )}
        </div>

        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md p-2 text-ink-subtle transition-colors duration-quick hover:bg-surface-3 hover:text-accent"
          aria-label={`Open ${repo.name} on GitHub`}
        >
          <GitHubMark size={17} aria-hidden="true" />
        </a>
      </div>

      {repo.topics.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-subtle"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}

      {languages.length > 0 && (
        <div
          className="mt-4 flex h-1 overflow-hidden rounded-full bg-surface-3"
          role="img"
          aria-label={languages
            .map(([name, bytes]) => `${name} ${Math.round((bytes / repo.totalBytes) * 100)}%`)
            .join(", ")}
        >
          {languages.map(([name, bytes]) => (
            <span
              key={name}
              style={{
                width: `${(bytes / repo.totalBytes) * 100}%`,
                backgroundColor: languageColor(name),
              }}
            />
          ))}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-subtle">
        {repo.language ? (
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: languageColor(repo.language) }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        ) : null}

        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} aria-hidden="true" />
            {repo.stars}
          </span>
        )}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={12} aria-hidden="true" />
            {repo.forks}
          </span>
        )}
        {repo.license && (
          <span className="flex items-center gap-1">
            <Scale size={12} aria-hidden="true" />
            {repo.license}
          </span>
        )}

        <span className="ml-auto">
          {new Date(repo.updatedAt).toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
          })}
        </span>

        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-accent transition-opacity hover:opacity-80"
            aria-label={`Open the live ${repo.name} site`}
          >
            Live
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        )}
      </footer>
    </article>
  );
}