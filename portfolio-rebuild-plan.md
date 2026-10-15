# Portfolio Rebuild Plan

**Repo:** `D:\projects\portfolioo` (Next.js 14.2.22 portfolioo)
**Goal:** Secondary portfolio for friends/buddies. Peak-design quality, rivals large-company sites.
**Status:** Plan only. No implementation started.

---

## Decisions Locked

| Area | Decision |
|---|---|
| Design direction | Dark "instrument panel" — near-black canvas, one saturated accent, strict type hierarchy. Distinct from portfolioo2's brutalist motion-graphics identity. |
| Hero sky | **Tier 3** — real solar position, sun/moon arc, stars. See Phase 1.5. |
| 3D | R3F v9 scene with real lighting, sharing Phase 1.5's solar math. See Phase 1.6. |
| Scroll background | Persistent scroll-reactive backdrop: sky → beach by day, busy street at night, visible until footer. See Phase 1.7. |
| Project data | Build-time fetch from GitHub API into a typed static file. No runtime calls. |
| Scope | Full rewrite on Next.js 15 + Tailwind v4 + TypeScript strict. |
| Keep/rebuild | Favourites/media picks, Gear page, GitHub contribution calendar. Drop gaming section. |
| Hero coordinate source | Sky uses Nairobi coords by default; clock uses visitor's own timezone. Optional "use my location" control. |

---

## Phase 0 — Security (blocking, do first)

### 0.1 Revoke leaked token
- Token `919a2bfafd0e4b4498c622835267e891` sits in `app/components/auth.json`.
- Committed in `e91e78e`, still present in the HEAD tree, public on `github.com/mfalme0/portfolioo`.
- Revoke at github.com/settings/tokens. Treat as burned regardless of rotation.

### 0.2 Remove file
- Delete `app/components/auth.json`.
- Add to `.gitignore`.
- Replace with `.env.example` documenting required vars.

### 0.3 Purge history
- `git filter-repo --path app/components/auth.json --invert-paths`
- Force-push to origin. All existing clones go stale — expected, notify any collaborators.
- Must complete BEFORE other work, otherwise the rewrite gets baked into every subsequent commit.

**Exit criteria:** token revoked, file gone, history clean, `gitleaks` passes on full history.

---

## Phase 1 — Stack & Foundation

### 1.1 Upgrade
- `next` 14.2.22 → 15.x, `react`/`react-dom` → 19.
- `eslint-config-next` bumped to match; `.eslintrc.json` → flat config (`eslint.config.mjs`).
- Node 24.18.0 / npm 11.16.0 confirmed present.

### 1.2 Tailwind v4 (CSS-first)
- Delete `tailwind.config.ts`. Move config into `@theme { }` blocks in `globals.css`.
- Drop `@designbycode/tailwindcss-text-glitch` (unmaintained, incompatible with v4). Rebuild glitch effect as a CSS keyframe utility.
- Audit and replace broken `bg-opacity-*` classes (invalid under v4).

### 1.3 TypeScript
- Remove `allowJs: true`.
- Add `noUncheckedIndexedAccess`, `noImplicitOverride`.
- Delete `app/components/colorUtils.js` (5.4KB hand-rolled class-map string concatenation) — superseded by real design tokens.
- Fix stray `tsconfig` include entry: `app/components/nowplaying.tsx` (file does not exist).

### 1.4 Testing
- Vitest + React Testing Library + `jest-axe`.
- Coverage gate in CI.

### 1.5 Image assets (blocking perf work)
`Images/` is ~20MB of unoptimized assets committed to git. Worst offenders:

| File | Size |
|---|---|
| `g513.png` | 7.6 MB |
| `tdk.jpg` | 2.4 MB |
| `bl.jpg` | 1.5 MB |
| `gotham.jpg` | 1.2 MB |
| `landscape.jpg` | 1.1 MB |
| `aula.png` | 514 KB |
| `congito.jpg` | 450 KB |
| `supes.png` / `s2022.jpg` / `titans.jpg` / `jack.jpg` | 300–550 KB |

