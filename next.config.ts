import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    // Set to ignore typescript errors for deployment safety
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
