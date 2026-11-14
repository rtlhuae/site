import React from "react";
import { Link, useParams } from "react-router-dom";
import { PRODUCTS, CATEGORIES } from "../data/products.js";
import { ProductCard } from "../components/Product.jsx";
import { catSlug, catFromSlug } from "../seo.js";
import NotFound from "./NotFound.jsx";

export default function Shop() {
  const { cat } = useParams();
  const category = cat ? catFromSlug(cat) : null;
  if (cat && !category) return <NotFound />;
  const shown = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="wrap">
        <div className="crumbs"><Link to="/">Home</Link><span>/</span>{category ? <><Link to="/shop">Shop</Link><span>/</span><span>{category}</span></> : <span>Shop</span>}</div>
        <h1 style={{ fontSize: "clamp(36px,8vw,56px)", marginBottom: 8 }}>{category ? `Personalised ${category}` : "Shop all pieces"}</h1>
        <p className="lead muted" style={{ marginBottom: 22 }}>
          Choose a piece and a colour, then add a name, initials or your own photo. Every piece is engraved by hand in Dubai.
        </p>
        <nav className="chips" aria-label="Categories" style={{ marginBottom: 26 }}>
          <Link to="/shop" className={`chip ${!category ? "on" : ""}`}>All ({PRODUCTS.length})</Link>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/shop/${catSlug(c)}`} className={`chip ${category === c ? "on" : ""}`}>{c}</Link>
          ))}
        </nav>
        <div className="grid four">
          {shown.map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 4} />)}
        </div>
      </div>
    </section>
  );
}
