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
      // Renamed: Version 4 is now Version 2, Version 6 is now Version 3 (the old Version 3 is at /v/archive/v3).
      { source: "/v/v4", destination: "/v/v2", permanent: false },
      { source: "/v/v6", destination: "/v/v3", permanent: false },
      ...(VERSIONS_SITE ? [{ source: "/", destination: "/v", permanent: false }] : []),
      // The approach versions (Figma 2743:14706): rangde-v1 opens Version 1.1, rangde-v2 now opens
      // Version 3 (it used to open Version B, still at /v/idea), and rangde-v1-2 opens Version 1.2
      // once that domain is added to the Vercel project.
      { source: "/", has: [{ type: "host", value: "rangde-v1.vercel.app" }], destination: "/v/v1", permanent: false },
      { source: "/", has: [{ type: "host", value: "rangde-v1-2.vercel.app" }], destination: "/v/v1-2", permanent: false },
      { source: "/", has: [{ type: "host", value: "rangde-v2.vercel.app" }], destination: "/v/v3", permanent: false },
    ];
  },
};

export default nextConfig;
