import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneMood } from "@/lib/sky";

/**
 * Ground scenery.
 *
 * Finite geometry, deliberately: this is the other half of the descent
 * illusion. The ground grows in frame and passes overhead as the camera falls,
 * while the sun and moon shrink. That contrast is what the eye reads as
 * descending rather than flying away.
 *
 * Surfaces use real CC0 PBR textures (see public/assets/CREDITS.md) rather
 * than flat colour. The difference is not subtle — wet sand catching the sky
 * and asphalt with a normal map are what make this read as a photograph
 * rather than a programmer demo.
 *
 * Both moods are built from the same kit and instanced. Beach and street never
 * exist in memory at the same time.
 */

interface TerrainProps {
  mood: SceneMood;
  /** 0..1 daylight, drives all colour and material response. */
  daylight: number;
}

/**
 * Ground tessellation. The plane spans 2800 units; 160 segments gives ~17.5
 * units per quad, which is fine for dunes seen from 78 units up. Raising it
 * further costs vertices for detail the fog eats anyway.
 */
const GROUND_SEGMENTS = 160;
/**
 * Texture repeat across the whole ground. On a 2800-unit plane a low repeat
 * makes the sand visibly blurry; this keeps roughly 82 units of world per
 * tile, which matches how the normal map was authored.
 */
const SAND_TILE = 34;

/** Textures per mood. Only one set is ever loaded. */
const TEXTURES = {
  beach: {
    diffuse: "/assets/textures/beach-sand_diff.webp",
    normal: "/assets/textures/beach-sand_nor_gl.webp",
    roughness: "/assets/textures/beach-sand_rough.webp",
    // Base colours of the sand textures, used for tinting.
    day: "#E8D6AE",
    night: "#2B2A32",
    roughnessDay: 0.88,
    roughnessNight: 0.92,
  },
  street: {
    diffuse: "/assets/textures/street-asphalt_diff.webp",
    normal: "/assets/textures/street-asphalt_nor_gl.webp",
    roughness: "/assets/textures/street-asphalt_rough.webp",
    day: "#4A4E58",
    night: "#1A1C24",
    roughnessDay: 0.55,
    roughnessNight: 0.32, // Wet asphalt at night is glossier than dry by day
  },
} as const;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Low-frequency rolling terrain, deterministic per mood.
 *
 * The wave numbers are tuned for a 1400-unit ground. At the previous 340
 * they produced visible ripples; at 1400 the same values give a landscape
 * rather than a crumpled sheet, which is what a beach needs — dunes should
 * read as long and smooth.
 */
function heightAt(x: number, z: number, mood: SceneMood): number {
  const seedOffset = mood === "beach" ? 0 : 137.5;
  const a = Math.sin(x * 0.0031 + seedOffset) * Math.cos(z * 0.0027);
  const b = Math.sin(x * 0.0074 + 1.3) * Math.cos(z * 0.0061 + 0.7);
  const c = Math.sin((x + z) * 0.0012 + 2.1);

  // Beach is nearly flat with a long dune swell. Street is flatter still,
  // with a slight camber toward the horizon.
  const weight = mood === "beach" ? 3.2 : 1.1;
  return (a * weight + b * 0.8 + c * 5.5) * (mood === "beach" ? 1 : 0.5);
}

/**
 * Loads a texture set, with every map configured for tiling and colour space.
 *
 * Colour space is the detail that matters most here: diffuse maps must be
 * sRGB, while normal and roughness maps are data and must be left linear.
 * Getting this wrong makes the ground either washed out or overly contrasty.
 */
