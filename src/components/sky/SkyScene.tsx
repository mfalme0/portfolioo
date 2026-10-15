import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

import { Celestial } from "./Celestial";
import { StarField } from "./StarField";
import { SkyDome } from "./SkyDome";
import { Pines, BeachGrass } from "./Flora";
import { SceneryProps, StreetLights, Terrain, GROUND_RADIUS } from "./Terrain";
import { Sea, WetSand } from "./Water";
import { directionFromAltitudeAzimuth, kelvinToRgb, type Coordinates } from "@/lib/solar";
import { moonPosition, moonIllumination } from "@/lib/moon";
import type { SkyState } from "@/lib/sky";

/**
 * The 3D backdrop.
 *
 * One continuous descent, from high above the world at the top of the page to
 * eye level at the footer. The camera altitude is the only thing scroll drives;
 * everything else — scenery, lighting, fog, celestial scale — is derived from
 * the solar state and the altitude.
 *
 * Content is NOT in this canvas. The scene is decorative and sits behind the
 * DOM, so text stays selectable, indexable and screen-reader accessible.
 */

const SKY_RADIUS = 4000;

/** Camera altitude range. 0 = high above, 1 = eye level. */
const START_ALTITUDE = 190;
const EYE_LEVEL = 1.7;

/**
 * Camera pitch, in radians. Negative looks down.
 *
 * START is deliberately shallow (-14 degrees) rather than steep: the horizon
 * and the sky must be visible from the first frame, or the descent has
 * nothing to descend *from*. At eye level pitch is near zero so the horizon
 * settles exactly on the eye line, which is what makes the landing read as
 * landing.
 */
const START_PITCH = -0.25;
const END_PITCH = -0.02;

/**
 * Camera rig.
 *
 * Two things matter here beyond moving a position:
 *
 * 1. Damped interpolation. Reading the scroll value directly makes the camera
 *    feel welded to the scrollbar. Damping gives it weight.
 * 2. Pitch compensation. As the camera drops, the look-angle has to converge
 *    so the horizon settles at eye level instead of drifting upward.
 */
function CameraRig({ descent }: { descent: number }) {
  const { camera } = useThree();
  const currentAltitude = useRef(START_ALTITUDE);
  const currentPitch = useRef(START_PITCH);

  useFrame((_, delta) => {
    // Frame-rate independent damping. A raw lerp factor would make the feel
    // depend on whether the device was hitting 30 or 60 fps.
    const damping = 1 - Math.pow(0.0015, Math.min(delta, 0.1));

    // --- Altitude -------------------------------------------------------
    const targetAltitude = THREE.MathUtils.lerp(
      START_ALTITUDE,
      EYE_LEVEL,
      descent,
    );
    currentAltitude.current = THREE.MathUtils.lerp(
      currentAltitude.current,
      targetAltitude,
      damping,
    );

    // --- Pitch ----------------------------------------------------------
    // Pitch is set directly, never composed with lookAt. The previous version
    // called lookAt() and then added to rotation.x, which orients the camera
    // twice — the result was unpredictable and read as a jumbled mess.
    //
    // The previous start pitch was also -1.15 rad (-77 degrees), which pointed
    // the camera at the ground and meant the sky and the sun were never in
    // frame at all. The horizon now stays visible from the first pixel.
    const targetPitch = THREE.MathUtils.lerp(START_PITCH, END_PITCH, descent);
    currentPitch.current = THREE.MathUtils.lerp(
      currentPitch.current,
      targetPitch,
      damping,
    );

    // --- Position -------------------------------------------------------
    // Pull back and rise as we ascend so the world stays framed. Starting at
    // the origin with the camera 260 units up pointed at the ground gave an
    // empty frame.
    const altitude = currentAltitude.current;
    const distance = THREE.MathUtils.lerp(180, 26, descent);

    camera.position.set(0, altitude, -distance);
    camera.rotation.set(currentPitch.current, 0, 0, "YXZ");

    // --- Frustum --------------------------------------------------------
    // Far plane tracks altitude so depth precision is not wasted on empty sky
    // at the start, and does not clip the ground at the footer.
    const far = THREE.MathUtils.lerp(9000, 4200, descent);
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.far - far) > 1) {
      cam.far = far;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/**
 * Lighting derived from the real sun position.
 *
 * The key light is positioned along the true solar vector, so shadows fall in
 * the direction they would at that time of day. Colour comes from the solar
 * colour temperature, which is what actually sells the lighting — a white
 * light at sunset looks wrong no matter how well the geometry is placed.
 */
function SolarLighting({
  sky,
  coords,
  quality,
}: {
  sky: SkyState;
  coords: Coordinates;
  quality: "full" | "reduced";
}) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.HemisphereLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);

  const lightColor = useMemo(
    () => new THREE.Color(...kelvinToRgb(sky.temperature)),
    [sky.temperature],
  );

  const dayFactor = THREE.MathUtils.clamp(sky.intensity, 0, 1);
  const moon = useMemo(() => moonPosition(new Date(), coords), [coords]);

  useFrame(() => {
    if (!keyRef.current || !ambientRef.current) return;

    if (sky.altitude > -1.5) {
      const dir = directionFromAltitudeAzimuth(sky.altitude, sky.azimuth);
      keyRef.current.position.set(dir.x, Math.max(0.05, dir.y), dir.z);
      keyRef.current.color.copy(lightColor);
      keyRef.current.intensity = dayFactor * (quality === "reduced" ? 1.4 : 2.6);

      // Ambient tracks the sky, so shadows are filled by the same light that
      // is visible behind them.
      ambientRef.current.intensity = 0.12 + dayFactor * 0.55;
      ambientRef.current.color.set(sky.zenith);
      ambientRef.current.groundColor.set(sky.ground);
    }

    if (moonRef.current) {
      // Moonlight is faint but it is what keeps night from being flat black.
      moonRef.current.position.set(
        moon.azimuth * 0.1,
        Math.max(1, moon.altitude * 0.1),
        20,
      );
      moonRef.current.intensity = sky.isDark ? 0.22 : 0;
    }
  });

  const shadowSize = quality === "reduced" ? 1024 : 2048;

  return (
    <>
      <hemisphereLight ref={ambientRef} intensity={0.4} />
      <directionalLight
        ref={keyRef}
        castShadow={quality === "full"}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        // The shadow frustum must track the descending camera. A frustum sized
        // for altitude loses all resolution by the time we reach ground level.
        shadow-camera-near={1}
        shadow-camera-far={900}
        shadow-camera-left={-320}
        shadow-camera-right={320}
        shadow-camera-top={320}
        shadow-camera-bottom={-320}
        shadow-bias={-0.0005}
      />
      <directionalLight ref={moonRef} intensity={0} color="#8FA6D8" />
    </>
  );
}

