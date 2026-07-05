import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: ["@llw/config", "@llw/db", "@llw/ui", "@llw/wallet"],
  // Keep the Node-only pass generator out of the bundler.
  serverExternalPackages: ["passkit-generator"],
};

export default nextConfig;
