import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Type, Ban, Check, Upload, Info, Minus, Plus, Truck, Clock, MessageCircle, X, Images } from "lucide-react";
import { findProduct, colorName, colorHex, FONTS, unitPrice, PRODUCTS } from "../data/products.js";
import { ProductCard } from "../components/Product.jsx";
import { GalleryPicker, designImg, GALLERY_NUMBERS } from "../components/Gallery.jsx";
import { useCart } from "../lib/cart.jsx";
import { aed, img, srcSet, waLink } from "../lib/format.js";
import { preparePhoto, savePhoto, deletePhoto } from "../lib/photos.js";
import { ALLOW_PHOTO_UPLOAD, PHOTO_MAX_MB, PRODUCTION_DAYS, PICKUP_ENABLED } from "../config.js";
import { catSlug } from "../seo.js";
import NotFound from "./NotFound.jsx";

const ARABIC = /[؀-ۿ]/;

export default function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  if (!product) return <NotFound />;
  return <ProductView key={slug} product={product} />;
}

function ProductView({ product }) {
  const { add } = useCart();
  const [params] = useSearchParams();
  const pz = product.personalise || {};
  const [colorId, setColorId] = useState(product.colors[0].id);
  const [view, setView] = useState("color"); // "color" or an extra photo name
  const [mode, setMode] = useState(pz.text ? "text" : pz.picture ? "photo" : "none");
  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0].id);
  const [source, setSource] = useState("gallery"); // picture source: "gallery" | "upload"
  const [designNo, setDesignNo] = useState("");
  const [photo, setPhoto] = useState(null); // uploaded { id, thumb, lowRes }
  const [picker, setPicker] = useState(false);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef(null);
  const fileRef = useRef(null);

  const color = product.colors.find((c) => c.id === colorId) || product.colors[0];
  const stageImage = view === "color" ? color.image : view;
  const price = unitPrice(product, mode);
  const pictureSrc = mode !== "photo" ? null : source === "gallery" ? (designNo ? designImg(designNo) : null) : photo?.thumb || null;

  // Coming from the gallery page: /product/the-porte?design=12
  useEffect(() => {
    const d = params.get("design");
    if (d && pz.picture && GALLERY_NUMBERS.includes(Number(d))) {
      setMode("photo"); setSource("gallery"); setDesignNo(d);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onText(v) {
    const clean = v.replace(/[\r\n]+/g, " ").slice(0, pz.maxChars || 20);
    setText(clean);
    if (ARABIC.test(clean) && FONTS.some((f) => f.arabic)) setFont(FONTS.find((f) => f.arabic).id);
    setError("");
  }

  async function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) return setError(`That photo is over ${PHOTO_MAX_MB} MB. Please choose a smaller one.`);
    setBusy(true); setError("");
    try {
      const prepared = await preparePhoto(file);
      const id = `ph_${Date.now().toString(36)}`;
      await savePhoto(id, prepared.blob);
      if (photo) deletePhoto(photo.id);
      setPhoto({ id, thumb: prepared.thumb, lowRes: Math.max(prepared.width, prepared.height) < 600 });
      setView("color");
    } catch (err) {
      setError(err.message || "That photo couldn't be read. Please try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  function addToBag() {
    if (mode === "text" && !text.trim()) { setError("Type the text you'd like engraved."); return scrollToOptions(); }
    if (mode === "photo" && source === "gallery" && !designNo) { setError("Choose a picture from the gallery."); return scrollToOptions(); }
    if (mode === "photo" && source === "upload" && !photo) { setError("Upload the photo you'd like engraved."); return scrollToOptions(); }
    const fromGallery = mode === "photo" && source === "gallery";
    add({
      slug: product.slug, color: colorId, qty, mode,
      text: mode === "text" ? text.trim() : "",
      font: mode === "text" ? font : "",
      designNo: fromGallery ? String(designNo) : "",
      photoId: mode === "photo" && !fromGallery ? photo?.id : null,
      photoThumb: mode === "photo" ? (fromGallery ? designImg(designNo) : photo?.thumb) : null,
    });
    // An uploaded photo now belongs to the bag line; start fresh for the next piece.
    setPhoto(null); setText(""); setQty(1); setError(""); setAdded(true);
  }

  function scrollToOptions() {
    document.getElementById("personalise")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const modes = [
    pz.text && { id: "text", icon: Type, label: "Text", sub: "Name or initials" },
    pz.picture && { id: "photo", icon: Images, label: "Picture", sub: "From our gallery" },
    { id: "none", icon: Ban, label: "No engraving", sub: "Plain piece" },
  ].filter(Boolean);

  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);
  const fontObj = FONTS.find((f) => f.id === font) || FONTS[0];
  const extras = [product.mainImage, ...(product.gallery || [])].filter((g) => !product.colors.some((c) => c.image === g));

  return (
    <>
      <div className="wrap">
        <div className="crumbs">
          <Link to="/">Home</Link><span>/</span>
          <Link to={`/shop/${catSlug(product.category)}`}>{product.category}</Link><span>/</span>
          <span>{product.name}</span>
        </div>
        <div className="pdp">
          {/* PHOTOS */}
          <div className="pdp-gallery">
            <div className="stage">
              <img src={img(stageImage, 960)} srcSet={srcSet(stageImage)} sizes="(min-width: 900px) 600px, 100vw" alt={`${product.name} in ${colorName(color.id)}`} width="960" height="960" fetchpriority="high" />
            </div>
            <div className="thumbs" role="list">
              {product.colors.map((c) => (
                <button key={c.id} role="listitem" className={view === "color" && c.id === colorId ? "on" : ""} onClick={() => { setColorId(c.id); setView("color"); }} aria-label={colorName(c.id)}>
                  <img src={img(c.image, 480)} alt="" loading="lazy" />
                </button>
              ))}
              {extras.map((g) => (
                <button key={g} role="listitem" className={view === g ? "on" : ""} onClick={() => setView(g)} aria-label="More photos">
                  <img src={img(g, 480)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO + OPTIONS */}
          <div className="pdp-info">
            <span className="eyebrow">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="price-row"><span className="price">{aed(price)}</span>{price === product.price && mode !== "none" && <span className="muted small">engraving included</span>}</div>
            <p style={{ color: "var(--ink-2)" }}>{product.description}</p>

            {product.colors.length > 1 && (
              <div className="opt">
                <div className="opt-label">Colour <span>{colorName(color.id)}</span></div>
                <div className="swatches">
                  {product.colors.map((c) => (
                    <button key={c.id} className={`swatch ${c.id === colorId ? "on" : ""}`} style={{ background: colorHex(c.id) }} onClick={() => { setColorId(c.id); setView("color"); }} aria-label={colorName(c.id)} aria-pressed={c.id === colorId} />
                  ))}
                </div>
              </div>
            )}

            <div className="opt" id="personalise">
              <div className="opt-label">Personalise</div>
              <div className="modes" style={{ gridTemplateColumns: `repeat(${modes.length}, 1fr)` }}>
                {modes.map((m) => (
                  <button key={m.id} className={`mode ${mode === m.id ? "on" : ""}`} onClick={() => { setMode(m.id); setError(""); setView("color"); }} aria-pressed={mode === m.id}>
                    <m.icon size={20} strokeWidth={1.7} />{m.label}<small>{m.sub}</small>
                  </button>
                ))}
              </div>

              {mode === "text" && (
                <div className="fade-in">
                  <label className="field">
                    <span>Your text</span>
                    <input className={`input big ${error && !text ? "invalid" : ""}`} value={text} onChange={(e) => onText(e.target.value)}
                      placeholder={pz.maxChars === 1 ? "e.g. M" : "e.g. Sara · M.A · مريم"} maxLength={pz.maxChars} autoComplete="off" autoCapitalize="words"
                      style={{ fontFamily: fontObj.css, direction: ARABIC.test(text) ? "rtl" : "ltr" }} />
                  </label>
                  <div className="counter">{text.length}/{pz.maxChars} characters</div>
                  <div className="fonts" role="radiogroup" aria-label="Engraving style">
                    {FONTS.map((f) => (
                      <button key={f.id} className={`font-btn ${font === f.id ? "on" : ""}`} onClick={() => setFont(f.id)} role="radio" aria-checked={font === f.id}>
                        <b style={{ fontFamily: f.css }}>{f.sample}</b><small>{f.label}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "photo" && (
                <div className="fade-in">
                  {ALLOW_PHOTO_UPLOAD && (
                    <div className="subtabs" role="tablist">
                      <button role="tab" aria-selected={source === "gallery"} className={source === "gallery" ? "on" : ""} onClick={() => setSource("gallery")}>Our gallery</button>
                      <button role="tab" aria-selected={source === "upload"} className={source === "upload" ? "on" : ""} onClick={() => setSource("upload")}>Upload your own</button>
                    </div>
                  )}

                  {source === "gallery" && (designNo ? (
                    <div className="chosen">
                      <img src={designImg(designNo)} alt={`Picture ${designNo}`} />
                      <div style={{ flex: 1 }}><b>Picture No. {designNo}</b><button className="link" style={{ marginTop: 6, fontSize: 13 }} onClick={() => setPicker(true)}>Change picture</button></div>
                    </div>
                  ) : (
                    <button className="upload" style={{ marginTop: 14 }} onClick={() => setPicker(true)}>
                      <Images size={24} strokeWidth={1.6} style={{ color: "var(--clay)" }} />
                      <b>Choose a picture</b>
                      <small>{GALLERY_NUMBERS.length}+ designs — Emirati, cars, sports, quotes and more</small>
                    </button>
                  ))}

                  {source === "upload" && (photo ? (
                    <div className="upload-done" style={{ marginTop: 14 }}>
                      <img src={photo.thumb} alt="Your photo" />
                      <div><b>Photo added</b><br /><span className="muted">We'll engrave this photo.</span></div>
                      <button className="icon-btn" aria-label="Remove photo" onClick={() => { deletePhoto(photo.id); setPhoto(null); }}><X size={18} /></button>
                    </div>
                  ) : (
                    <button className="upload" style={{ marginTop: 14 }} onClick={() => fileRef.current?.click()} disabled={busy}>
                      {busy ? <span className="spin dark" /> : <Upload size={24} strokeWidth={1.6} style={{ color: "var(--clay)" }} />}
                      <b>{busy ? "Preparing your photo…" : "Upload your photo"}</b>
                      <small>JPG or PNG, up to {PHOTO_MAX_MB} MB. Logos and simple drawings engrave best.</small>
                    </button>
                  ))}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={onFile} />
                  {source === "upload" && photo?.lowRes && <div className="note"><Info size={16} />This photo is quite small — it may engrave with less detail. A larger one works better.</div>}
                  <div className="note"><Info size={16} />We'll confirm the final artwork with you on WhatsApp before production.</div>
                </div>
              )}
            </div>

            <div className="summary" aria-live="polite">
              <span className="eyebrow" style={{ marginBottom: 8 }}>Your choice</span>
              <div><span>Colour</span><b>{colorName(color.id)}</b></div>
              <div><span>Engraving</span><b style={mode === "text" && text ? { fontFamily: fontObj.css } : undefined}>
                {mode === "none" ? "No engraving"
                  : mode === "text" ? (text ? `“${text}”` : "Add your text above")
                  : source === "gallery" ? (designNo ? `Picture No. ${designNo}` : "Choose a picture above")
                  : (photo ? "Your own photo" : "Upload your photo above")}
              </b></div>
              {mode === "text" && text && <div><span>Style</span><b>{fontObj.label}</b></div>}
              {mode === "photo" && pictureSrc && <img src={pictureSrc} alt="" className="summary-pic" />}
            </div>

            {error && <div className="err" role="alert">{error}</div>}

            <div className="buy-row" ref={buyRef}>
              <div className="qty">
                <button aria-label="Fewer" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                <span>{qty}</span>
                <button aria-label="More" onClick={() => setQty(Math.min(20, qty + 1))}><Plus size={16} /></button>
              </div>
              <button className="btn" onClick={addToBag} disabled={busy}>Add to bag · {aed(price * qty)}</button>
            </div>
            {added && <p className="muted small" style={{ marginTop: 10 }}>Added ✓ — personalise another one, or <Link className="link" style={{ fontSize: 13 }} to="/checkout">go to checkout</Link>.</p>}

            <ul className="details-list">
              {product.details.map((d) => <li key={d}><Check size={16} />{d}</li>)}
              <li><Clock size={16} />Ready in {PRODUCTION_DAYS}</li>
              <li><Truck size={16} />Delivery across the UAE{PICKUP_ENABLED ? " · or pick up in Dubai" : ""}</li>
            </ul>

            <div className="acc">
              <details>
                <summary>About the engraving</summary>
                <div>Every piece is engraved by hand — our engravers set the size and placement to suit each piece. Product photos are for reference.</div>
              </details>
              <details>
                <summary>Delivery & returns</summary>
                <div>We deliver across the UAE. Because each piece is personalised for you, personalised items can't be returned unless they arrive faulty. <Link to="/policies/delivery-returns" className="link" style={{ fontSize: 13 }}>Full policy</Link></div>
              </details>
              <details>
                <summary>Need help?</summary>
                <div>
                  Not sure what to engrave, or ordering for an event? <a className="link" style={{ fontSize: 13 }} href={waLink(`Hello RTLH, I have a question about ${product.name}.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} /> Ask us on WhatsApp</a>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <section className="section bg-sand">
        <div className="wrap">
          <h2 style={{ marginBottom: 24 }}>You may also like</h2>
          <div className="grid four">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>

      <div className={`sticky-buy ${showSticky ? "on" : ""}`}>
        <div><div style={{ fontSize: 13, color: "var(--muted)" }}>{product.name}</div><div className="p">{aed(price * qty)}</div></div>
        <button className="btn" onClick={addToBag}>Add to bag</button>
      </div>

      <GalleryPicker open={picker} onClose={() => setPicker(false)} selected={designNo} productName={product.name}
        onPick={(n) => { setDesignNo(String(n)); setSource("gallery"); setMode("photo"); setView("color"); setError(""); }} />
    </>
  );
}
