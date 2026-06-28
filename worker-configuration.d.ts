// Minimal hand-written binding types. Regenerate the full version anytime with:
//   npm run typegen   (runs `wrangler types`)
declare interface Env {
  DB: import("@cloudflare/workers-types").D1Database;
  ANTHROPIC_API_KEY: string;
}
