import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default; the Cloudflare Worker handles SSR + API routes.
  ssr: true,
  future: {
    // Use Vite's Environment API so the build coordinates with the Cloudflare
    // plugin (shared output directory, single build pass).
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
