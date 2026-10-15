import { Star, GitFork, ExternalLink, Scale, ArrowUpRight } from "lucide-react";
import { GitHubMark } from "@/components/icons/GitHubMark";
import type { Repo } from "@/data/repos.generated";
import { languageColor } from "@/lib/languages";
import { RepoArtwork } from "./RepoArtwork";

export function RepoCard({ repo, rank }: { repo: Repo; rank?: number }) {
  const languages = Object.entries(repo.languages).sort((a, b) => b[1] - a[1]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg transition-all duration-smooth ease-sky hover:-translate-y-1 hover:border-accent/40">
      {/* Artwork. Behind a scrim so the card still reads as one surface rather
          than an image with text stuck to it. */}
      <div className="relative h-32 shrink-0 overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 transition-transform duration-smooth ease-sky group-hover:scale-105">
          <RepoArtwork repo={repo} />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(12 14 19 / 0.92) 0%, rgb(12 14 19 / 0.35) 55%, transparent 100%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <h3 className="truncate font-mono text-base font-medium text-ink">
            {rank !== undefined && (
              <span className="text-ink-subtle" aria-hidden="true">
                {rank}.
              </span>
            )}{" "}
            {repo.name}
          </h3>

          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md p-1.5 text-ink-subtle transition-colors duration-quick hover:bg-surface-3 hover:text-accent"
            aria-label={`Open ${repo.name} on GitHub`}
          >
            <GitHubMark size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="scrim-soft flex flex-1 flex-col border-0 p-5">
        {repo.description ? (
          <p className="text-sm leading-relaxed text-ink-muted text-pretty">
            {repo.description}
          </p>
        ) : (
          <p className="text-sm italic text-ink-subtle">No description yet.</p>
        )}

        {repo.topics.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 4).map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-subtle"
              >
                {topic}
              </li>
            ))}
          </ul>
        )}

        <div className="flex-1" />

        {languages.length > 0 && (
          <div
            className="mt-5 flex h-1 overflow-hidden rounded-full bg-surface-3"
            role="img"
            aria-label={languages
              .map(
                ([name, bytes]) =>
                  `${name} ${Math.round((bytes / repo.totalBytes) * 100)}%`,
              )
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
            <span className="tabular flex items-center gap-1">
              <Star size={12} aria-hidden="true" />
              {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="tabular flex items-center gap-1">
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

          <span className="tabular ml-auto">
            {new Date(repo.updatedAt).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })}
          </span>

          {repo.homepage ? (
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
          ) : (
            <ArrowUpRight
              size={13}
              className="text-ink-subtle opacity-0 transition-opacity duration-quick group-hover:opacity-100"
              aria-hidden="true"
            />
          )}
        </footer>
      </div>
    </article>
  );
}