- Batch convert to WebP/AVIF via sharp.
- Move from root `Images/` to `public/`.
- Wire through `next/image` with explicit dimensions + `sizes`.
- Shrink `app/favicon.ico` (248KB) into a proper icon set.

**Exit criteria:** `npm run build` clean, `tsc --noEmit` clean, `lint` clean, tests green.

---

## Phase 1.5 — Time-of-Day Sky Hero (Tier 3)

Must land before Phase 2, because the sky owns hero surface tokens. Do not build the page-chrome theme tokens until this defines who owns the hero's colors.

### 1.5.0 Bugs being fixed
Current `app/components/hero.tsx` has four defects:
1. **Mojibake in greeting strings** — `hero.tsx:18` `'Good Afternoon! dYO�,?'` and `hero.tsx:21` `'Good Evening! dYO�'`. Corrupted UTF-8 bytes are live on the site.
2. **Flash of wrong color** — gradient is React state initialised to `blue-500 → purple-600`; `useEffect` swaps it after first paint. Every visitor sees the wrong sky first.
3. **Contrast failure** — morning phase is `yellow-400 → orange-500` with `text-gray-800` (~3.1:1, fails WCAG AA).
4. **Four coarse buckets, hard cuts** — `<12 / 12–18 / 18–20 / 20+`. No dawn, no golden hour, instant swaps.

### 1.5.1 Architecture — CSS variables, not class strings
Root problem is storing Tailwind class strings in state. Replace entirely with CSS custom properties set on `<html>`.

- Inline `<head>` script runs **before paint** → no flash, no hydration mismatch.
- Component needs no state for the sky.
- No-JS fallback: `@media (prefers-color-scheme)` supplies a valid sky.
- Note under Tailwind v4 `bg-gradient-to-r` is renamed `bg-linear-to-r`; the 4 hardcoded gradient strings break on upgrade anyway.

### 1.5.2 Solar position (NOAA algorithm)
~30 lines computing true sun altitude + azimuth from date, time, lat, lon. Gives genuine civil twilight, a golden-hour window that moves with the season, and blue hour after sunset. A visitor in Oslo in December gets a sky matching their latitude, not Nairobi's.

### 1.5.3 Layered rendering
- **Sky gradient** — keyframe stops across dawn / morning / midday / afternoon / golden / dusk / night, interpolated rather than snapped.
- **Sun disc** — arcs along real azimuth/altitude path.
- **Moon** — separate arc, appears as sun drops below horizon.
- **Stars** — opacity driven by solar depression angle; fade in through civil/nautical twilight, full by astronomical night.
- **Horizon glow** — tracks solar azimuth, warms at low sun angles.

### 1.5.4 Coordinate strategy
- Sky defaults to **Nairobi** coords — zero friction, no permission prompt on load.
- Clock uses **visitor's own timezone** via `Intl.DateTimeFormat`.
- Optional "use my location" button for visitors who want their own sky.

### 1.5.5 Contrast — solved structurally
Each phase declares its **own** foreground colour token. Text contrast is guaranteed per-phase rather than hoping `dark:` variants line up with a time-based gradient. Fixes the orange-on-dark-gray failure at source.

### 1.5.6 Theme interaction (critical)
The site currently has only `@media (prefers-color-scheme: dark)`. A near-black night sky plus a user-forced light theme produces a white hero on a black sky. **Decision: the sky owns hero surface colours; the Phase 2 theme toggle controls page chrome only.** Document this boundary so the two systems cannot fight.

### 1.5.7 Performance
Sky is full-viewport and always animating. Budget is strict:
- Animate only `transform` and `opacity`. No layout-triggering properties.
- Throttle solar recomputation to ~1/min, not per-frame. Interpolate in CSS between updates.
- `will-change` applied only while animating.
- Star field rendered once to a static layer, not per-frame DOM churn.

### 1.5.8 Reduced motion
`prefers-reduced-motion: reduce` → collapse **all** sky animation to a single static gradient matching current phase. Phase still computed correctly; only motion is removed.

