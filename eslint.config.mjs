import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  {
    // react-three-fiber drives three.js by imperatively mutating the camera,
    // scene fog and object refs inside `useFrame`. That is the framework's own
    // rendering model, not a React-state mutation bug, so Next 16's React
    // Compiler `immutability` rule does not apply to the 3D layer.
    files: ["src/components/sky/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
  {
    // These synchronise genuinely client-only values from outside React after
    // mount: the visitor's clock (can't be known at SSR), the CSS custom
    // properties the pre-paint sky script already wrote, and WebGL /
    // reduced-motion / scroll-idle capability probes. Doing that once in an
    // effect is the documented "sync with an external system" pattern, so
    // `set-state-in-effect` is relaxed for these bridges only.
    files: [
      "src/components/sky/SkyProvider.tsx",
      "src/components/sections/Hero.tsx",
      "src/hooks/useRenderGate.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;

