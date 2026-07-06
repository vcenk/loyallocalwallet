import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: ["@llw/config", "@llw/db", "@llw/ui", "@llw/wallet"],
  // Keep Node-only native deps out of the bundler (pass generator + image lib).
  serverExternalPackages: ["passkit-generator", "sharp"],
  // Bundle the Apple pass model (images + pass.json) into the wallet functions
  // so generation works on serverless (Vercel), not just local file paths.
  outputFileTracingIncludes: {
    "/api/wallet/apple/**": ["./wallet-models/**/*"],
  },
};

export default nextConfig;
