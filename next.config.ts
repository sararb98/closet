import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.68.56', '192.168.68.53'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jprphldcbppzthfrubbr.supabase.co",
      },
    ],
  },
};

export default nextConfig;