function useTextureSet(mood: SceneMood) {
  const [set, setSet] = useState<{
    map: THREE.Texture;
    normalMap: THREE.Texture;
    roughnessMap: THREE.Texture;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const config = TEXTURES[mood];
    let cancelled = false;

    const load = (url: string, srgb: boolean) =>
      new Promise<THREE.Texture>((resolve) => {
        loader.load(
          url,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(SAND_TILE * 4, SAND_TILE * 4);
            texture.anisotropy = 4;
            // Colour space is the detail that matters most here: diffuse maps
            // are sRGB colour data, while normal and roughness maps are raw
            // data and must stay linear. Getting this wrong washes the ground
            // out or over-contrasts it.
            if (srgb) {
              texture.colorSpace = THREE.SRGBColorSpace;
            }
            resolve(texture);
          },
          undefined,
          () => resolve(null as unknown as THREE.Texture),
        );
      });

    // Three.js reads roughness from the green channel of a standard ORM map,
    // which is what Poly Haven's Rough output is.
    Promise.all([
      load(config.diffuse, true),
      load(config.normal, false),
      load(config.roughness, false),
    ]).then(([map, normalMap, roughnessMap]) => {
      if (cancelled) return;
      if (map && normalMap && roughnessMap) {
        setSet({ map, normalMap, roughnessMap });
      }
    });

    return () => {
      cancelled = true;
      // Dispose on mood change or the GPU leaks a full texture set each time.
      setSet((prev) => {
        if (prev) {
          prev.map.dispose();
          prev.normalMap.dispose();
          prev.roughnessMap.dispose();
        }
        return null;
      });
    };
  }, [mood]);

  return set;
}

