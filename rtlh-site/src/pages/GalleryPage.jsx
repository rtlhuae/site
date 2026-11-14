import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { DesignGrid, designImg } from "../components/Gallery.jsx";
import { PRODUCTS } from "../data/products.js";
import { aed, img } from "../lib/format.js";

export default function GalleryPage() {
  const [chosen, setChosen] = useState(null);
  const products = PRODUCTS.filter((p) => p.personalise?.picture);
  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="wrap">
        <div className="crumbs"><Link to="/">Home</Link><span>/</span><span>Picture gallery</span></div>
        <h1 style={{ fontSize: "clamp(36px,8vw,56px)", marginBottom: 8 }}>Picture gallery</h1>
        <p className="lead muted" style={{ marginBottom: 22 }}>
          Pick a design and we'll engrave it on your piece. Tap a picture to choose what it goes on.
        </p>
        <DesignGrid onPick={setChosen} selected={chosen} />
      </div>

      {chosen && (
        <>
          <div className="scrim on" onClick={() => setChosen(null)} />
          <aside className="sheet right on" aria-label={`Engrave picture ${chosen}`}>
            <div className="sheet-head">
              <h3>Picture No. {chosen}</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => setChosen(null)}><X size={22} /></button>
            </div>
            <div className="sheet-body">
              <img src={designImg(chosen)} alt={`Picture ${chosen}`} style={{ width: 160, height: 160, objectFit: "contain", margin: "10px auto 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 10 }} />
              <p className="muted small center" style={{ marginBottom: 6 }}>Engrave it on…</p>
              {products.map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}?design=${chosen}`} className="line" style={{ alignItems: "center" }}>
                  <span className="line-img"><img src={img(p.mainImage, 480)} alt="" /></span>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span><h4>{p.name}</h4><span className="muted small">{aed(p.price)}</span></span>
                    <ArrowRight size={18} />
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </>
      )}
    </section>
  );
}
