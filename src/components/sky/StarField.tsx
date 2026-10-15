import { useMemo } from "react";
import * as THREE from "three";

/**
 * Star field.
 *
 * Built once as a single BufferGeometry and never touched again. The per-star
 * twinkle is done entirely in the fragment shader from a per-vertex seed, so
 * animating thousands of stars costs one uniform update per frame rather than
 * a CPU-side buffer rewrite.
 *
 * Stars fade with solar depression rather than switching on, so they emerge
 * through civil and nautical twilight the way they actually do.
 */

interface StarFieldProps {
  /** 0..1 overall opacity, driven by solar altitude. */
  opacity: number;
  radius: number;
  /** Density multiplier, lowered on constrained hardware. */
  density?: number;
}

/**
 * Deterministic PRNG so the sky is identical on every render and across
 * server/client. A random sky would be a hydration mismatch and would also
 * change every time you revisited the page.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function StarField({ opacity, radius, density = 1 }: StarFieldProps) {
  const geometry = useMemo(() => {
    const count = Math.round(1400 * density);
    const rand = mulberry32(0x5eed);

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const tints = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform distribution on the upper hemisphere plus a little below the
      // horizon, so the field still reads when the camera tilts down near the
      // footer.
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(1 - rand() * 1.35);

      const r = radius * 0.98;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.9;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // A steep size distribution: many faint stars, a few bright ones.
      scales[i] = 0.35 + Math.pow(rand(), 3) * 2.4;
      seeds[i] = rand() * 100;
      // Slight colour variation — real fields are not pure white.
      tints[i] = rand();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

    return geo;
  }, [radius, density]);

  if (opacity <= 0.001) return null;

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        fog={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uOpacity: { value: opacity },
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
        }}
        vertexShader={`
          attribute float aScale;
          attribute float aSeed;
          attribute float aTint;
          uniform float uPixelRatio;
          varying float vTint;
          varying float vTwinkle;

          void main() {
            vTint = aTint;
            // Slow, low-amplitude scintillation. Real twinkling is far faster,
            // but at this scale a gentle shimmer reads as atmosphere rather
            // than as a flickering bug.
            vTwinkle = 0.78 + 0.22 * sin(aSeed * 6.2831);

            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aScale * uPixelRatio * 2.2;
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          varying float vTint;
          varying float vTwinkle;

          void main() {
            // Round, soft-edged point sprite.
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c) * 2.0;
            if (d > 1.0) discard;
            float core = pow(max(0.0, 1.0 - d), 2.2);

            // Cool white through to warm white.
            vec3 col = mix(vec3(0.78, 0.85, 1.0), vec3(1.0, 0.94, 0.84), vTint);

            gl_FragColor = vec4(col, core * uOpacity * vTwinkle);
          }
        `}
      />
    </points>
  );
}