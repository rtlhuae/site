import React, { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import GALLERY from "../data/gallery.json";

export const designImg = (n) => `/img/g/${n}.webp`;
export const GALLERY_NUMBERS = GALLERY;

/** Grid of numbered designs. Tap one → onPick(number). */
export function DesignGrid({ onPick, selected }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => (q ? GALLERY.filter((n) => String(n).startsWith(q)) : GALLERY), [q]);
  return (
    <>
      <label className="gallery-search">
        <Search size={17} />
        <input inputMode="numeric" placeholder="Picture number" value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Find a picture by number" />
        <span className="muted small">{list.length} pictures</span>
      </label>
      <div className="design-grid">
        {list.map((n) => (
          <button key={n} className={`design ${String(selected) === String(n) ? "on" : ""}`} onClick={() => onPick(n)} aria-label={`Choose picture ${n}`}>
            <img src={designImg(n)} alt="" loading="lazy" decoding="async" width="360" height="360" />
            <span>{n}</span>
          </button>
        ))}
        {!list.length && <p className="muted" style={{ gridColumn: "1 / -1" }}>No picture with that number.</p>}
      </div>
    </>
  );
}

/** Full-screen picture chooser used on product pages. */
export function GalleryPicker({ open, onClose, onPick, selected, productName }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="picker" role="dialog" aria-modal="true" aria-label="Choose a picture">
      <div className="picker-head">
        <div>
          <span className="eyebrow" style={{ marginBottom: 4 }}>Picture gallery</span>
          <h3>Choose your picture{productName ? ` for ${productName}` : ""}</h3>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={22} /></button>
      </div>
      <div className="picker-body">
        <p className="muted small" style={{ margin: "0 0 12px" }}>Tap a picture to select it.</p>
        <DesignGrid selected={selected} onPick={(n) => { onPick(n); onClose(); }} />
      </div>
    </div>
  );
}
