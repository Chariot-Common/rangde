import type { NextConfig } from "next";
import path from "path";

// Set on the separate "rangde-versions" Vercel project only: it hosts the homepage test
// versions (app/v/*), so its root opens the versions index instead of the current homepage.
const VERSIONS_SITE = process.env.VERSIONS_SITE === "1";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // The second How it works take was tried at /v/idea-2 and is now Version B itself.
      { source: "/v/idea-2", destination: "/v/idea", permanent: false },
      ...(VERSIONS_SITE ? [{ source: "/", destination: "/v", permanent: false }] : []),
      // rangde-v2.vercel.app opens Version B (scroll-based How it works); rangde-v1 is the homepage.
      {
        source: "/",
        has: [{ type: "host", value: "rangde-v2.vercel.app" }],
        destination: "/v/idea",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