/**
 * Aerial perspective.
 *
 * Without this the descent has no depth cue and reads as a flat zoom. Density
 * starts high — you are far from everything — and thins out as you land.
 */
function Atmosphere({ sky, descent, quality }: { sky: SkyState; descent: number; quality: "full" | "reduced" }) {
  const { scene } = useThree();

  const fog = useMemo(() => {
    // FogExp2 keeps density independent of the far plane, which matters
    // because the far plane changes with altitude.
    return new THREE.FogExp2(new THREE.Color(sky.mid), 0.004);
  }, [sky.mid]);

  useFrame(() => {
    const density = THREE.MathUtils.lerp(0.0055, 0.0016, descent);
    fog.color.set(sky.mid);
    fog.density = density;
    scene.fog = fog;
  });

  void quality;
  return null;
}

function SceneContents({
  sky,
  coords,
  descent,
  quality,
}: {
  sky: SkyState;
  coords: Coordinates;
  descent: number;
  quality: "full" | "reduced";
}) {
  const { gl } = useThree();

  // Star density is the cheapest thing to sacrifice on constrained hardware.
  const starDensity = quality === "reduced" ? 0.35 : 1;

  useFrame(() => {
    // DPR is clamped hard. Uncapped devicePixelRatio on a 3x phone is a
    // 9x fill-rate increase for a difference almost nobody can see.
    const target = Math.min(window.devicePixelRatio, 1.5);
    if (Math.abs(gl.getPixelRatio() - target) > 0.01) {
      gl.setPixelRatio(target);
    }
  });

  const daylight = THREE.MathUtils.clamp((sky.altitude + 6) / 26, 0, 1);

  // Unit vector toward the sun, for the dome's glow. Computed outside the
  // render loop because it only changes when the sky does.
  const sunDirection = useMemo(() => {
    const d = directionFromAltitudeAzimuth(sky.altitude, sky.azimuth);
    return new THREE.Vector3(d.x, d.y, d.z);
  }, [sky.altitude, sky.azimuth]);

  const moon = useMemo(
    () => moonPosition(new Date(), coords),
    [coords],
  );

  return (
    <>
      <CameraRig descent={descent} />

      {/*
        The dome renders first and fills every pixel not covered by
        geometry. This is what removed the "jumbled" look: previously the CSS
        gradient showed through the transparent canvas *and* the scene applied
        its own fog, so two skies disagreed.
      */}
      <SkyDome
        zenith={sky.zenith}
        mid={sky.mid}
        horizon={sky.horizon}
        ground={sky.ground}
        sunDirection={sky.altitude > -1.5 ? sunDirection : null}
        sunIntensity={sky.isDark ? 0 : THREE.MathUtils.clamp(sky.altitude / 12, 0, 1)}
        radius={SKY_RADIUS * 0.95}
      />

      <Atmosphere sky={sky} descent={descent} quality={quality} />
      <SolarLighting sky={sky} coords={coords} quality={quality} />

      <Celestial
        altitude={sky.altitude}
        azimuth={sky.azimuth}
        angularRadius={0.2665}
        temperature={THREE.MathUtils.clamp((sky.temperature - 1900) / 4600, 0, 1)}
        intensity={sky.intensity}
        isMoon={false}
        skyRadius={SKY_RADIUS * 0.8}
      />

      {sky.isDark && moon.altitude > -1.5 && (
        <Celestial
          altitude={moon.altitude}
          azimuth={moon.azimuth}
          angularRadius={0.26}
          temperature={0.5}
          intensity={1}
          isMoon
          illumination={moonIllumination(new Date())}
          skyRadius={SKY_RADIUS * 0.8}
        />
      )}

      <StarField opacity={sky.starOpacity} radius={SKY_RADIUS * 0.9} density={starDensity} />

      <Terrain mood={sky.mood} daylight={daylight} radius={GROUND_RADIUS} />

      {/* Water and flora only exist at the beach. Rendering them at night
          would show through the street geometry as the mood cross-fades. */}
      {sky.mood === "beach" && (
        <>
          <Sea
            mood={sky.mood}
            daylight={daylight}
            radius={GROUND_RADIUS}
            sunAltitude={sky.altitude}
          />
          <WetSand
            mood={sky.mood}
            daylight={daylight}
            radius={GROUND_RADIUS}
          />
          <Pines mood={sky.mood} daylight={daylight} radius={GROUND_RADIUS} />
          <BeachGrass mood={sky.mood} daylight={daylight} radius={GROUND_RADIUS} />
        </>
      )}

      <SceneryProps mood={sky.mood} daylight={daylight} radius={GROUND_RADIUS} />
      {sky.mood === "street" && (
        <StreetLights mood={sky.mood} daylight={daylight} radius={GROUND_RADIUS} />
      )}
    </>
  );
}

