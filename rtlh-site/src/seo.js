import { useEffect } from "react";
import { PRODUCTS, CATEGORIES, findProduct } from "./data/products.js";
import { SITE_URL } from "./config.js";

export const catSlug = (c) => c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const catFromSlug = (s) => CATEGORIES.find((c) => catSlug(c) === s);

const DEFAULT_DESC =
  "Personalised leather gifts, engraved by hand in Dubai. MagSafe wallets, bag charms, mirrors, card holders and jewellery — add a name, initials or your own photo. Delivery across the UAE.";

const STATIC = {
  "/": ["RTLH — Personalised Leather Gifts, Engraved in Dubai", DEFAULT_DESC],
  "/shop": ["Shop Personalised Gifts | RTLH", "Shop engraved MagSafe wallets, heart bag charms, mirrors, card holders and necklaces. Personalise with a name or a photo. UAE delivery."],
  "/events": ["Live Engraving for Events in the UAE | RTLH", "Bring the RTLH live engraving station to your wedding, brand activation or private event. Guests watch their gift personalised in real time."],
  "/about": ["Our Story | RTLH", "RTLH (رتله) is a UAE atelier for personalised leather pieces and live engraving. Made yours."],
  "/contact": ["Contact | RTLH", "Questions about an order, a custom piece or a live engraving booking? Reach RTLH on WhatsApp or Instagram."],
  "/gallery": ["Picture Gallery — Designs to Engrave | RTLH", "Browse RTLH's gallery of engraving designs — Emirati icons, cars, sports, Arabic calligraphy and quotes. Pick one and we engrave it on your piece."],
  "/faq": ["FAQ | RTLH", "Delivery times, engraving, photos, payment and returns — answers to common questions about ordering from RTLH."],
  "/cart": ["Your Bag | RTLH", DEFAULT_DESC],
  "/checkout": ["Checkout | RTLH", DEFAULT_DESC],
  "/order/complete": ["Order | RTLH", DEFAULT_DESC],
  "/policies/delivery-returns": ["Delivery & Returns | RTLH", "How RTLH delivers across the UAE, production times, and our policy for personalised items."],
  "/policies/terms": ["Terms of Sale | RTLH", "Terms of sale for orders placed on rtlh.art."],
  "/policies/privacy": ["Privacy Policy | RTLH", "How RTLH collects and uses your information when you order."],
};

export const NOINDEX = ["/cart", "/checkout", "/order/complete"];

export function metaFor(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  let title, description, image = `${SITE_URL}/img/og.jpg`;
  const prod = path.match(/^\/product\/([^/]+)$/);
  const cat = path.match(/^\/shop\/([^/]+)$/);
  if (prod && findProduct(prod[1])) {
    const p = findProduct(prod[1]);
    title = `${p.name} — Personalised ${p.category} | RTLH`;
    description = `${p.description} AED ${p.price}. Engraved by hand in Dubai, delivered across the UAE.`;
    image = `${SITE_URL}/img/p/${p.mainImage}-960.webp`;
  } else if (cat && catFromSlug(cat[1])) {
    const c = catFromSlug(cat[1]);
    title = `Personalised ${c} | RTLH`;
    description = `Shop engraved ${c.toLowerCase()} from RTLH — personalise with a name, initials or a photo. Delivery across the UAE.`;
  } else if (STATIC[path]) {
    [title, description] = STATIC[path];
  } else {
    title = "Page not found | RTLH";
    description = DEFAULT_DESC;
  }
  return { title, description, image, url: `${SITE_URL}${path === "/" ? "/" : path}`, noindex: NOINDEX.includes(path) };
}

/** Every URL that gets its own pre-built HTML page. */
export function allRoutes() {
  return [
    ...Object.keys(STATIC),
    ...CATEGORIES.map((c) => `/shop/${catSlug(c)}`),
    ...PRODUCTS.map((p) => `/product/${p.slug}`),
  ];
}

export function useSeo(pathname) {
  useEffect(() => {
    const m = metaFor(pathname);
    document.title = m.title;
    const set = (sel, attr, val) => { const el = document.head.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('meta[name="description"]', "content", m.description);
    set('meta[property="og:title"]', "content", m.title);
    set('meta[property="og:description"]', "content", m.description);
    set('meta[property="og:url"]', "content", m.url);
    set('meta[property="og:image"]', "content", m.image);
    set('link[rel="canonical"]', "href", m.url);
  }, [pathname]);
}
