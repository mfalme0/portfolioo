# Asset credits

Every texture in this directory is **CC0** — public domain. No attribution is
required, but the sources are recorded here so the provenance is auditable
and so re-fetching is reproducible.

Regenerate with:

```bash
node scripts/fetch-textures.mjs
```

## Textures — [Poly Haven](https://polyhaven.com)

All CC0. Converted from 2K source JPG to 1024px WebP by the fetch script.

| File | Source | Poly Haven asset | Maps |
|---|---|---|---|
| `beach-sand_*.webp` | Poly Haven | [`coast_sand_01`](https://polyhaven.com/a/coast_sand_01) | diffuse, normal, roughness |
| `street-asphalt_*.webp` | Poly Haven | [`asphalt_02`](https://polyhaven.com/a/asphalt_02) | diffuse, normal, roughness |

Total 1.94 MB for 6 maps. An earlier draft shipped four material sets at
3.42 MB; two were never referenced by the scene and were removed rather than
carried as dead weight.

### Map conventions

| Suffix | Meaning | Loaded as |
|---|---|---|
| `_diff` | Albedo / base colour | `map` |
| `_nor_gl` | OpenGL-convention tangent normal map | `normalMap` |
| `_rough` | Perceptual roughness | `roughnessMap` |

Normal maps are **OpenGL** convention (`+Y` up, green channel positive). This
matters: Three.js uses OpenGL convention natively, but many artists assume
DirectX, and a DirectX normal map loaded without a `+Y` flip renders lighting
that looks subtly inverted.

### Quality settings

Per-map WebP quality, because a single setting is wrong for all three:

| Map | Quality | Reason |
|---|---|---|
| diffuse | 82 | Largest file; tolerates compression well |
| normal | 90 | Near-binary data — artefacts show as lighting seams |
| roughness | 88 | Bands visibly below this on large surfaces |

## Models

None. All geometry is procedural (see `src/components/sky/Terrain.tsx`),
instanced, and generated from a seeded PRNG so the scene is identical on every
load and across server and client.

## HDRI

Not currently used. Ambient lighting comes from the computed sky state rather
than an HDRI, which means the environment lighting stays in sync with the
solar position instead of being a fixed sky that disagrees with the time of
day. Poly Haven CC0 HDRIs remain available if that proves insufficient.