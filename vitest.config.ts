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
        // context, so mounting these either throws or renders nothing worth
        // asserting. Their *logic* is factored out into src/lib and covered
        // there — solar maths, sky gradients, contrast, scroll easing — and
        // the camera invariants are pinned by src/components/sky/camera.test.ts.
        //
        // This is the largest untested surface in the codebase. "Excluded" is
        // not "tested" — see the browser smoke test item in plan.md.
        "src/components/sky/**/*.tsx",
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