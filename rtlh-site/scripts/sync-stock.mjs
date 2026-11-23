// Reads free stock from the RTLH Admin Google Sheet and writes src/data/soldout.json:
// every product colour whose free stock (physical − reserved) is 0 or less.
// Run by .github/workflows/stock-sync.yml. Colours with no stock row are left alone.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PRODUCTS, COLORS } from "../src/data/products.js";

const SHEET = process.env.RTLH_SHEET_URL;
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "soldout.json");
const norm = (s) => String(s || "").trim().toLowerCase().replace(/[’']/g, "").replace(/\s+/g, " ");

const res = await fetch(SHEET, { redirect: "follow" });
const data = JSON.parse(await res.text());
if (!data.ok || !Array.isArray(data.stock)) throw new Error("Sheet did not return stock");

const sold = [];
for (const r of data.stock) {
  const free = (Number(r.physical) || 0) - (Number(r.reserved) || 0);
  if (free > 0) continue;
  const p = ALL_PRODUCTS.find((x) => [x.name, x.adminName, ...(x.aliases || [])].some((n) => norm(n) === norm(r.product)));
  if (!p) continue;
  const c = p.colors.find((x) => norm(COLORS[x.id] ? COLORS[x.id][0] : x.id) === norm(r.color));
  if (c) sold.push(`${p.slug}|${c.id}`);
}
const next = JSON.stringify([...new Set(sold)].sort(), null, 2) + "\n";
const prev = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
if (next !== prev) { fs.writeFileSync(out, next); console.log("changed"); } else console.log("same");
console.log(next);
