// @ts-check
import { defineConfig } from 'astro/config';

// Configured for GitHub Pages project hosting at:
//   https://cameronsrgriffiths.github.io/taxinsuranceinvestment-advice/
//
// If you deploy to Netlify, Vercel, or a custom domain instead, change `base`
// to '/' (and set `site` to your domain). The site uses import.meta.env.BASE_URL
// for all internal links, so updating these two values is all that's required.
export default defineConfig({
  site: 'https://cameronsrgriffiths.github.io',
  base: '/taxinsuranceinvestment-advice',
});