### 1.5.9 Correctness
Phase-boundary crossing must re-evaluate on time elapsed, not only on next interval tick. Align tick to the minute.

**Exit criteria:** no mojibake; no first-paint flash; WCAG AA contrast at all hours and all seasons; reduced-motion path verified; solar math unit-tested against known fixtures (equinox/solstice, Nairobi solstices); no CLS from hero content.

---

## Phase 1.6 — 3D Scene & Lighting

**Foundation already exists:** portfolioo2 runs `@react-three/fiber` v9, `@react-three/drei` v10, and `@react-three/postprocessing` v3 on React 19.2. **Port that stack rather than re-deriving it.** Version-align with the Phase 1.1 upgrade.

### 1.6.1 Architecture decision — 3D augments CSS, does not replace it
**Phase 1.5's CSS sky remains the base layer.** The 3D layer is a separate canvas composited above it.

Rationale: the CSS sky is nearly free, paints instantly, works with JS disabled, and guarantees readable text contrast. Replacing it with a WebGL scene would put hero LCP and accessibility behind a GPU context. Layering keeps the SEO/contrast/robustness guarantees intact while still delivering real 3D.

- CSS sky: background, gradient, stars (static layer), horizon glow.
- R3F canvas: celestial bodies, volumetric/atmosphere effects, depth.
- Hero **text stays in the DOM**, not in the canvas — so it remains selectable, screen-reader accessible, and indexable.

### 1.6.2 Lighting model
Real lights derived from the same solar altitude/azimuth Phase 1.5 computes:
- **Directional key light** — position and colour from solar azimuth/altitude. Warm and low at golden hour, neutral and high at midday, absent at night.
- **Ambient/hemisphere fill** — sky colour from above, ground bounce from below, intensity falling with solar elevation.
- **Moon light** — cool, dim directional source active only when sun is below horizon.
- Colour temperature shifts across the day (warm ~2000K at horizon → neutral ~6500K at midday). This is what sells "proper lighting" more than geometry does.

### 1.6.3 Scene contents
- Sun disc with bloom, position on true solar arc.
- Moon with phase-correct illumination.
- Cloud/atmosphere layer with light scattering.
- Optional distant terrain silhouette for parallax depth.

### 1.6.4 Performance budget (non-negotiable)
The hero is full-viewport and always rendering. A WebGL canvas here is the single biggest Lighthouse risk in the project.

- **`dpr` clamped to `[1, 1.5]`** — hard cap. Never `devicePixelRatio` uncapped.
- **Frame rate cap ~30fps** by default; drop to static below that.
- **Pause on visibility loss** (`document.visibilitychange`) and when scrolled out of view (`IntersectionObserver`). A hero rendering frames while off-screen is pure waste.
- **Postprocessing is the expensive part** — bloom only. No heavy stack. Measure before adding passes.
- **Degrade ladder:** full scene → no postprocessing → static gradient. Auto-downgrade on sustained low framerate, not just on user agent sniffing.
- WebGL context-loss handler with CSS-sky fallback.
- Lazy-mount the canvas after first paint so it never blocks LCP.

### 1.6.5 Reduced motion & fallback
- `prefers-reduced-motion: reduce` → canvas never mounts; CSS sky alone.
- No WebGL support → CSS sky alone.
- Low-power/battery saver hint → static frame.

### 1.6.6 Accessibility
- `<canvas>` is `aria-hidden` — it is decorative. All meaningful content is in the DOM.
- Text contrast guaranteed by the CSS layer regardless of what the 3D scene is doing behind it.

**Exit criteria:** no measurable LCP regression vs the CSS-only baseline; 30fps sustained on mid-range hardware; canvas fully paused when off-screen or hidden; reduced-motion and no-WebGL paths verified; text contrast passes AA even at worst-case sky phase.

---

## Phase 1.7 — Persistent Scroll Background (Beach / Street)

### 1.7.1 Behaviour
- **Sky** on load, then on scroll the background **recedes toward the horizon and remains visible behind all page content** until the footer.
- **Day:** beach — sand, umbrellas, water.
- **Night:** busy street — lit, populated, motion.
- The sky never fully leaves. Ground scene fades up beneath it as you scroll.