export interface SkySceneProps {
  sky: SkyState;
  coords: Coordinates;
  descent: number;
  quality: "full" | "reduced";
  onContextLost: () => void;
  /** Fired once the first frame has actually been drawn. */
  onFirstFrame?: () => void;
}

function FirstFrameSignal({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current || !onFirstFrame) return;
    fired.current = true;
    onFirstFrame();
  });
  return null;
}

export function SkyScene({
  sky,
  coords,
  descent,
  quality,
  onContextLost,
  onFirstFrame,
}: SkySceneProps) {
  return (
    <Canvas
      // Decorative: hidden from assistive tech entirely, since every
      // meaningful piece of content lives in the DOM above it.
      aria-hidden="true"
      dpr={[1, 1.5]}
      gl={{
        antialias: quality === "reduced" ? false : true,
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
        depth: true,
      }}
      camera={{
        // 65 degrees vertical. Wider than a natural lens so a reasonably high
        // sun stays in frame, but short of the 80-90 where barrel distortion
        // makes the scene read as a fisheye. When the sun is above the frame
        // the dome's glow carries its presence instead, which is both honest
        // and prettier than bending the projection.
        fov: 65,
        near: 0.1,
        far: 9000,
        position: [0, START_ALTITUDE, -180],
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost();
          },
          false,
        );
      }}
      frameloop={quality === "reduced" ? "demand" : "always"}
    >
      <SceneContents
        sky={sky}
        coords={coords}
        descent={descent}
        quality={quality}
      />
      <FirstFrameSignal onFirstFrame={onFirstFrame} />

      {/* Bloom is the only postprocessing pass. It is also the most expensive
          thing in the scene, so it is the first thing dropped when quality
          degrades. */}
      {quality === "full" && (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={sky.isDark ? 0.9 : 0.45}
            luminanceThreshold={sky.isDark ? 0.25 : 0.72}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}

export { SKY_RADIUS, START_ALTITUDE, EYE_LEVEL };