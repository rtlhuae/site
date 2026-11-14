import React from "react";
import { Link } from "react-router-dom";
import { colorHex, FONTS } from "../data/products.js";
import { aed, img, srcSet } from "../lib/format.js";

export function ProductCard({ product, eager }) {
  const alt = product.colors[0]?.image !== product.mainImage ? product.colors[0]?.image : product.colors[1]?.image;
  return (
    <Link to={`/product/${product.slug}`} className="card">
      <div className="card-media">
        <img
          src={img(product.mainImage, 480)} srcSet={srcSet(product.mainImage)}
          sizes="(min-width: 1100px) 280px, (min-width: 700px) 33vw, 50vw"
          alt={product.name} width="480" height="480"
          loading={eager ? "eager" : "lazy"} decoding="async"
        />
        {alt && <img className="alt" src={img(alt, 480)} alt="" aria-hidden="true" loading="lazy" decoding="async" width="480" height="480" />}
        {product.badge && <span className={`pill ${product.badge === "New" ? "new" : ""}`}>{product.badge}</span>}
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>{product.short}</p>
        <div className="card-price">{aed(product.price)}</div>
        {product.colors.length > 1 && (
          <div className="swatches-mini" aria-label={`${product.colors.length} colours`}>
            {product.colors.slice(0, 6).map((c) => <i key={c.id} style={{ background: colorHex(c.id) }} />)}
            {product.colors.length > 6 && <small>+{product.colors.length - 6}</small>}
          </div>
        )}
      </div>
    </Link>
  );
}

function isDark(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.42;
}

/** Live engraving preview drawn on top of the product photo. */
export function EngravingOverlay({ product, colorId, mode, text, fontId, photo }) {
  if (mode === "none") return null;
  const e = product.colors.find((c) => c.id === colorId)?.engrave || product.engrave || { x: 50, y: 50, w: 30, rot: 0 };
  const dark = isDark(colorHex(colorId));
  if (mode === "text") {
    if (!text) return null;
    const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
    const shown = font.upper ? text.toUpperCase() : text;
    const perChar = font.upper ? 0.72 : font.id === "script" ? 0.48 : 0.56;
    const size = Math.min(e.w / Math.max(shown.length, 1) / perChar, e.w * 0.55, 9);
    const style = {
      left: `${e.x}%`, top: `${e.y}%`,
      transform: `translate(-50%, -50%) rotate(${e.rot || 0}deg)`,
      fontFamily: font.css,
      fontSize: `${size}cqw`,
      color: dark ? "rgba(236, 222, 205, 0.88)" : "rgba(58, 34, 24, 0.66)",
      mixBlendMode: dark ? "screen" : "multiply",
      textShadow: dark ? "0 -1px 0 rgba(0,0,0,.35)" : "0 1px 0 rgba(255,255,255,.45)",
      direction: font.arabic ? "rtl" : "ltr",
    };
    return <div className="engrave-layer" aria-hidden="true"><div className="engrave-text" style={style}>{shown}</div></div>;
  }
  if (mode === "photo" && photo) {
    const size = Math.max(e.w * 1.15, 8);
    const style = {
      left: `${e.x}%`, top: `${e.y}%`, width: `${size}%`,
      transform: `translate(-50%, -50%) rotate(${e.rot || 0}deg)`,
      mixBlendMode: dark ? "screen" : "multiply",
      opacity: dark ? 0.7 : 0.85,
    };
    return (
      <div className="engrave-layer" aria-hidden="true">
        <div className="engrave-photo" style={{ ...style, borderRadius: 0 }}>
          <img src={photo} alt="" style={dark ? { filter: "grayscale(1) invert(1) contrast(1.3) sepia(.4)" } : undefined} />
        </div>
      </div>
    );
  }
  return null;
}
