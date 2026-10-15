import { GitHubMark } from "@/components/icons/GitHubMark";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hairline-top relative z-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-sm text-ink-subtle">
          © {year} Joseph Gitau. Built in Nairobi.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://portfolioo2.mfalme.runs-on.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-accent"
          >
            <span className="text-accent" aria-hidden="true">→</span>
            Main portfolio
          </a>
          <a
            href="https://github.com/mfalme0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-accent"
          >
            <GitHubMark size={15} aria-hidden="true" />
            @mfalme0
          </a>
        </div>
      </div>
    </footer>
  );
}