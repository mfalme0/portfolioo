import { repos } from "@/data/repos.generated";
import { aggregateLanguages, languageColor } from "@/lib/languages";

/**
 * Stack.
 *
 * Built from actual byte counts across the account, not self-assessed
 * proficiency labels. The old site claimed "Expert" in eight languages and
 * omitted Go, Rust, Svelte, MDX and PL/pgSQL entirely — languages that
 * account for a substantial share of the actual work.
 */
export function Stack() {
  const languages = aggregateLanguages(repos);
  const total = languages.reduce((a, l) => a + l.bytes, 0);

  if (languages.length === 0) return null;

  const top = languages.slice(0, 10);

  return (
    <section id="stack" className="section">
      <div className="container-page">
        <header className="mb-12">
          <p className="eyebrow">Stack</p>
          <h2 className="mt-3 text-3xl font-semibold">
            What I actually write, measured in bytes
          </h2>
          <p className="mt-4 max-w-2xl text-ink-muted text-pretty">
            Pulled from the GitHub API at build time. Roughly{" "}
            {(total / 1_000_000).toFixed(1)} million lines-bytes across{" "}
            {repos.length} repositories — no self-assessed skill levels,
            because those cannot be verified.
          </p>
        </header>

        <div
          className="mb-10 flex h-3 overflow-hidden rounded-full bg-surface-3"
          role="img"
          aria-label={top
            .map((l) => `${l.name} ${(l.share * 100).toFixed(0)}%`)
            .join(", ")}
        >
          {top.map((lang) => (
            <span
              key={lang.name}
              style={{
                width: `${lang.share * 100}%`,
                backgroundColor: languageColor(lang.name),
              }}
            />
          ))}
        </div>

        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang) => (
            <li key={lang.name} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: languageColor(lang.name) }}
                aria-hidden="true"
              />
              <span className="font-mono text-sm">{lang.name}</span>
              <span
                className="ml-auto text-sm tabular-nums text-ink-subtle"
                aria-label={`${(lang.share * 100).toFixed(1)} percent`}
              >
                {(lang.share * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}