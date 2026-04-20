import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No rewrites needed - using direct API calls to backend
  // API_URL is set via NEXT_PUBLIC_API_URL environment variable
};

export default nextConfig;
