# RTLH — rtlh.art

Retail website for RTLH personalised leather goods: shop, live engraving preview, picture gallery chooser, photo upload,
cart, checkout with Ziina, and a free Google Sheets order backend.

**Start here → [SETUP.md](SETUP.md)** (going live, order alerts, admin app, Ziina).

## Where things are

| Path | What |
|---|---|
| `src/data/products.js` | **Products, prices, colours** — the file you'll edit most |
| `src/config.js` | WhatsApp, order server URL, delivery fee |
| `src/pages/` | Pages (Home, Shop, Product, Checkout, Events, FAQ, policies…) |
| `src/styles.css` | All styling |
| `assets-src/products/` | Original product photos (optimised automatically on build) |
| `assets-src/gallery/` | Engraving designs 1.jpg, 2.jpg… shown in the picture chooser |
| `backend/Code.gs` | Google Apps Script order + payment server |
| `scripts/prerender.mjs` | Builds a real HTML page for every URL, plus `catalog.json` and `sitemap.xml` |

## Commands

```bash
npm install      # once
npm run dev      # local preview at http://localhost:5173
npm run build    # what GitHub runs: photos → build → pre-render into dist/
```

Run the commands inside `rtlh-site/`. Pushing to `main` deploys to rtlh.art via `.github/workflows/deploy-pages.yml`.
