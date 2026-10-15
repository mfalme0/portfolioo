import { notFound } from "next/navigation";
import { repos } from "@/data/repos.generated";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollShell } from "@/components/ScrollShell";
import { SkyBackdrop } from "@/components/sky/SkyBackdrop";
import { Reveal } from "@/components/motion/Reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { GitHubMark } from "@/components/icons/GitHubMark";
import { languageColor } from "@/lib/languages";

export async function generateStaticParams() {
  return repos.map((repo) => ({
    slug: repo.name,
  }));
}

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const repo = repos.find((r) => r.name === params.slug);

  if (!repo) {
    notFound();
  }

  const languages = Object.entries(repo.languages).sort((a, b) => b[1] - a[1]);

  return (
    <ScrollShell>
      <SkyBackdrop />
      <Header />
      <main id="main">
        <Reveal>
          <section className="section">
            <div className="container-page">
              <nav className="mb-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-ink-subtle hover:text-accent transition-colors"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  All projects
                </Link>
              </nav>

              <article className="scrim-panel rounded-2xl p-6 sm:p-10">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="eyebrow mb-2">
                      {repo.featured ? "Featured" : "Project"} ·{" "}
                      {new Date(repo.createdAt).toLocaleDateString(
                        "en-GB",
                        { month: "long", year: "numeric" },
                      )}
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight">
                      {repo.name}
                    </h1>
                    <p className="mt-4 text-lg text-ink-muted text-pretty">
                      {repo.description || "No description."}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-3">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-ink"
                    >
                      <GitHubMark size={16} aria-hidden="true" />
                      View on GitHub
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                        Live demo
                      </a>
                    )}
                  </div>
                </div>

                {languages.length > 0 && (
                  <div className="mt-6">
                    <p className="eyebrow mb-2">Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(([name, bytes]) => (
                        <span
                          key={name}
                          className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-ink-subtle"
                          style={{
                            backgroundColor: languageColor(name),
                          }}
                        >
                          {name}
                          <span className="ml-1 tabular text-ink-muted">
                            {Math.round((bytes / repo.totalBytes) * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {repo.topics.length > 0 && (
                  <div className="mt-6">
                    <p className="eyebrow mb-2">Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {repo.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-ink-subtle"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-start gap-6 text-xs tabular-nums text-ink-subtle">
                  {repo.stars > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star size={14} aria-hidden="true" />
                      <span>{repo.stars.toLocaleString()}</span>
                      <span className="ml-0.5">stars</span>
                    </div>
                  )}
                  {repo.forks > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span>{repo.forks.toLocaleString()}</span>
                      <span className="ml-0.5">forks</span>
                    </div>
                  )}
                  <div>
                    <span className="ml-0.5">
                      {new Date(repo.updatedAt).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </ScrollShell>
  );
}