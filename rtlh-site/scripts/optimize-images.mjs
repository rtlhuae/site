// Turns the original photos in assets-src/ into small, fast WebP files in public/img/.
// Runs automatically at the start of every build (GitHub does it for you).
//
// • Product photo:  drop e.g. ThePorteBlack.png into assets-src/products/, then use
//                   image: "ThePorteBlack" in src/data/products.js
// • Gallery design: drop 101.jpg (any number) into assets-src/gallery/ — it appears
//                   in the picture chooser automatically.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const jobs = [
  { src: "assets-src/products", out: "public/img/p", sizes: [480, 960], square: true },
  { src: "assets-src/lifestyle", out: "public/img/l", sizes: [800, 1400], square: false },
  { src: "assets-src/gallery", out: "public/img/g", sizes: [360], square: true, plain: true },
];

const galleryNumbers = [];
for (const job of jobs) {
  const srcDir = path.join(ROOT, job.src);
  const outDir = path.join(ROOT, job.out);
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const name = file.replace(/\.[^.]+$/, "");
    if (job.plain) {
      if (!/^\d+$/.test(name)) continue;
      galleryNumbers.push(Number(name));
    }
    const input = path.join(srcDir, file);
    const srcTime = fs.statSync(input).mtimeMs;
    for (const w of job.sizes) {
      const out = path.join(outDir, job.plain ? `${name}.webp` : `${name}-${w}.webp`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs > srcTime) continue;
      let img = sharp(input).rotate();
      img = job.square
        ? img.resize(w, w, { fit: "contain", background: "#ffffff" }).flatten({ background: "#ffffff" })
        : img.resize({ width: w, withoutEnlargement: true });
      await img.webp({ quality: job.plain ? 82 : 80, effort: 5 }).toFile(out);
      console.log("wrote", path.relative(ROOT, out));
    }
  }
}

galleryNumbers.sort((a, b) => a - b);
fs.writeFileSync(path.join(ROOT, "src", "data", "gallery.json"), JSON.stringify(galleryNumbers) + "\n");
console.log(`gallery: ${galleryNumbers.length} designs`);
