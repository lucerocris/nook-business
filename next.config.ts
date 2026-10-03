import type { NextConfig } from "next";

// Image hosts follow the Spaces env (DO_SPACES_CDN_URL for the CDN host, and
// DO_SPACES_BUCKET + DO_SPACES_ENDPOINT for the bare origin host) so a
// different bucket doesn't need a code change. The hardcoded hosts are the
// fallback when those aren't set.
const hostnameOf = (url: string | undefined) => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const spacesEndpointHost = hostnameOf(
  process.env.DO_SPACES_ENDPOINT ?? process.env.DO_SPACE_ENDPOINT,
);
const cdnHost =
  hostnameOf(process.env.DO_SPACES_CDN_URL) ??
  "lucerocris.sgp1.cdn.digitaloceanspaces.com";
const originHost =
  process.env.DO_SPACES_BUCKET && spacesEndpointHost
    ? `${process.env.DO_SPACES_BUCKET}.${spacesEndpointHost}`
    : "lucerocris.sgp1.digitaloceanspaces.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: cdnHost,
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
        hostname: cdnHost,
        port: "",
        pathname: "/nook/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: originHost,
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
