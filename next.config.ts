import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const nextConfig: NextConfig = {
  async headers() { return [{ source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" }, { key: "Referrer-Policy", value: "same-origin" }] }]; },
  async rewrites() { return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }]; },
};
export default nextConfig;
