# portfolioo — build plan and status

**Repo:** `D:\projects\portfolioo`
**Purpose:** Secondary portfolio for friends and buddies. Primary portfolio is
[portfolioo2](https://github.com/mfalme0/portfolioo2) (brutalist motion graphics);
this one is deliberately the opposite register — a real-time solar sky with a
scroll-driven 3D descent.

**Status:** Core rebuild complete and verified. Remaining work is listed in
§5.

---

## 1. Current state — verified

Everything below was run, not assumed.

| Check | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | clean |
| Lint | `npm run lint` | clean |
| Tests | `npm test` | 110 passing (8 files) |
| Coverage | `npm run test:coverage` | 91.5% stmt / 82.0% branch / 91.9% line, gate 85/75/85 |
| Build | `npm run build` | succeeds, all routes static |

Routes generated: `/`, `/gear`, `/favourites`, `/projects/[slug]`,
`/icon.svg`, `/manifest.webmanifest`, `/opengraph-image`, `/robots.txt`,
`/sitemap.xml`.

### Stack

Next.js 16.4 (Turbopack) · React 19.3 · Tailwind v4 (CSS-first `@theme`) ·
TypeScript strict · R3F 9 + drei 10 + postprocessing 3 · Vitest 4 +
Testing Library + jest-axe.

Version-aligned with portfolioo2 so the R3F stack is a port rather than a
re-derivation.

---

## 2. Architecture

```
src/lib/          pure logic, no React
  solar.ts          NOAA solar position — altitude, azimuth, refraction
  moon.ts           lunar position, phase, illumination
  sky.ts            sky state: gradients, contrast, mood, disc placement
  sky-init-script.ts  inline pre-paint script (duplicates solar maths, no imports)
  languages.ts      linguist colours + byte aggregation
  site.ts           identity constants

src/data/
  repos.generated.ts  written by scripts/fetch-repos.mjs at build time

src/hooks/
  useScrollProgress.ts  one normalised 0..1 value driving the whole descent
  useRenderGate.ts      WebGL/reduced-motion/idle gating and quality ladder

src/components/
  ScrollShell.tsx    render-prop wrapper for scroll progress
  sky/               SkyProvider, SkyBackdrop, SkyScene, Celestial,
                     StarField, Terrain
  sections/          Hero, FeaturedWork, RepoGrid, Stack, Contributions, Contact
  layout/            Header, Footer
  projects/          RepoCard
```

### The three systems, one input

`solarPosition()` is computed once per minute and is the sole input to:

1. **The CSS sky** — gradients, star opacity, foreground contrast.
2. **The 3D lighting** — key light direction and colour temperature.
3. **Scenery selection** — beach by day, street at night.

Keeping these in one function is what stops the layers disagreeing about what
time it is.

### The descent

Scroll progress `0 → 1` maps to camera altitude `260 → 1.7` (eye level). The
illusion depends on two different scale behaviours:

- **Sun/moon** sit at effectively infinite distance → shrink toward a disc,
  rise toward the horizon, never leave frame.
- **Ground** is finite → grows in frame, passes overhead, slides out.

Aerial-perspective fog and pitch compensation give it depth. If both scaled
identically it would read as flying away.

---

## 3. Decisions made along the way

These were open questions during planning, resolved as noted.

| Decision | Resolution |
|---|---|
| Beach/street trigger | **Time-driven.** Beach by day, street at night. A scroll-driven beach→street journey was the alternative; time-driven was chosen because the solar maths already produce the switch for free and it avoids authoring two traversals. |
| Accent colour | Lime `#C8FF4D` primary, cyan `#3DF5D0` reserved for cool/data contexts. Two variants because one accent cannot stay legible at both midday and night. |
| Theme toggle | **Not built.** The sky owns hero surface tokens; a page-chrome toggle would fight it. Deliberately deferred, not forgotten. |
| 3D scope | Sky and terrain only. No 3D project cards or rig showcase — materially larger performance surface. |
| Sky coordinates | Nairobi by default; optional "Show my sky" geolocation button. No permission prompt on load. |
| Start altitude | 260 units. |
| Asset downloads | **CC0 textures used.** Poly Haven `coast_sand_01` and `asphalt_02`, fetched by `scripts/fetch-textures.mjs`, converted to WebP, 1.94 MB for 6 PBR maps. Sources and licences in `public/assets/CREDITS.md`. Models remain procedural and instanced. |

---

## 4. Bugs found and fixed

| Bug | Detail |
|---|---|
| **Leaked GitHub token** | `app/components/auth.json` held token `919a2bfa…`, committed in `e91e78e`, public on GitHub since. File deleted, `.gitignore`d, and purged from all 60 commits with `git filter-repo`. History rewritten — **remote needs a force-push.** |
| **Dead project links** | `mfalme0/ganji` and `mfalme0/betterFarm` both 404. Were linked as live projects. |
| **Mojibake** | `hero.tsx` had `'Good Afternoon! dYO�'`. Same corruption later found in `site.ts`. Both fixed; full-tree scan now clean. |
| **Flash of wrong sky** | Gradient was React state initialised blue-purple, swapped after paint. Now a pre-paint script writes CSS variables before first frame. |
| **WCAG AA failure** | Morning gradient `yellow-400 → orange-500` with `text-gray-800` ≈ 3.1:1. Contrast now computed per phase. |
| **Horizontal page scroll** | Contribution calendar wrapped in `min-w-[1200px]`. Now measured and scaled to fit. |
| **Two `<h1>` elements** | Both on the hero. Now one. |
| **Solar maths — timezone** | NOAA formula needs *local* clock minutes; UTC was being passed. Fixing it revealed the offset cancels algebraically — solar position depends only on absolute UTC time and longitude. |
| **Solar maths — precision** | Hour was derived from `jd * 24` (~59 million), collapsing to 0 at midnight. Now read from the Date's own UTC fields. |
| **`lastIndexOf("];")`** | Data-file parser matched `string[];` inside interface declarations. Now anchored on a line-leading `\n];`. |
| **20MB of images** | `Images/` held a 7.6MB PNG among others. Deleted entirely; nothing in the new site references them. |
| **`bg-opacity-*`** | Invalid Tailwind v4 syntax throughout. Gone with the rewrite. |

### Contrast bugs found by the test suite

Three more accessibility defects, all in code that *looked* correct and all
found only by measuring contrast across every hour of the year rather than
eyeballing a few:

| Bug | Detail |
|---|---|
| **AA failure at golden hour** | Text hit 4.35:1 against the mid sky. Root cause: the dark foreground was a lifted near-black (`#08090C`) rather than true black. White clears AA when background luminance ≤ 0.183; black clears it at ≥ 0.175 — those bands only overlap for a *true* black. Worst case is now 4.59:1. |
| **Muted text at 1.07:1** | The muted tone was chosen by eye, landing a near-black grey on a near-black sky. Now scored against the actual background. |
| **One foreground for two skies** | At golden hour the mid sky is dark (wants white text) and the horizon is bright amber (wants black). A single value gave 2.63:1. Added a separate `--sky-fg-horizon`. |
| **Pre-paint script drift** | The inline script duplicates the solar maths and had kept the broken foreground, so the first paint would have regressed even after the library was fixed. |

### Two bugs the tests caught that review would not have

Solar noon was off by 26 minutes and the sun appeared to freeze at −83° for a
full day. Both were caught by comparing against published Nairobi almanac
values, not by reading the code. Worth remembering that fixture-based
validation is the only reason these were found.

A third: a `matchMedia` mock in the reduced-motion test leaked into every
later test in that file, silently disabling the render gate. Restoring mocks
in `afterEach` is the whole fix.

### Two bugs the tests caught that review would not have

Solar noon was off by 26 minutes and the sun appeared to freeze at −83° for a
full day. Both were caught by comparing against published Nairobi almanac
values, not by reading the code. Worth remembering that fixture-based
validation is the only reason these were found.

---

## 5. Remaining work

### 5.1 Blocking — must do before deploying

- [x] **Force-push the rewritten history.** Done — `3254f16...351e35a main -> main (forced update)`. Token purged from origin.
- [ ] **Revoke the leaked token** at github.com/settings/tokens. It has been public since `e91e78e`. Revoking is independent of the rewrite — the old objects may persist in GitHub's caches and forks regardless.
- [ ] **Set `GITHUB_TOKEN`** in `.env.local` (see `.env.example`). Unauthenticated API allows 60 req/hr and a full build makes ~16, so language breakdowns silently fall back to committed data.
- [ ] **Verify the rendered site visually.** Build passes; the 3D scene has not been inspected in a browser. Run `npm run dev`.

### 5.2 Content decisions blocked on the user

- [ ] **Hero copy.** Currently "Software that stays up." Reasonable placeholder based on their actual work, but not their voice. Needs personalization.
- [ ] **Accent verification.** Lime `#C8FF4D` chosen without confirmation. Needs a look in-browser at both midday and night.
- [x] **Cross-link to portfolioo2.** DONE — linked in footer.

### 5.3 New routes (all built)

- [x] **`/gear`** — PC build specs (Ryzen 7 5800X3D, RTX 3080, 32GB RAM), peripherals, homelab note. No images — the old 20MB Images folder was purged.
- [x] **`/favourites`** — media picks: Counter-Strike, Goose Goose Duck, good kid m.A.A.d city, Bleach. Real links to Spotify/Crunchyroll/etc.
- [x] **`/projects/[slug]`** — generated deep-dive per repo from `repos.generated.ts`. Stack breakdown with byte percentages, topics, stars/forks, last updated, live demo link when homepage exists.
- [ ] **Theme toggle.** Blocked on the sky-owns-hero-tokens boundary. Would need page-chrome-only tokens.

### 5.4 Quality gaps

Closed in commit `7e3eaf9`:

- [x] **Component tests** — `Hero`, `RepoGrid`, `Header`, `Contact`, `Footer`, `FeaturedWork`, `Stack`, `Contributions`, plus both hooks and camera invariants. 110 tests across 8 files.
- [x] **jest-axe** — run against rendered components via `src/test-utils/axe.ts`. Guards the duplicate-`h1`, unlabelled-control and dead-link regressions.
- [x] **GitHub Actions** — `.github/workflows/ci.yml`: lint → typecheck → coverage → build, with a `gitleaks` step scanning full history (`fetch-depth: 0`).
- [x] **Coverage gate** — set to 85/80/75/85 against actual 91.5/91.8/82.0/94.3.

Still open:

- [ ] **`npm audit`.** 5 high-severity findings, all dev-toolchain only (`braces` → `fast-glob` → `micromatch` inside the ESLint plugin). npm's suggested fix is a downgrade to Next 14, which is worse. They never reach production. Noted in CI to avoid a future panic.
- [ ] **Performance profiling.** The budget is written into the code (`dpr` clamped to 1.5, 30fps, bloom only, pause when idle/hidden) but has never been measured on real hardware. Lighthouse not run.
- [ ] **Mobile check.** Touch devices, safe-area insets, and the `100svh` hero untested.
- [ ] **Procedural terrain quality.** Beach and street are generated, not art-directed. May need tuning or real CC0 assets.
- [ ] **Visual tuning after eyes-on review.** The materials, sea, wet-sand band and typography are in, but nothing has been seen in a browser. Expect a round of adjustment.
- [ ] **Browser smoke test.** The R3F scene cannot run under jsdom, so `SkyScene`, `Celestial`, `StarField` and `Terrain` are excluded from coverage rather than tested. Their pure logic is covered in `src/lib`; the rendering itself has only been verified by `next build` succeeding. A Playwright smoke test would close this honestly.

### 5.5 Note on coverage exclusions

The four 3D component files are excluded from the coverage denominator
because jsdom has no WebGL context. This is a real gap, not a solved one —
they are the largest untested surface in the codebase, and "excluded" is not
"tested". The exclusion is commented in `vitest.config.ts` so it is not
mistaken for coverage.

---

## 6. Visual pass — what was done

The "make it look the best it could" pass, commit `aba3031`.

### Materials
- CC0 PBR texture sets replace flat colour. `scripts/fetch-textures.mjs`
  fetches from Poly Haven and converts to WebP.
- **Diffuse maps are sRGB; normal and roughness maps stay linear.** This
  split is the detail that makes or breaks it — getting it wrong washes the
  ground out or over-contrasts it.
- **Per-map quality:** 82 diffuse, 90 normal, 88 roughness. Normal maps are
  near-binary and artefact visibly as lighting seams; roughness bands below
  ~88 on large surfaces.
- 1.94 MB for 6 maps. An earlier draft fetched four material sets at 3.42 MB
  and two were never referenced by the scene — removed rather than carried.

### Scene
- Sea plane with two crossing wave sets, tinted by sun altitude so golden
  hour gets its glint.
- Wet-sand band at the waterline. Wet sand darkens and drops in roughness;
  that strip is most of what makes a beach read as a shoreline rather than a
  desert.
- Ground roughness interpolates with daylight — wet asphalt at night is
  glossier than dry asphalt by day.

### Project cards
- Deterministic generated artwork per repo, seeded from the repo name. Inline
  SVG: no network request, sharp at any density, stable across builds.
- Gradient ids namespaced with `useId`, not a module counter. A counter gives
  different ids on server and client depending on render order, which is a
  hydration mismatch — caught by a test, not by review.

### Motion and type
- IntersectionObserver reveals on the existing duration scale. One motion,
  one easing, restrained: the descent is the centrepiece and too many
  animations read as busy rather than considered.
- Reduced-motion read as lazy initial state rather than inside an effect, so
  those users never see the hidden frame at all.
- Tracking scales inversely with size: −0.02em at body, −0.045em at hero.
  Optical sizing enabled on the variable fonts.
- Tabular numerals wherever values sit in columns.

### What was deliberately not done
- **The scrim problem was left alone.** The plan flagged that 3D behind every
  word risks looking busy rather than premium, and suggested pulling the scene
  back to just the hero and footer if it fights the content. That is a
  judgement call that needs eyes on it, not a change to make blind.

---

## 7. Ordering

```
Phase 0  security            ✓ DONE  (force-pushed; token revocation pending)
Phase 1  stack + foundation  ✓ DONE
Phase 1.5 solar sky + maths  ✓ DONE
Phase 1.6 3D + lighting      ✓ DONE
Phase 1.7 scroll descent     ✓ DONE
Phase 2  design tokens       ✓ DONE
Phase 3  architecture        ✓ DONE
Phase 4  project data        ✓ DONE
Phase 5  sections            ✓ DONE  — core, /gear, /favourites,
                              /projects/[slug] all built
Phase 6  ship quality        ✓ DONE  — metadata, sitemap, robots, manifest,
                              OG image, icon, CI workflow, gitleaks, 110 tests
```

Phases 1.5, 1.6 and 1.7 were built as one unit against a single canvas. They
share the solar computation and must not be split apart later.

The only outstanding items are the ones that need a human or a real browser:
token revocation, hero copy, and visual/performance verification.