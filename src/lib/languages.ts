/**
 * Language colours, derived from GitHub's own linguist palette so the site
 * reads the way a developer expects rather than inventing arbitrary hues.
 */

const COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  "C#": "#178600",
  "C++": "#F34B7D",
  Java: "#B07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#E34C26",
  CSS: "#563D7C",
  SCSS: "#C6538C",
  Svelte: "#FF3E00",
  Vue: "#41B883",
  Dart: "#00B4AB",
  Shell: "#89E051",
  Dockerfile: "#384D54",
  Makefile: "#427819",
  PLpgSQL: "#336790",
  "Jupyter Notebook": "#DA5B0B",
  MDX: "#FCB32C",
  Nix: "#7E7EFF",
  Zig: "#EC915C",
  Elixir: "#6E4A7E",
  Haskell: "#5E5086",
  Lua: "#000080",
  Perl: "#0298C3",
  R: "#198CE7",
  Scala: "#C22D40",
  El: "#F59A00",
  C: "#A8B9CC",
};

export function languageColor(language: string | null): string {
  if (!language) return "#6B7484";
  return COLORS[language] ?? "#6B7484";
}

/** Every language present in the data, with total byte counts. */
export function aggregateLanguages(
  repos: Array<{ languages: Record<string, number> }>,
): Array<{ name: string; bytes: number; share: number }> {
  const totals = new Map<string, number>();

  for (const repo of repos) {
    for (const [name, bytes] of Object.entries(repo.languages)) {
      totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }

  const grand = [...totals.values()].reduce((a, b) => a + b, 0);
  if (grand === 0) return [];

  return [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes, share: bytes / grand }))
    .sort((a, b) => b.bytes - a.bytes);
}