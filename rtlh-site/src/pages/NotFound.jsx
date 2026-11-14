import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap center" style={{ maxWidth: 560 }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 44, marginBottom: 12 }}>This page isn't here.</h1>
        <p className="lead muted" style={{ margin: "0 auto 24px" }}>It may have moved. The collection is one tap away.</p>
        <Link to="/shop" className="btn">Shop the collection</Link>
      </div>
    </section>
  );
}
