import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["void-pedigree-provoke.ngrok-free.dev", "*.ngrok-free.dev", "localhost:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb"
    }
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/updates",
        destination: "/announcements",
        permanent: true,
      },
      {
        source: "/why-us",
        destination: "/#why-choose-us",
        permanent: true,
      },
      {
        source: "/academics",
        destination: "/#academics",
        permanent: true,
      },
      {
        source: "/student-life",
        destination: "/#student-life",
        permanent: true,
      },
      {
        source: "/campus-tour",
        destination: "/#campus",
        permanent: true,
      },
      {
        source: "/admissions",
        destination: "/#admissions",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/#contact",
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
