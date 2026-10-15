import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Sun and moon discs.
 *
 * The scale trick that sells the descent lives here: both bodies are placed at
 * an effectively infinite distance, so as the camera falls they shrink toward
 * a small disc and rise toward the horizon. They never leave the frame. The
 * ground, by contrast, is finite and grows past the viewer.
 *
 * They are drawn on a separate render pass conceptually but implemented as
 * plain meshes parented to the camera rig, at a distance far beyond the scene
 * fog so they are never hazed out.
 */

interface CelestialProps {
  altitude: number;
  azimuth: number;
  angularRadius: number;
  /** 0..1 warm-to-white colour mix derived from colour temperature. */
  temperature: number;
  intensity: number;
  isMoon: boolean;
  illumination?: number;
  /** Radius of the sky sphere the bodies live on. */
  skyRadius: number;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Altitude/azimuth to a direction vector. Azimuth clockwise from north. */
function toVector(altitude: number, azimuth: number, radius: number) {
  const alt = THREE.MathUtils.degToRad(altitude);
  const az = THREE.MathUtils.degToRad(azimuth);
  return new THREE.Vector3(
    Math.cos(alt) * Math.sin(az) * radius,
    Math.sin(alt) * radius,
    -Math.cos(alt) * Math.cos(az) * radius,
  );
}

export function Celestial({
  altitude,
  azimuth,
  angularRadius,
  temperature,
  intensity,
  isMoon,
  illumination = 1,
  skyRadius,
}: CelestialProps) {
  const group = useRef<THREE.Group>(null);

  const position = useMemo(
    () => toVector(altitude, azimuth, skyRadius),
    [altitude, azimuth, skyRadius],
  );

  // Sun colour runs from deep amber at the horizon to near-white at noon.
  // Moon is always cool — it is lit by the sun, but its albedo is low and it
  // reads blue to the eye at every altitude.
  const color = useMemo(() => {
    if (isMoon) return new THREE.Color("#C8D6F0");
    const low = new THREE.Color("#FF7A2F");
    const mid = new THREE.Color("#FFC98A");
    const high = new THREE.Color("#FFF6E8");
    const t = THREE.MathUtils.clamp(temperature, 0, 1);
    return t < 0.5
      ? low.clone().lerp(mid, t * 2)
      : mid.clone().lerp(high, (t - 0.5) * 2);
  }, [isMoon, temperature]);

  // Below the horizon the body is hidden rather than dimmed, because a dim
  // disc under the ground plane reads as a bug.
  const visible = altitude > -1.5;
  const opacity = isMoon ? 0.35 + illumination * 0.65 : 1;

  /*
   * Visual scale exaggeration.
   *
   * The true angular radius of the sun is 0.2665 degrees — about half a
   * percent of screen height, which is astronomically accurate and completely
   * invisible as a design element. The moon has the same problem.
   *
   * Scaled up by roughly 6x for the sun and 5x for the moon, both become
   * legible discs with a real presence. This is a deliberate departure from
   * physical accuracy: nobody opens a portfolio to check angular diameter,
   * and a sky with no visible sun does not read as a sky at all.
   *
   * The ratio between sun and moon is preserved so they still read as the
   * same class of object.
   */
  const visualRadius = angularRadius * (isMoon ? 5 : 6);

  const worldRadius = useMemo(
    () => skyRadius * Math.sin(THREE.MathUtils.degToRad(visualRadius)),
    [skyRadius, visualRadius],
  );

  useFrame(() => {
    if (!group.current) return;
    group.current.position.copy(position);
    // Keep the disc facing the origin so it never turns edge-on.
    group.current.lookAt(0, 0, 0);
  });

  if (!visible) return null;

  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[worldRadius, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * Math.max(0.15, intensity === 0 && isMoon ? 1 : intensity)}
          toneMapped={false}
          fog={false}
          depthWrite={false}
        />
      </mesh>

      {/*
        A soft halo. Kept as a camera-facing sprite rather than a second
        sphere so it stays circular at any distance — an actual sphere shell
        would visibly flatten as the camera falls.
      */}
      <mesh scale={isMoon ? 2.6 : 4.2}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          toneMapped={false}
          uniforms={{
            uColor: { value: color },
            uOpacity: { value: (isMoon ? 0.34 : 0.62) * opacity },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            uniform float uOpacity;
            varying vec2 vUv;
            void main() {
              float d = distance(vUv, vec2(0.5)) * 2.0;

              // Two-lobe falloff. A single power() gives a soft blob that reads
              // as fog; the tight core plus the wide bloom is what makes it
              // read as a light source with atmosphere around it.
              float core = pow(max(0.0, 1.0 - d), 2.2);
              float bloom = pow(max(0.0, 1.0 - d), 0.9) * 0.34;

              float a = core + bloom;
              if (a < 0.004) discard;

              gl_FragColor = vec4(uColor, a * uOpacity);
            }
          `}
        />
      </mesh>
    </group>
  );
}

export { toVector, UP };