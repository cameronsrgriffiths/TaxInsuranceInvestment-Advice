# Tax · Insurance · Investment Advice

A small, fast marketing website for a financial advisory practice, built with
[Astro](https://astro.build). It ships as static HTML/CSS (zero client-side
JavaScript by default), so it's cheap and easy to host anywhere.

## Pages

- **Home** (`/`) — hero, services overview, stats, call to action
- **Services** (`/services`) — detailed services and a four-step process
- **About** (`/about`) — approach, values, why clients choose us
- **Contact** (`/contact`) — contact form (Formspree-ready) and details

## Local development

```sh
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # build the production site into ./dist
npm run preview  # preview the production build locally
```

## Hosting

### GitHub Pages (configured)

A workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages
on every push to `main`. To turn it on:

1. Push these files to `main`.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and
   select **GitHub Actions**.
3. The site goes live at
   `https://cameronsrgriffiths.github.io/taxinsuranceinvestment-advice/`.

The base path is set in `astro.config.mjs` (`base: '/taxinsuranceinvestment-advice'`)
so links resolve correctly under the project subpath.

### Netlify / Vercel / custom domain

These hosts auto-detect Astro — connect the repo and they build with
`npm run build` (output dir `dist`). If you use them (or a custom domain at the
site root), set `base: '/'` in `astro.config.mjs` and update `site` to your
domain.

## Contact form

The contact form posts to [Formspree](https://formspree.io). Replace
`your-form-id` in `src/pages/contact.astro` with your own form endpoint, or swap
the `action` for another form backend. The "Email us" link works as a fallback
in the meantime.

## Disclaimer

Site copy is placeholder marketing content for demonstration. Replace contact
details, statistics, and any regulatory information with your own before going
live, and ensure all financial-promotion and compliance requirements are met.
