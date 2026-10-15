import { Mail } from "lucide-react";
import { GitHubMark } from "@/components/icons/GitHubMark";
import { Reveal } from "@/components/motion/Reveal";

const LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/mfalme0",
    handle: "@mfalme0",
    icon: GitHubMark,
  },
  {
    label: "Email",
    href: "mailto:hello@mfalme.runs-on.dev",
    handle: "hello@mfalme.runs-on.dev",
    icon: Mail,
  },
];

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container-page">
        <Reveal>
          <div className="scrim-panel rounded-2xl p-8 sm:p-12">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-balance">
              Working on something that has to stay up?
            </h2>
            <p className="mt-4 max-w-xl text-ink-muted text-pretty">
              Transaction processing, AI-assisted operations, or self-hosted
              tooling that refuses to phone home — all in scope.
            </p>

            <ul className="mt-8 flex flex-wrap gap-3">
              {LINKS.map(({ label, href, handle, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-full border border-hairline-strong px-5 py-3 transition-colors duration-quick hover:border-accent"
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-ink-subtle">{handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}