export function Terrain({ mood, daylight }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const textures = useTextureSet(mood);
  const config = TEXTURES[mood];

  const geometry = useMemo(() => {
    // 2800 units across. Sized so the far edge is hidden by fog from the
    // start altitude — see the camera invariants test.
    const geo = new THREE.PlaneGeometry(
      GROUND_RADIUS * 2,
      GROUND_RADIUS * 2,
      GROUND_SEGMENTS,
      GROUND_SEGMENTS,
    );
    geo.rotateX(-Math.PI / 2);

    const position = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      position.setY(i, heightAt(x, z, mood));
    }
    position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [mood]);

  // Tint and roughness interpolate with daylight so the ground always agrees
  // with the light falling on it. Wet asphalt at night is glossier than dry
  // asphalt by day, which is a real effect and reads well.
  useFrame(() => {
    const material = materialRef.current;
    if (!material) return;

    const day = new THREE.Color(config.day);
    const night = new THREE.Color(config.night);
    material.color.copy(night.clone().lerp(day, daylight));
    material.roughness = THREE.MathUtils.lerp(
      config.roughnessNight,
      config.roughnessDay,
      daylight,
    );
    // A touch of environment reflection keeps the ground from going flat.
    material.envMapIntensity = 0.35 + daylight * 0.4;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        ref={materialRef}
        map={textures?.map}
        normalMap={textures?.normalMap}
        roughnessMap={textures?.roughnessMap}
        normalScale={new THREE.Vector2(1.4, 1.4)}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

/**
 * Instanced props — umbrellas by day, street furniture by night.
 *
 * One InstancedMesh per prop type regardless of count. This is the single
 * most important performance decision in the scene: 60 umbrellas drawn as 60
 * separate meshes is 60 draw calls and will not hold frame rate on mobile.
 */
interface PropsProps {
  mood: SceneMood;
  daylight: number;
  count?: number;
}

const BEACH_PROPS = {
  count: 54,
  colorDay: "#E2574B",
  colorNight: "#3A2E30",
  metal: 0.0,
  rough: 0.7,
};

const STREET_PROPS = {
  count: 72,
  colorDay: "#4A505E",
  colorNight: "#2A2F3C",
  metal: 0.55,
  rough: 0.45,
};

export function SceneryProps({ mood, daylight }: PropsProps) {
  const beachRef = useRef<THREE.InstancedMesh>(null);
  const spec = mood === "beach" ? BEACH_PROPS : STREET_PROPS;

  // Umbrellas are a hexagonal canopy on a pole — recognisable, cheap, and
  // readable at the distances the camera actually sees them from.
  const geometry = useMemo(() => {
    const canopy = new THREE.ConeGeometry(2.6, 1.5, 6, 1, true);
    canopy.translate(0, 3.1, 0);
    const pole = new THREE.CylinderGeometry(0.07, 0.07, 3, 6);
    pole.translate(0, 1.5, 0);

    const merged = new THREE.BufferGeometry();
    // Manual merge — avoids pulling in the addons build for two primitives.
    const canopyPos = canopy.getAttribute("position").array as Float32Array;
    const polePos = pole.getAttribute("position").array as Float32Array;
    const canopyNor = canopy.getAttribute("normal").array as Float32Array;
    const poleNor = pole.getAttribute("normal").array as Float32Array;
    const positions = new Float32Array(canopyPos.length + polePos.length);
    positions.set(canopyPos, 0);
    positions.set(polePos, canopyPos.length);
    const normals = new Float32Array(canopyNor.length + poleNor.length);
    normals.set(canopyNor, 0);
    normals.set(poleNor, canopyNor.length);

    merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    merged.computeBoundingSphere();
    return merged;
  }, []);

  const material = useMemo(() => {
    const day = new THREE.Color(spec.colorDay);
    const night = new THREE.Color(spec.colorNight);
    return new THREE.MeshStandardMaterial({
      color: day.clone().lerp(night, 1 - daylight),
      roughness: spec.rough,
      metalness: spec.metal,
      side: THREE.DoubleSide,
    });
  }, [spec, daylight]);

  const matrices = useMemo(() => {
    const rand = mulberry32(mood === "beach" ? 20260922 : 19700101);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < spec.count; i++) {
      // Props are anchored to the camera's resting position, not spread across
      // the whole ground. At a 1400-unit ground radius a fractional spread
      // put umbrellas 700+ units away — invisible specks. These cluster in
      // the band the camera actually looks at during the descent.
      const angle = rand() * Math.PI * 2;
      const distance = 90 + Math.pow(rand(), 0.7) * 520;

      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      dummy.position.set(x, heightAt(x, z, mood), z);
      dummy.rotation.set(0, rand() * Math.PI * 2, 0);
      dummy.scale.setScalar(0.75 + rand() * 0.6);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [mood, spec.count]);

  const targetRef = beachRef;

  useFrame(() => {
    const mesh = targetRef.current;
    if (!mesh) return;
    // Guard so the matrices are only uploaded once, not every frame.
    if (mesh.userData.applied === matrices.length) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.applied = matrices.length;
  });

  if (mood !== "beach") return null;

  return (
    <instancedMesh
      ref={beachRef}
      args={[geometry, material, spec.count]}
      castShadow={false}
      receiveShadow
      frustumCulled={false}
    />
  );
}

/** Street lighting is emissive geometry, so it reads at night without lights. */
export function StreetLights({ daylight }: PropsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 26;

  const geometry = useMemo(() => {
    const post = new THREE.CylinderGeometry(0.06, 0.1, 4.4, 6);
    post.translate(0, 2.2, 0);
    return post;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2A2E38").lerp(
        new THREE.Color("#4A5160"),
        daylight,
      ),
      emissive: new THREE.Color("#FFD79A"),
      // Night brings the lamps up; they are invisible in daylight.
      emissiveIntensity: 0.15 + (1 - daylight) * 2.4,
      roughness: 0.5,
      metalness: 0.4,
    });
  }, [daylight]);

  const matrices = useMemo(() => {
    const rand = mulberry32(555);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.12;
      const distance = 90 + rand() * 460;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      dummy.position.set(x, heightAt(x, z, "street"), z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || mesh.userData.applied === matrices.length) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.applied = matrices.length;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}

export { GROUND_SEGMENTS, heightAt };

/**
 * Ground half-extent in world units.
 *
 * Must stay >= START_ALTITUDE by a wide margin. The ground has to extend
 * beyond the fog horizon from the camera's highest point, or its edge
 * resolves into a hard line against the sky and the world reads as a slab
 * floating in space.
 */
export const GROUND_RADIUS = 1400;