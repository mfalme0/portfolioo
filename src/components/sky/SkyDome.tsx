import { useMemo } from "react";
import * as THREE from "three";

/**
 * Sky dome.
 *
 * The 3D scene owns its own sky. Previously the CSS gradient was relied on to
 * show through the transparent canvas — but the scene also applies fog tinted
 * with the same colour, so the two disagreed and the result read as a jumbled
 * mess rather than a coherent sky. One dome, one gradient, no overlap.
 *
 * Shaded rather than textured: a vertex-colour gradient is free, and the sun
 * glow is a single dot product in the fragment shader.
 */

interface SkyDomeProps {
  zenith: string;
  mid: string;
  horizon: string;
  ground: string;
  /** Unit vector toward the sun, or null when it has set. */
  sunDirection: THREE.Vector3 | null;
  /** 0..1 sun visibility, drives the glow strength. */
  sunIntensity: number;
  radius: number;
}

export function SkyDome({
  zenith,
  mid,
  horizon,
  ground,
  sunDirection,
  sunIntensity,
  radius,
}: SkyDomeProps) {
  const geometry = useMemo(() => {
    // Inverted sphere drawn on the inside. 32x16 is plenty — it is a smooth
    // gradient, so more segments only cost fill rate.
    const geo = new THREE.SphereGeometry(radius, 32, 16);
    return geo;
  }, [radius]);

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(zenith) },
      uMid: { value: new THREE.Color(mid) },
      uHorizon: { value: new THREE.Color(horizon) },
      uGround: { value: new THREE.Color(ground) },
      uSunDirection: { value: sunDirection ?? new THREE.Vector3(0, -1, 0) },
      uSunColor: { value: new THREE.Color("#FFD9A0") },
      uSunIntensity: { value: sunIntensity },
      uMoonDirection: { value: new THREE.Vector3(0, -1, 0) },
      uMoonIntensity: { value: 0 },
    }),
    // Colour objects are mutated in place below, so only rebuild on identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sunDirection],
  );

  // Update colours every frame from the current sky state.
  uniforms.uZenith.value.set(zenith);
  uniforms.uMid.value.set(mid);
  uniforms.uHorizon.value.set(horizon);
  uniforms.uGround.value.set(ground);
  uniforms.uSunIntensity.value = sunIntensity;

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vDirection;

          void main() {
            // Direction from the camera to this vertex, in world space. Used
            // as the sample point for the gradient rather than the vertex
            // position, so the gradient is anchored to the viewer's frame and
            // does not swim as the camera moves.
            vDirection = normalize(position);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uZenith;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          uniform vec3 uGround;
          uniform vec3 uSunDirection;
          uniform vec3 uSunColor;
          uniform float uSunIntensity;

          varying vec3 vDirection;

          void main() {
            vec3 dir = normalize(vDirection);
            float h = dir.y;

            vec3 colour;

            if (h > 0.0) {
              // Above the horizon: three-stop gradient. The exponent on the
              // horizon band controls how tightly the glow hugs the skyline —
              // a linear blend here looks like a wash, not a sky.
              float upper = pow(clamp(h, 0.0, 1.0), 0.45);
              colour = mix(uHorizon, uMid, smoothstep(0.0, 0.28, upper));
              colour = mix(colour, uZenith, smoothstep(0.25, 1.0, upper));
            } else {
              // Below the horizon, fading to the ground colour. Without this
              // the lower half of the dome stays sky-coloured and the world
              // below it looks wrong.
              colour = mix(uHorizon, uGround, smoothstep(0.0, 0.18, -h));
            }

            // Sun glow.
            //
            // Three lobes, because scattering does not fall off like a point
            // light: there is a tight core, a bright inner halo, and a broad
            // wash that fills much of the sky. The broad lobe matters most —
            // it is what carries the sun's presence when the disc itself is
            // above the top of the frame, which happens for most of a Nairobi
            // midday.
            float sunDot = max(0.0, dot(dir, normalize(uSunDirection)));
            float glow =
              pow(sunDot, 220.0) * 2.20 +   // core
              pow(sunDot, 24.0)  * 0.55 +   // inner halo
              pow(sunDot, 3.0)   * 0.16;    // broad wash
            colour += uSunColor * glow * uSunIntensity;

            gl_FragColor = vec4(colour, 1.0);
          }
        `}
      />
    </mesh>
  );
}