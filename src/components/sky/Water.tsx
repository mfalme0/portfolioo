import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneMood } from "@/lib/sky";

/**
 * Sea and the wet-sand band.
 *
 * Wet sand is the detail that sells a beach. Dry sand right up to the water
 * reads as a desert; the dark, reflective strip where the tide has soaked in
 * is what makes it read as a shoreline. It is also physically motivated —
 * wet sand genuinely darkens and drops in roughness.
 */

interface WaterProps {
  mood: SceneMood;
  daylight: number;
  /** Sun altitude, used to tint the specular response. */
  sunAltitude: number;
}

export function Sea({ mood, daylight, sunAltitude }: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const geometry = useMemo(() => {
    // The sea extends to the horizon and is hidden by fog before its edge
    // becomes visible. It is NOT sized relative to the ground — an earlier
    // version made it 3x the ground width and it floated 340 units past the
    // sand in empty space, which is why the sea was visible from the top of
    // the page and looked wrong.
    const size = 12600;
    const geo = new THREE.PlaneGeometry(size, size, 128, 128);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Gentle swell. Two crossing wave sets read as ocean rather than as a
  // single sine.
  const vertices = useMemo(() => {
    const g = geometry.clone();
    return g.attributes.position as THREE.BufferAttribute;
  }, [geometry]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const t = clock.getElapsedTime();
    const position = vertices;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const wave =
        Math.sin(x * 0.06 + t * 0.9) * 0.22 +
        Math.sin(z * 0.045 - t * 0.7) * 0.18 +
        Math.sin((x + z) * 0.03 + t * 0.45) * 0.14;
      position.setY(i, wave);
    }
    position.needsUpdate = true;

    // Water darkens at night and picks up the sun's colour when it is low —
    // the golden-hour glint is most of why the beach works at that hour.
    const warm = new THREE.Color("#FFB067");
    const cool = new THREE.Color("#0E1B2A");
    const tint = cool.clone().lerp(warm, THREE.MathUtils.clamp(1 - sunAltitude / 25, 0, 1));

    material.color.copy(cool).lerp(new THREE.Color("#1E4A5A"), daylight);
    material.emissive.copy(tint).multiplyScalar(0.04 + (1 - daylight) * 0.05);
  });

  if (mood !== "beach") return null;

  return (
    /*
     * Positioned beyond the shoreline. The sea's near edge must start where
     * the beach ends, not overlapping it — a sea plane that starts under the
     * sand z-fights with it and the waterline looks like a mistake.
     *
     * Pushed far enough out that from the start altitude the water is beyond
     * the fog horizon and reads as a distant band rather than a slab in the
     * foreground.
     */
    <mesh ref={meshRef} geometry={geometry} position={[0, -2.0, -5880]}>
      <meshPhysicalMaterial
        ref={materialRef}
        color="#1E4A5A"
        roughness={0.12}
        metalness={0.0}
        transmission={0.35}
        thickness={2}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/**
 * The wet band at the waterline.
 *
 * A simple gradient strip rather than a second textured surface: the effect
 * is entirely a roughness and colour shift, so a shader is cheaper and more
 * controllable than another texture fetch.
 */
export function WetSand({ mood, daylight }: Omit<WaterProps, "sunAltitude">) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const material = materialRef.current;
    if (!material) return;
    material.color.set("#3A3226").lerp(new THREE.Color("#8A7A5E"), daylight);
    // Wet sand is markedly glossier than dry — this is the whole point.
    material.roughness = 0.22 + daylight * 0.25;
  });

  const geometry = useMemo(() => {
    // A band along the shoreline, sized in world units rather than as a
    // fraction of the (now much larger) ground radius.
    const geo = new THREE.PlaneGeometry(1400, 260, 64, 24);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  if (mood !== "beach") return null;

  return (
    <mesh geometry={geometry} position={[0, 0.05, -560]} receiveShadow>
      <meshStandardMaterial
        ref={materialRef}
        transparent
        opacity={0.85}
        roughness={0.25}
        metalness={0.05}
      />
    </mesh>
  );
}