### 1.7.2 Camera model — descent from altitude to ground level
The page is one continuous **vertical descent**. Not a background that scrolls past — the camera physically falls, and the world rises to meet it.

- Scroll progress `0 → 1` maps to **camera altitude**, high → ground level.
- **At `0` (load / hero):** camera at altitude. Looking down. World reads as aerial — terrain is small, the horizon sits high, sun/moon are distant discs.
- **At `1` (footer):** camera at eye level (~1.6–1.7 units, human height). Horizon sits at the correct eye-level line. Sun/moon are at their smallest, sitting just above the horizon.

**Apparent-scale model — the core of the illusion:**
- Sun/moon are treated as **effectively infinite distance**. As the camera descends they shrink toward a small disc and rise toward the horizon line. They **never leave frame** — persistent through the entire scroll.
- Ground geometry is **finite** (a few hundred units). It grows in frame as the camera approaches, passing overhead and sliding out.
- The *difference* between those two behaviours is what reads as descent. If both scaled the same way it would read as flying away.
- Celestial bodies shrink asymptotically but must never reach zero — keep a legible disc at ground level.

**Required for it to read correctly:**
- **Aerial perspective / haze** — distance fog that is strong at altitude and settles to a thin band at the horizon by the footer. Without this the descent has no depth cue and looks like a flat zoom.
- **Pitch compensation** — camera look-angle adjusts as altitude drops so the horizon converges on eye level rather than drifting.
- **Parallax on foreground props** (umbrellas, street furniture) to anchor scale — the nearest objects must sweep past fastest.
- **Altitude easing** — non-linear curve. Fast at first, settling as it approaches ground, so the footer arrival feels like a landing, not a stop.

### 1.7.3 Scroll mechanics
- Scroll drives a **single normalised altitude value** across the whole page — never per-section timers.
- Value drives: camera position + pitch, fog density, sun/moon apparent scale, ground detail fade-in, near-plane/far-plane, DOF if used.
- **Ground selection is time-driven, not scroll-driven:** day → beach, night → street. Both are traversed by the same descent.
- Evening/night **transition band** needs a defined cross-fade window so day→street is not a hard cut.
- **IntersectionObserver per section** to pause the 3D layer when off-screen. The background persists visually; it does not need to keep rendering.
- Progress driven by `IntersectionObserver` + `transform` only. No layout-triggering scroll handlers, no per-frame `getBoundingClientRect`.
- Camera easing via damped interpolation in `useFrame` — never a raw linear lerp off scroll value, which reads as mechanical.

### 1.7.4 Asset sourcing — CC0 only
Verified available:

| Source | Assets | Licence |
|---|---|---|
| **Poly Haven** (869 textures, 521 models) | `coast_sand_01–05`, `aerial_beach_01–03`, `asphalt_01–07`, `clean_asphalt`, `concrete`, `cobblestone_embedded_asphalt`, modular street seating, chairs, lamps | CC0 |
| **Kenney** | City Kit (Roads), Tiny Farm, Skyboxes, Mini Forest, Pattern Pack Extra | CC0 |
| **Poly Haven HDRI** | Sky lighting for both scenes | CC0 |

- **All CC0.** No attribution obligation, no licensing risk. Record sources + licences in `public/assets/CREDITS.md`.
- **Textures ship small:** pick 1K/2K, normal maps only where they read, compressed to KTX2 if budget allows.
- **Models:** prefer procedural/low-poly over downloaded meshes. Kenney City Kit + a handful of Poly Haven props likely beats sourcing dozens of unique assets — a beach and a street can both be assembled from a small kit plus instancing.
- Umbrellas are not in either library — likely procedural or a single authored low-poly asset.

### 1.7.5 Performance budget (the real risk)
This is the heaviest item in the project. A persistent full-viewport scene that never stops rendering is the fastest way to destroy a Lighthouse score.

