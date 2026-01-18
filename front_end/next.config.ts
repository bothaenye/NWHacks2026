import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // This is still supported and will help you bypass 
    // those silent crashes you saw earlier
    ignoreBuildErrors: true,
  },
  // DELETE the eslint: { ... } block from here
};

export default nextConfig;