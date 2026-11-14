import React from "react";
import { Link } from "react-router-dom";
import { colorHex } from "../data/products.js";
import { img, srcSet } from "../lib/format.js";
import { Dh } from "./Dirham.jsx";

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
        <div className="card-price"><Dh v={product.price} /></div>
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

