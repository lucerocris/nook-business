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
    ],
  },
};

export default nextConfig;
