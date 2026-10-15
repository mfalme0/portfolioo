import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.test.tsx",
        "src/data/repos.generated.ts",
        // The R3F scene cannot be unit tested under jsdom: there is no WebGL
        // context, so mounting it either throws or renders nothing worth
        // asserting. These are exercised by the browser smoke test instead,
        // and their pure logic (solar maths, gradients, contrast, scroll
        // easing) is factored out into src/lib and covered there.
        //
        // Excluding them is not the same as them being tested — see the
        // "Browser smoke test" section of plan.md.
        "src/components/sky/SkyScene.tsx",
        "src/components/sky/Celestial.tsx",
        "src/components/sky/StarField.tsx",
        "src/components/sky/Terrain.tsx",
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 75,
        statements: 85,
      },
    },
  },
});