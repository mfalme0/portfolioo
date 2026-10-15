import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneMood } from "@/lib/sky";

/**
 * Beach flora.
 *
 * A beach with nothing on it beyond umbrellas reads as an empty plane. Trees
 * at the dune line give the scene depth, scale, and a silhouette — they are
 * what tells the eye how far away the horizon is.
 *
 * Pines are built from stacked cones rather than imported meshes: cheaper,
 * instanced, and no asset to download or license.
 */

interface FloraProps {
  mood: SceneMood;
  daylight: number;
  radius: number;
  count?: number;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Merged cone-stack pine. Trunk plus three tapering tiers. */
function pineGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const trunk = new THREE.CylinderGeometry(0.16, 0.26, 2.4, 6);
  trunk.translate(0, 1.2, 0);
  parts.push(trunk);

  // Three tiers, narrowing upward. The overlap is what gives a pine its
  // layered silhouette rather than reading as a single cone.
  const tiers = [
    { radius: 2.0, height: 3.4, y: 2.6 },
    { radius: 1.55, height: 3.2, y: 4.4 },
    { radius: 1.0, height: 2.8, y: 6.0 },
  ];

  for (const tier of tiers) {
    const cone = new THREE.ConeGeometry(tier.radius, tier.height, 7, 1);
    cone.translate(0, tier.y + tier.height * 0.35, 0);
    parts.push(cone);
  }

  return mergeGeometries(parts);
}

/**
 * Minimal geometry merge. Avoids pulling in the addons build just to combine
 * four primitives.
 */
function mergeGeometries(
  geometries: THREE.BufferGeometry[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];

  for (const geometry of geometries) {
    const positionArray = geometry.getAttribute("position").array as Float32Array;
    const normalArray = geometry.getAttribute("normal").array as Float32Array;
    for (let i = 0; i < positionArray.length; i++) positions.push(positionArray[i]!);
    for (let i = 0; i < normalArray.length; i++) normals.push(normalArray[i]!);
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.computeBoundingSphere();
  return merged;
}

export function Pines({ mood, daylight, radius, count = 46 }: FloraProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => pineGeometry(), []);

  const material = useMemo(() => {
    // Pines keep some saturation at night rather than going pure black —
    // a silhouette needs *some* value to read against the sky.
    const day = new THREE.Color("#2F4A34");
    const night = new THREE.Color("#141E20");
    return new THREE.MeshStandardMaterial({
      color: day.clone().lerp(night, 1 - daylight),
      roughness: 0.94,
      metalness: 0,
      flatShading: true,
    });
  }, [daylight]);

  const matrices = useMemo(() => {
    const rand = mulberry32(31337);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;

      // Clustered into the back arc rather than scattered evenly. Trees behind
      // and beside the camera form a silhouette band at the horizon; trees in
      // the foreground just block the view of the sea.
      const spread = Math.PI * 1.25;
      const theta = Math.PI * 0.5 + (rand() - 0.5) * spread;

      const distance = radius * (0.42 + rand() * 0.42);
      const x = Math.cos(theta) * distance * 0.9;
      const z = Math.sin(theta) * distance * Math.cos(angle * 0.3);

      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, rand() * Math.PI * 2, 0);
      dummy.scale.setScalar(0.7 + rand() * 0.9);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [count, radius]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    if (mesh.userData.applied === matrices.length) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.applied = matrices.length;
  });

  // Trees exist only at the beach.
  if (mood !== "beach") return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      frustumCulled={false}
      castShadow
      receiveShadow
    />
  );
}

/**
 * Beach grass tufts. Small, dense, and low — they break up the flat sand
 * near the camera where the texture repeat is most visible.
 */
export function BeachGrass({ mood, daylight, radius }: FloraProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 180;

  const geometry = useMemo(() => {
    // A single blade: a narrow tapered plane. Cheap, and at this scale reads
    // as a tuft rather than as a card.
    const blade = new THREE.PlaneGeometry(0.5, 1.4, 1, 2);
    blade.translate(0, 0.7, 0);
    return blade;
  }, []);

  const material = useMemo(() => {
    const day = new THREE.Color("#8A9A5B");
    const night = new THREE.Color("#242C22");
    return new THREE.MeshStandardMaterial({
      color: day.clone().lerp(night, 1 - daylight),
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }, [daylight]);

  const matrices = useMemo(() => {
    const rand = mulberry32(90210);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const distance = radius * (0.18 + Math.pow(rand(), 0.7) * 0.5);
      dummy.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance,
      );
      dummy.rotation.set(0, rand() * Math.PI * 2, (rand() - 0.5) * 0.2);
      dummy.scale.setScalar(0.6 + rand() * 0.8);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [radius]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    if (mesh.userData.applied === matrices.length) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.applied = matrices.length;
  });

  if (mood !== "beach") return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}