- **Single canvas for the entire page**, not one per section. It mounts once and persists to the footer.
- `dpr` clamped `[1, 1.5]`, 30fps cap.
- **Render-on-demand:** pause when hero out of view, when tab hidden, and when scroll is idle. Continuous idle rendering is never acceptable.
- **Instancing** for umbrellas, street props, repeated geometry. Never per-object draw calls for repeated items.
- **Both scenes are not in memory at once.** Beach and street load/evict on transition, or ship as one low-LOD base with swapped dressing.
- Postprocessing: bloom only. Re-measure before adding passes.
- **Degrade ladder:** full → no postprocessing → static CSS gradient → flat colour.
- Hard rule: **if this cannot hold 60fps scroll on mid-range hardware while preserving LCP, cut scene detail — never cut the text/content layer.**

### 1.7.6 Content legibility (non-negotiable)
All page content sits **over** this background for the entire page.
- Content panels get a **backdrop-blur + translucent surface token**, or
- A **scroll-driven scrim** that darkens/tints the scene behind text blocks.
- Verify WCAG AA contrast for every text/background pair **at both day and night**, including scene transitions.
- Never rely on the scene being dark enough by luck.

### 1.7.7 Lighting under a moving camera
- **Shadow camera must track the descending camera.** A directional light's shadow frustum sized for altitude will lose shadow resolution entirely by ground level, or clip.
- **Near/far planes must adapt** to the altitude range — a single fixed frustum either wastes depth precision at altitude or clips the ground at the footer.
- **Specular/lobe behaviour changes with viewing angle** — verify wet-sand and wet-asphalt highlights still read once the camera is low.
- **Ambient occlusion** anchored to ground contact; it must strengthen as the camera descends or props will appear to float.

### 1.7.8 Fallbacks
- `prefers-reduced-motion: reduce` → static gradient backdrop, no canvas.
- No WebGL → CSS gradient beach/street tones, still thematic.
- Asset load failure → scene renders as sky + ground plane only, never blocks content.

**Exit criteria:** continuous descent from altitude to ground level across hero→footer; sun/moon persistent in frame throughout, shrinking but never vanishing; day/night correct at any hour; no text-contrast failure at any scroll position or time of day; 60fps scroll sustained on mid-range hardware; LCP not regressed; canvas idles when scroll is idle.

---

**Phase 1.5 depends on:** Phase 1 (Tailwind v4, for `bg-linear-to-*` naming).
**Phase 1.6 depends on:** Phase 1.5 (solar math is the shared input) and Phase 1 (React 19 alignment for R3F v9).
**Phase 1.7 depends on:** Phase 1.6 (extends the same canvas and scene) and Phase 1.5 (time-of-day drives scene selection).
**Phase 2 depends on:** Phase 1.5 (hero surface token ownership), and must now include translucent/scrim surface tokens for Phase 1.7.

---

## Phase 2 — Design System

### 2.1 Palette
- Base `#08090C` family; elevated surfaces in 3 steps; hairline borders.
- Single primary accent. Candidates: electric lime `#C8FF4D` or cyan `#3DF5D0`. One becomes primary, the other reserved as a rare data-viz accent. **Decision pending.**
- Every colour a token. Zero raw `gray-50` / `blue-600` utility classes remain.

### 2.2 Typography
- Display face + mono face + Inter for body, all via `next/font/google` with `display: swap`.
- Fluid `clamp()`-based scale.
- Strict 8px vertical rhythm.

### 2.3 Motion
- One easing curve, one duration scale.
- Global `prefers-reduced-motion` handling.
- Marquee/reveal effects only where they earn attention.

### 2.4 Theme toggle
- Dark and light both ship, tokens defined for each.
- `localStorage` persistence, no flash-of-wrong-theme on load.
- **Scope boundary (see Phase 1.5.6):** the theme toggle controls **page chrome only**. The hero sky owns its own surface tokens and is NOT affected by the toggle. Without this boundary, a light theme over a night sky produces a white hero on a black background.

**Exit criteria:** every surface renders from tokens; contrast passes WCAG AA; no FOUC on theme change; sky and theme toggle verifiably non-interfering.

