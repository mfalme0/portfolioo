import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local optimised assets only. Remote patterns are intentionally absent —
    // all imagery is served from /public or /assets so we control optimisation.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  transpilePackages: ["three"],
  experimental: {
    // R3F ships three as a peer; keep it out of the server bundle where possible.
    optimizePackageImports: ["lucide-react", "@react-three/drei"],
  },
};

export default nextConfig;