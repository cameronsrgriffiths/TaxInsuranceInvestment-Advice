# insurance

A private personal-tools web app: a public landing page plus login-gated tools
(notes, an AI chat), built on **React Router v7** and deployed to **Cloudflare
Workers** with a **D1** database.

## Stack

- **Framework:** React Router v7 (framework mode, SSR)
- **Host:** Cloudflare Workers (push-to-`main` deploys; custom domains)
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** email + password, hashed with PBKDF2 (WebCrypto); DB-backed sessions
- **AI:** Anthropic Claude API, called server-side from the Worker

## Project layout

```
app/
  root.tsx              app shell
  routes.ts             route table
  routes/               pages (home, login, signup, logout, dashboard, notes, chat)
  lib/
    auth.server.ts      password hashing + user lookup
    session.server.ts   cookie + DB-backed sessions, requireUser()
    anthropic.server.ts Claude API call (key stays server-side)
migrations/             D1 SQL migrations
workers/app.ts          Cloudflare Worker entry (SSR handler)
wrangler.jsonc          Cloudflare config (D1 binding, secrets)
```

## First-time setup

```sh
npm install

# 1. Create the D1 database, then paste the returned id into wrangler.jsonc
npm run db:create

# 2. Apply the schema (local + remote)
npm run db:migrate:local
npm run db:migrate

# 3. Local AI key — copy the example and fill it in
cp .dev.vars.example .dev.vars   # then edit ANTHROPIC_API_KEY

# 4. Run locally
npm run dev
```

Get an Anthropic API key from <https://console.anthropic.com> (this is separate
from a Claude.ai subscription — a subscription cannot be used for API access).

## Deploy

```sh
# One-time: set the production secret
wrangler secret put ANTHROPIC_API_KEY

# Deploy
npm run deploy
```

### Continuous deploy

`.github/workflows/deploy.yml` deploys on every push to `main`. Add two repo
secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. (Alternatively,
connect the repo in the Cloudflare dashboard for git-based deploys.)

### Custom domain

In the Cloudflare dashboard → your Worker → **Settings → Domains & Routes**, add
a custom domain. Easiest if the domain's DNS is already on Cloudflare.

## Adding tools

Each tool is a route file under `app/routes/` plus an entry in `app/routes.ts`.
Put login-gated tools inside the `app-layout` group — its loader runs
`requireUser` for everything nested under it. Public pages go at the top level.
