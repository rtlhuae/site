// After `vite build`, turn every route into its own real HTML page:
//   dist/index.html, dist/shop/index.html, dist/product/the-porte/index.html …
// so links like rtlh.art/shop open directly (GitHub Pages serves folders), Google
// can read each page, and the page shows instantly before JavaScript loads.
// Also writes catalog.json (prices for the payment server), sitemap.xml, robots.txt, 404.html.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssr = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href);
const { render, metaFor, allRoutes, PRODUCTS, COLORS, DELIVERY_FEE, FREE_DELIVERY_OVER, PICKUP_ENABLED, SITE_URL } = ssr;

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page(url, html) {
  const m = metaFor(url);
  let out = template
    .replace(/<title>.*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(m.description)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${esc(m.url)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(m.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(m.description)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${esc(m.url)}"`)
    .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${esc(m.image)}"`)
    .replace("<!--robots-->", m.noindex ? '<meta name="robots" content="noindex" />' : "")
    .replace("<!--app-->", html);
  const ld = jsonLd(url);
  out = out.replace("<!--jsonld-->", ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>` : "");
  return out;
}

function jsonLd(url) {
  const prod = url.match(/^\/product\/([^/]+)$/);
  if (prod) {
    const p = PRODUCTS.find((x) => x.slug === prod[1]);
    return {
      "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
      image: [p.mainImage, ...p.colors.map((c) => c.image)].map((n) => `${SITE_URL}/img/p/${n}-960.webp`),
      brand: { "@type": "Brand", name: "RTLH" }, category: p.category,
      offers: { "@type": "Offer", priceCurrency: "AED", price: p.price, availability: "https://schema.org/InStock", url: `${SITE_URL}${url}` },
    };
  }
  if (url === "/") {
    return {
      "@context": "https://schema.org", "@type": "Store", name: "RTLH", alternateName: "رتله", url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`, image: `${SITE_URL}/img/og.jpg`, priceRange: "AED",
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
      sameAs: ["https://instagram.com/rtlh.ae", "https://www.tiktok.com/@rtlh.ae"],
    };
  }
  return null;
}

const routes = allRoutes();
for (const url of routes) {
  const file = url === "/" ? path.join(dist, "index.html") : path.join(dist, url, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(url, render(url)));
}

// Unknown URLs: GitHub Pages serves 404.html, which loads the app and shows "not found".
fs.writeFileSync(path.join(dist, "404.html"), page("/404", "").replace("<!--robots-->", ""));

// Prices the payment server trusts (it never trusts prices sent by the browser).
const catalog = {
  updated: new Date().toISOString(),
  delivery: { fee: DELIVERY_FEE, freeOver: FREE_DELIVERY_OVER, pickup: PICKUP_ENABLED },
  products: Object.fromEntries(PRODUCTS.map((p) => [p.slug, {
    name: p.name, adminName: p.adminName || p.name, price: p.price,
    textPrice: p.personalise.textPrice || 0, photoPrice: p.personalise.picturePrice || 0,
    text: !!p.personalise.text, photo: !!p.personalise.picture, maxChars: p.personalise.maxChars || 0,
    colors: p.colors.map((c) => c.id),
    colorNames: Object.fromEntries(p.colors.map((c) => [c.id, COLORS[c.id] ? COLORS[c.id][0] : c.id])),
  }])),
};
fs.writeFileSync(path.join(dist, "catalog.json"), JSON.stringify(catalog, null, 1));

const indexable = routes.filter((r) => !metaFor(r).noindex);
fs.writeFileSync(path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((r) => `  <url><loc>${SITE_URL}${r}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nDisallow: /checkout\nDisallow: /order/\nSitemap: ${SITE_URL}/sitemap.xml\n`);

fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${routes.length} pages + 404, catalog.json, sitemap.xml`);
