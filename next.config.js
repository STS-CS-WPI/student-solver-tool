/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gamerevolution.com",
        pathname:
          "/wp-content/uploads/sites/2/2019/08/original-Pokemon-artwork-2.jpg",
      },
    ],
  },
  reactStrictMode: true, // helps catch potential problems
  output: "standalone", // standalone server output for docker, generates .next/standalone without source code and node_modules
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default config;
