import { repos } from "@/data/repos.generated";
import { RepoCard } from "@/components/projects/RepoCard";

/**
 * The projects worth looking at first.
 *
 * Ordering is curated rather than automatic — see FEATURED in
 * scripts/fetch-repos.mjs. Recency is a poor proxy for what actually
 * represents the work.
 */
export function FeaturedWork() {
  const featured = repos.filter((repo) => repo.featured).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section id="work" className="section">
      <div className="container-page">
        <header className="mb-14">
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Three things I would actually show you
          </h2>
          <p className="mt-4 max-w-2xl text-ink-muted text-pretty">
            Every repo here is built from scratch. The descriptions are the
            authors&apos; own — pulled straight from GitHub at build time rather
            than rewritten to sound better.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {featured.map((repo, index) => (
            <RepoCard key={repo.name} repo={repo} rank={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}