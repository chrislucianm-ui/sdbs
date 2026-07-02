import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["void-pedigree-provoke.ngrok-free.dev", "*.ngrok-free.dev", "localhost:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb"
    }
  }
};

export default nextConfig;
