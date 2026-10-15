import { useMemo, useRef } from "react";
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
 * Both moods are built from the same kit and instanced. Beach and street never
 * exist in memory at the same time — the inactive one is not rendered at all.
 */

interface TerrainProps {
  mood: SceneMood;
  /** 0 at the top of the page, 1 at the footer. */
  descent: number;
  /** 0..1 daylight, drives all colour and material response. */
  daylight: number;
  radius: number;
}

const GROUND_RADIUS = 340;
const GROUND_SEGMENTS = 96;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Low-frequency rolling terrain, deterministic per mood. */
function heightAt(x: number, z: number, mood: SceneMood): number {
  const seedOffset = mood === "beach" ? 0 : 137.5;
  const a = Math.sin(x * 0.021 + seedOffset) * Math.cos(z * 0.018);
  const b = Math.sin(x * 0.047 + 1.3) * Math.cos(z * 0.041 + 0.7);
  const c = Math.sin((x + z) * 0.008 + 2.1);

  // Beach is nearly flat with a gentle dune swell. Street is flatter still
  // with a slight camber toward the horizon.
  const beachWeight = mood === "beach" ? 1.6 : 0.6;
  return (a * beachWeight + b * 0.35 + c * 2.2) * (mood === "beach" ? 1.2 : 0.5);
}

export function Terrain({ mood, descent, daylight, radius }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      radius * 2,
      radius * 2,
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
  }, [radius, mood]);

  // Beach sand is warm and bright; wet asphalt at night is dark and specular.
  // Both are tinted from the sky's own colours so the ground always agrees
  // with the light falling on it.
  const material = useMemo(() => {
    const sand = new THREE.Color("#D9C39A");
    const sandNight = new THREE.Color("#2A2A32");
    const asphalt = new THREE.Color("#2E3038");
    const asphaltNight = new THREE.Color("#171820");

    const base = mood === "beach" ? sand : asphalt;
    const night = mood === "beach" ? sandNight : asphaltNight;
    const color = base.clone().lerp(night, 1 - daylight);

    return new THREE.MeshStandardMaterial({
      color,
      roughness: mood === "beach" ? 0.92 : 0.42,
      metalness: 0.0,
      // Wet ground at night catches the street lighting.
      envMapIntensity: mood === "beach" ? 0.2 : 0.7,
    });
  }, [mood, daylight]);

  // Ground detail resolves as you descend — a mesh detail budget that scales
  // with altitude would be ideal, but swapping geometry mid-scroll is more
  // expensive than the segments cost, so the segment count is fixed and the
  // fog does the work of hiding distance.
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = -2 + descent * 1.5;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow />
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
  radius: number;
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

export function SceneryProps({ mood, daylight, radius }: PropsProps) {
  const beachRef = useRef<THREE.InstancedMesh>(null);
  const streetRef = useRef<THREE.InstancedMesh>(null);

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
      // Scatter in an annulus so props surround the camera rather than
      // clustering where it lands.
      const angle = rand() * Math.PI * 2;
      const distance = 18 + Math.pow(rand(), 0.65) * radius * 0.55;

      dummy.position.set(
        Math.cos(angle) * distance,
        heightAt(Math.cos(angle) * distance, Math.sin(angle) * distance, mood),
        Math.sin(angle) * distance,
      );
      dummy.rotation.set(0, rand() * Math.PI * 2, 0);
      const scale = 0.75 + rand() * 0.6;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [mood, spec.count, radius]);

  const targetRef = mood === "beach" ? beachRef : streetRef;

  useFrame(() => {
    const mesh = targetRef.current;
    if (!mesh) return;
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
export function StreetLights({ radius, daylight }: PropsProps) {
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
      const distance = 24 + rand() * radius * 0.42;
      dummy.position.set(
        Math.cos(angle) * distance,
        heightAt(Math.cos(angle) * distance, Math.sin(angle) * distance, "street"),
        Math.sin(angle) * distance,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [radius]);

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

export { GROUND_RADIUS, heightAt };