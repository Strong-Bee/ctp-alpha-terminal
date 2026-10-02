import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/health",
        destination: apiUrl + "/health",
      },
      {
        source: "/api/v1/:path*",
        destination: apiUrl + "/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