---

## Phase 3 — Architecture

### 3.1 Server-first rendering
- `app/page.tsx` currently declares `"use client"` at the root — the entire page ships as JS. Convert to a Server Component.
- Client components limited to: header nav, theme toggle, contribution calendar, and any genuine interaction.

### 3.2 Routes
| Route | Contents |
|---|---|
| `/` | Hero, about, featured work, stack, contributions, contact |
| `/gear` | Rebuilt — keep PC build (`pc.tsx`, `pc2.tsx`) and peripherals (`gaminggear.tsx`) |
| `/favourites` | Rebuilt — keep media picks (`faves.tsx`) |
| `/projects/[slug]` | New — generated deep-dive per repo from build-time data |

### 3.3 Remove fake preloaders
- `preloader.tsx` / `gamingloader.tsx` / `favesloader.tsx` all block for a hardcoded `setTimeout(2000)` regardless of whether anything loaded. Replace with real loading boundaries (Suspense) or delete.

### 3.4 Accessibility fixes
- Replace scroll-to-top `div onClick` with a real `<button>` (keyboard operable, correct ARIA).
- Hero currently renders **two `<h1>` elements**.
- Hero profile image has `alt="Your Profile Picture"`.
- ~~Fix mojibake in `hero.tsx`~~ → handled in Phase 1.5.0.
- Hero becomes a Server Component; the sky script is the only client-side piece.

**Exit criteria:** `jest-axe` clean on all routes; one `h1` per page; no keyboard traps.

---

## Phase 4 — Project Data (Build-Time GitHub Fetch)

### 4.1 Script
- `scripts/fetch-repos.mjs` — hits GitHub API once during build.
- Reads `GITHUB_TOKEN` from env (optional; works unauthenticated at lower rate limit).
- Writes typed `src/data/repos.ts`.
- Fails soft: if the fetch fails, build continues against last known good data.

### 4.2 Captured fields
Stars, primary language, byte-accurate language breakdown, topics, license, last-push date, homepage URL, description, README excerpt.

### 4.3 Featured project selection
Ordered by strength of material, not by recency:

1. **`nexus`** — Evidence-driven AI SRE agent for homelabs. Python, MIT, 2 stars, 14 topics, best README on the account.
2. **`resu-clean`** — Self-hosted ATS resume toolkit. C#, MIT, 1 star.
3. **`kifaru`** — Transaction reliability platform in Rust. 87 passing tests, ~90% complete. Surface the honest progress badge — the restraint in its README is the interesting part.
4. **`atlas`** — Go. Full open-source hygiene: CHANGELOG, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, docs, Dockerfile.
5. **`neo-learn`** — Go. Offline-capable learning platform, SMS/SIM as transport layer.
6. **`mfalme0-GSI`** — Python. Seven game integrations, tests, theming.
7. **`open-zengee`** — Python. WLED/tuya LED controller suite.
8. **`homelab`** — Infrastructure documentation.
9. `takeaway-EAeye`, `Archiewebapp`, `ndai.com`, `archie` — archive tier.

### 4.4 Dead links to remove
- `mfalme0/ganji` → **404**
- `mfalme0/betterFarm` → **404**

Both are currently linked from `app/components/Projects.tsx` as live projects. `monies` exists ("what ganji and mullah wishes they could be") but is not a substitute.

**Exit criteria:** `src/data/repos.ts` generates deterministically; zero 404 repo links in rendered output.

---

## Phase 5 — Sections

| Section | Notes |
|---|---|
| Hero | Rebuilt entirely in Phase 1.5 — real solar sky. Fix duplicate `h1` and alt text. New copy pending. |
| Featured Work | 2–3 hero projects, larger treatment than the grid |
| Repo Grid | All non-forked repos, filterable by language |
| Stack | Rebuilt from real byte-count language data. Replace self-assessed "Expert/Advanced/Intermediate" labels — they are unverifiable. Include Go, Rust, Svelte, MDX, PL/pgSQL, which the current site omits entirely. |
| Contributions | Fix the `min-w-[1200px]` wrapper forcing horizontal page scroll |
| Contact | Rebuilt |
| Footer | Rebuilt |
| Gear page | Keep content, rebuild presentation |
| Favourites | Keep content, rebuild presentation |

