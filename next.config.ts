import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploaded images are streamed from a Railway Volume via /api/images,
  // so no remote image domains need to be configured.
  eslint: {
    // Don't fail production builds on lint; lint runs separately in dev.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
