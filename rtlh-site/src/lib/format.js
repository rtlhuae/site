import { colorName, FONTS } from "../data/products.js";
import { WHATSAPP_NUMBER } from "../config.js";

export const aed = (n) => `AED ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
export const img = (name, w = 960) => `/img/p/${name}-${w}.webp`;
export const srcSet = (name) => `/img/p/${name}-480.webp 480w, /img/p/${name}-960.webp 960w`;

export const fontLabel = (id) => (FONTS.find((f) => f.id === id) || {}).label || id;

export function personalisationText(line) {
  if (line.mode === "text") return `Engraved: “${line.text}” · ${fontLabel(line.font)}`;
  if (line.mode === "photo") return line.designNo ? `Picture No. ${line.designNo}` : "Picture · your own photo";
  return "No engraving";
}

export const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export function lineSummary(l) {
  return `${l.qty} × ${l.product.name} (${colorName(l.color)}) — ${personalisationText(l)}`;
}
