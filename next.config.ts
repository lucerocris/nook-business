import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lucerocris.sgp1.cdn.digitaloceanspaces.com",
        port: "",
        pathname: "/nook-sites/**",
        search: "",
      },
      // Owner uploads land under /nook/**, and older menu rows still point at
      // the bare origin host rather than the CDN one. Neither was allowed here,
      // so any switch from <img> to next/image would have thrown
      // "url parameter is not allowed".
      {
        protocol: "https",
        hostname: "lucerocris.sgp1.cdn.digitaloceanspaces.com",
        port: "",
        pathname: "/nook/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "lucerocris.sgp1.digitaloceanspaces.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  experimental: {
    // Owner photo uploads are compressed to ~0.3MB but that is best-effort, and
    // both the UI and the server action advertise a 10MB ceiling. The default
    // 1MB Server Action body limit rejected larger uploads before the server's
    // own check ran — and Next redacts that rejection in production.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
