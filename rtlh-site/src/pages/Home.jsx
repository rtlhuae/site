import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, PenLine, Images, ShieldCheck, Gift, Sparkles, Instagram } from "lucide-react";
import { designImg, GALLERY_NUMBERS } from "../components/Gallery.jsx";
import { PRODUCTS, CATEGORIES, ENGRAVING_FREE } from "../data/products.js";
import { ProductCard } from "../components/Product.jsx";
import { catSlug } from "../seo.js";
import { INSTAGRAM, PICKUP_ENABLED } from "../config.js";
import { onlineCheckout } from "../lib/api.js";

const ig = (k) => `/img/ig/${k}.webp`;

export default function Home() {
  const best = PRODUCTS.filter((p) => p.badge === "Bestseller");
  const rest = PRODUCTS.filter((p) => p.badge !== "Bestseller");
  return (
    <>
      {/* HERO — straight to the product */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Personalised leather gifts · UAE</span>
            <h1>Engraved with a name.<br /><em>Made yours.</em></h1>
            <p className="lead">
              MagSafe wallets, heart charms, mirrors and more — personalised with initials, a name or a picture from our gallery,
              engraved by hand in Dubai and delivered across the UAE.
            </p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn">Shop the collection <ArrowRight size={16} /></Link>
              <Link to="/product/the-porte" className="btn ghost">Design your Porte</Link>
            </div>
            <div className="trust">
              <span><PenLine size={16} /> {ENGRAVING_FREE ? "Free engraving" : "Hand engraved"}</span>
              <span><Images size={16} /> {GALLERY_NUMBERS.length}+ pictures to engrave</span>
              <span><Truck size={16} /> UAE delivery</span>
            </div>
          </div>
          <div className="hero-media">
            <img src={ig("wallets-colour-1024")} alt="RTLH MagSafe card wallets in forest green, blue, blush and orange leather" width="1024" height="1024" fetchpriority="high" />
            <Link to="/product/the-porte" className="hero-tag">
              <img src="/img/p/MagsafeMain-480.webp" alt="" width="48" height="48" />
              <div><b>The Porte</b>20 colours · engraved with your initials or a picture</div>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS + BESTSELLERS */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Bestsellers</span>
              <h2>Most-gifted pieces</h2>
            </div>
            <Link to="/shop" className="link desk-only">View all <ArrowRight size={15} /></Link>
          </div>
          <nav className="chips" aria-label="Categories" style={{ marginBottom: 22 }}>
            <Link to="/shop" className="chip on">All</Link>
            {CATEGORIES.map((c) => <Link key={c} to={`/shop/${catSlug(c)}`} className="chip">{c}</Link>)}
          </nav>
          <div className="grid four">
            {[...best, ...rest].slice(0, 8).map((p, i) => <ProductCard key={p.slug} product={p} eager={i < 2} />)}
          </div>
          <div className="center mob-only" style={{ marginTop: 26 }}>
            <Link to="/shop" className="btn ghost block">View all pieces</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-sand">
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h2 style={{ marginBottom: 28 }}>Personalised in three steps</h2>
          <div className="steps">
            <div className="step"><span className="n">1</span><h3>Pick your piece</h3><p>Choose a product and a leather colour.</p></div>
            <div className="step"><span className="n">2</span><h3>Make it yours</h3><p>Type a name or initials, or choose a picture from our gallery — and see it on your piece before you order.</p></div>
            <div className="step"><span className="n">3</span><h3>We engrave & deliver</h3><p>Every piece is engraved by hand in Dubai and delivered to your door across the UAE.</p></div>
          </div>
        </div>
      </section>

      {/* PHOTO ENGRAVING */}
      <section className="section">
        <div className="wrap split">
          <div>
            <div className="design-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
              {[1, 7, 8, 20, 30, 95].filter((n) => GALLERY_NUMBERS.includes(n)).map((n) => (
                <Link key={n} to={`/gallery`} className="design"><img src={designImg(n)} alt={`Engraving design ${n}`} loading="lazy" /><span>{n}</span></Link>
              ))}
            </div>
            <div className="split-media" style={{ aspectRatio: "16/9", marginTop: 10 }}><img src={ig("falcon-engraving-666")} alt="A blue leather wallet engraved with a falcon crest, on the engraving bed" loading="lazy" /></div>
          </div>
          <div>
            <span className="eyebrow">Picture engraving</span>
            <h2 style={{ marginBottom: 14 }}>Choose a picture. We engrave it.</h2>
            <p className="lead">
              {GALLERY_NUMBERS.length}+ designs — Emirati icons, cars, number plates, Arabic calligraphy, quotes and more.
              Tap one on any product to see it on your piece, and we'll confirm the artwork with you on WhatsApp before engraving.
            </p>
            <Link to="/gallery" className="btn" style={{ marginTop: 6 }}>Browse the gallery <Images size={17} /></Link>
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className="section tight" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap perks">
          <div className="perk"><PenLine size={22} /><b>{ENGRAVING_FREE ? "Engraving included" : "Hand engraved"}</b>{ENGRAVING_FREE ? "Text or picture, at no extra cost." : "Text or picture, set by hand."}</div>
          <div className="perk"><Truck size={22} /><b>UAE delivery</b>{PICKUP_ENABLED ? "To every emirate, or pick up in Dubai." : "To every emirate."}</div>
          <div className="perk"><Gift size={22} /><b>Ready to gift</b>Add a gift note at checkout.</div>
          <div className="perk"><ShieldCheck size={22} /><b>{onlineCheckout() ? "Secure payment" : "Easy ordering"}</b>{onlineCheckout() ? "Card, Apple Pay & Google Pay via Ziina." : "Order online, confirm on WhatsApp."}</div>
        </div>
      </section>

      {/* EVENTS — secondary */}
      <section className="section">
        <div className="wrap split rev">
          <div className="split-media"><img src={ig("popup-counter-800")} alt="The RTLH engraving counter at a pop-up, set with gift bags, leather charms and a tablet" loading="lazy" /></div>
          <div>
            <span className="eyebrow">Live engraving · Events</span>
            <h2 style={{ marginBottom: 14 }}>Bring the RTLH station to your event.</h2>
            <p className="lead">
              Weddings, brand activations and private gatherings — guests pick a piece and watch it engraved in front of them.
            </p>
            <Link to="/events" className="link">Book a live experience <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="section tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">@{INSTAGRAM}</span><h2>Follow the atelier</h2></div>
            <a className="link" href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer"><Instagram size={15} /> Instagram</a>
          </div>
          <div className="ig-row">
            {["wallets-quartet-1024", "cognac-bed-576", "gift-glove-800", "tennis-charm-924", "cardholders-studio-800", "burgundy-hand-800"].map((k) => (
              <a key={k} href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer" aria-label="RTLH on Instagram">
                <img src={ig(k)} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="band bg-ink">
            <Sparkles size={26} style={{ color: "#d9b9a9", margin: "0 auto 12px" }} />
            <h2 style={{ color: "#fff" }}>A gift with their name on it.</h2>
            <p style={{ color: "#d9cec3", maxWidth: 460, margin: "0 auto 22px" }}>Find the piece, add the name, and we'll take care of the rest.</p>
            <Link to="/shop" className="btn light">Start personalising <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
