#!/usr/bin/env node
/**
 * Downloads CC0 textures from Poly Haven and optimises them for the scene.
 *
 * Everything here is CC0 — public domain, no attribution required, no
 * licensing risk. Sources are recorded in public/assets/CREDITS.md.
 *
 * Texture budget: 1K for surface detail is plenty at the distances this
 * camera actually works at, and 2K only where the surface fills the frame.
 * Everything is converted to WebP at quality tuned per map type — normal
 * maps tolerate much higher quality than diffuse, and roughness is where
 * banding shows up first.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTURE_DIR = join(__dirname, "..", "public", "assets", "textures");

/** Resolution per asset. Ground fills the frame, so 2K. */
const RESOLUTION = "2k";

/**
 * The texture set. Deliberately minimal: the scene is viewed from a distance,
 * so two good material sets beat a large library of mediocre ones.
 *
 * Every entry here must be referenced by src/components/sky/Terrain.tsx.
 * An earlier draft fetched four sets and shipped 1.5 MB of textures the
 * scene never loaded, which is the exact failure this repo started with.
 */
const ASSETS = [
  { id: "coast_sand_01", role: "beach-sand", maps: ["Diffuse", "nor_gl", "Rough"] },
  { id: "asphalt_02", role: "street-asphalt", maps: ["Diffuse", "nor_gl", "Rough"] },
];

/** KHR-style extension tokens Poly Haven uses for each map. */
const MAP_SUFFIX = {
  Diffuse: "diff",
  nor_gl: "nor_gl",
  Roughness: "rough",
  Rough: "rough",
  AO: "ao",
  Displacement: "disp",
};

const MAP_QUALITY = {
  diff: 82,
  nor_gl: 90,
  rough: 88,
  ao: 80,
  disp: 70,
};

async function download(asset) {
  const files = await (
    await fetch(`https://api.polyhaven.com/files/${asset.id}`)
  ).json();

  const written = [];

  for (const mapKey of asset.maps) {
    const map = files[mapKey];
    if (!map) {
      console.warn(`  ! ${asset.id}: no ${mapKey} map, skipping`);
      continue;
    }

    const sizes = map[RESOLUTION] ?? map["2k"] ?? map["1k"];
    const file = sizes?.jpg ?? sizes?.png;
    if (!file) continue;

    const suffix = MAP_SUFFIX[mapKey] ?? mapKey.toLowerCase();
    const filename = `${asset.role}_${suffix}.webp`;
    const outPath = join(TEXTURE_DIR, filename);

    const response = await fetch(file.url);
    if (!response.ok) {
      console.warn(`  ! ${asset.id}/${mapKey}: HTTP ${response.status}`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Resize to a power-of-two and compress. Surfaces tile at 512px in the
    // scene, so 1024 is the sweet spot between sharpness and memory.
    const quality = MAP_QUALITY[suffix] ?? MAP_QUALITY.diff;

    await sharp(buffer)
      .resize(1024, 1024, { fit: "cover" })
      .webp({ quality, effort: 5 })
      .toFile(outPath);

    const { size } = await import("node:fs").then((fs) =>
      fs.promises.stat(outPath),
    );

    written.push({ filename, size, source: file.url });
    console.log(
      `  ok ${filename.padEnd(34)} ${(size / 1024).toFixed(0).padStart(5)} KB  (from ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
    );
  }

  return written;
}

async function main() {
  await mkdir(TEXTURE_DIR, { recursive: true });

  const manifest = [];

  for (const asset of ASSETS) {
    console.log(`\n${asset.id} -> ${asset.role}`);
    try {
      manifest.push(
        ...(await download(asset)).map((m) => ({
          role: asset.role,
          assetId: asset.id,
          ...m,
        })),
      );
    } catch (error) {
      console.warn(`  ! failed: ${error.message}`);
    }
  }

  await writeFile(
    join(TEXTURE_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  const total = manifest.reduce((a, m) => a + m.size, 0);
  console.log(
    `\n${manifest.length} maps, ${(total / 1024 / 1024).toFixed(2)} MB total`,
  );
}

main();