**Real language distribution (bytes, non-forked repos):**
TypeScript 1,234,686 · C# 802,116 · Go 640,842 · Python 553,836 · HTML 328,746 · JavaScript 282,460 · Rust 214,604 · Svelte 202,961 · MDX 147,780 · CSS 110,294 · PL/pgSQL 23,872 · C++ 21,286 · Makefile 5,451 · Dockerfile 1,026

---

## Phase 6 — Ship Quality

- Per-route `metadata`; current root metadata is `description: "Generated by create next app"`.
- OG + Twitter cards, generated OG image component.
- `sitemap.xml`, `robots.txt`, web manifest.
- Full icon set replacing the 248KB favicon.
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:coverage`.
- GitHub Actions: lint → typecheck → test → build.
- `gitleaks` step in CI so committed secrets never recur.

---

## Open Questions

1. **Bio / hero copy** — cannot be invented. Current text: *"Welcome to my digital portfolio. A space where creativity meets technology, and innovation comes to life."* Need the actual voice and the one line someone should remember. **This now also determines the greeting string**, so it blocks Phase 1.5 sign-off, not just Phase 5.
2. **Accent colour** — lime `#C8FF4D` or cyan `#3DF5D0`. Will pick if no preference. **Constraint from Phase 1.5:** the accent must stay legible against every sky phase, including bright midday and golden hour. Cyan reads better against warm sunset tones; lime reads better against night. Likely needs two accent variants, one per sky family, rather than one.
3. **Cross-link** — should this site link out to `portfolioo2` as the "main" portfolio?
4. **Sky coords** — Nairobi default is assumed. Confirm, or say where you'd rather it default to.
5. **3D intensity** — Phase 1.6 as written is a *sky* scene (celestial bodies, atmosphere, lighting). Should the 3D extend into the page body as well, e.g. a reactive 3D object per project card or a 3D rig showcase on `/gear`? That is a materially larger scope and a much bigger performance surface.
6. **Beach vs street switch behaviour** — currently planned as: beach by day, street at night, with a cross-fade band at dusk/dawn. Alternatives: (a) blend between them as a *scroll* journey regardless of time, (b) let the visitor toggle, (c) make the street the default with beach as the calm variant. Worth confirming before build.
7. **Start altitude** — how high does the visitor begin? Roughly 200–400 units reads as "high above the world"; higher reads as orbital/abstract and may not suit a personal portfolio. Aesthetic call, low risk to change.
8. **Asset download approval** — user has authorised fetching assets. All planned sources are **CC0** (Poly Haven, Kenney). Downloads happen during implementation, into `public/assets/`, with `CREDITS.md` recording source + licence.

---

## Ordering Constraints

- **Phase 0 first.** The history rewrite changes every commit SHA; doing it later means every subsequent commit inherits the rewrite.
- **Phase 1.5 before Phase 2.** The sky owns hero surface tokens. Building page-chrome theme tokens first guarantees the two token systems collide.
- **Phase 1 before Phase 1.5.** Tailwind v4 renames `bg-gradient-to-r` → `bg-linear-to-r`; the current hardcoded gradient strings need touching during the upgrade regardless.

```
0 (security) → 1 (stack) → 1.5 (solar sky + math) → 1.6 (3D scene + lighting) → 1.7 (scroll background) → 2 (design system) → 3 (architecture) → 4 (project data) → 5 (sections) → 6 (ship quality)
```

**1.5 / 1.6 / 1.7 are one continuous system.** 1.5 computes the sun, 1.6 renders it in 3D, 1.7 extends that same scene into a scroll-reactive beach/street backdrop. Build them as one unit against a single canvas — not three independent layers.

**1.5 and 1.6 share one input:** the solar altitude/azimuth computation. Build it once, correctly, unit-tested — 1.6 consumes it rather than re-deriving.