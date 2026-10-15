import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollShell } from "@/components/ScrollShell";
import { SkyBackdrop } from "@/components/sky/SkyBackdrop";
import { Reveal } from "@/components/motion/Reveal";
import { Gamepad, Music, Tv } from "lucide-react";

type FaveItem = {
  title: string;
  by: string;
  href: string;
  description?: string;
};

type Category = {
  id: string;
  label: string;
  Icon: React.ElementType;
  items: FaveItem[];
};

const CATEGORIES: Category[] = [
  {
    id: "games",
    label: "Games",
    Icon: Gamepad,
    items: [
      {
        title: "Counter-Strike",
        by: "Valve",
        href: "https://www.counter-strike.net/",
        description: "The one I keep coming back to.",
      },
      {
        title: "Goose Goose Duck",
        by: "Gaggle Studios",
        href: "https://gaggle.fun/goose-goose-duck",
        description: "Chaos with friends.",
      },
    ],
  },
  {
    id: "music",
    label: "Albums",
    Icon: Music,
    items: [
      {
        title: "good kid, m.A.A.d city",
        by: "Kendrick Lamar",
        href: "https://open.spotify.com/album/748dZDqSZy6aPXKcI9H80u",
        description: "Still the one.",
      },
    ],
  },
  {
    id: "tv",
    label: "TV",
    Icon: Tv,
    items: [
      {
        title: "Bleach",
        by: "Studio Pierrot",
        href: "https://www.crunchyroll.com/series/GR7X26K5K",
        description: "Thousand-year blood war.",
      },
    ],
  },
];

export default function FavouritesPage() {
  return (
    <ScrollShell>
      <SkyBackdrop />
      <Header />
      <main id="main">
        <Reveal>
          <section id="favourites" className="section">
            <div className="container-page">
              <p className="eyebrow">Favourites</p>
              <h2 className="mt-3 text-3xl font-semibold">
                Good shit
              </h2>
              <p className="mt-4 max-w-2xl text-ink-muted text-pretty">
                What I actually spend time on when I am not building.
              </p>

              {CATEGORIES.map((category) => (
                <Reveal key={category.id} delay={80}>
                  <article className="mt-12 scrim-panel rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      {React.createElement(
                        category.Icon as React.ComponentType<
                          React.SVGProps<SVGSVGElement> & { size?: number }
                        >,
                        { size: 20, className: "text-accent" },
                      )}
                      <h3 className="text-xl font-semibold">
                        {category.label}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item.title}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between items-start gap-3 text-sm leading-relaxed hover:text-accent transition-colors"
                          >
                            <div>
                              <span className="text-ink font-medium">
                                {item.title}
                              </span>
                              <span className="text-ink-subtle block">
                                {item.by}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-ink-subtle mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </ScrollShell>
  );
}