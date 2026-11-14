import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Instagram, MessageCircle, ArrowRight, Minus, Plus, MapPin, Music2 } from "lucide-react";
import { useCart } from "../lib/cart.jsx";
import { aed, img, personalisationText, waLink } from "../lib/format.js";
import { colorName, CATEGORIES } from "../data/products.js";
import { INSTAGRAM, TIKTOK, WHATSAPP_DISPLAY, CITY, SLOGAN } from "../config.js";
import { catSlug } from "../seo.js";
import { onlineCheckout } from "../lib/api.js";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/gallery", label: "Picture Gallery" },
  { to: "/events", label: "Live Events" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="RTLH home">
      RTLH<small>{SLOGAN.toLowerCase()}</small>
    </Link>
  );
}

function useLockScroll(on) {
  useEffect(() => {
    if (!on) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [on]);
}

export function CartLines({ compact }) {
  const { items, setQty, remove } = useCart();
  return items.map((l) => (
    <div className="line" key={l.key}>
      <Link to={`/product/${l.slug}`} className="line-img">
        <img src={img(l.product.colors.find((c) => c.id === l.color)?.image || l.product.mainImage, 480)} alt="" />
        {l.photoThumb && <img className="ph" src={l.photoThumb} alt="" />}
      </Link>
      <div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <h4>{l.product.name}</h4>
          <b style={{ fontSize: 14.5, whiteSpace: "nowrap" }}>{aed(l.total)}</b>
        </div>
        <div className="meta">
          {colorName(l.color)} · {personalisationText(l)}
        </div>
        <div className="row">
          <div className={`qty ${compact ? "sm" : ""}`}>
            <button aria-label="Fewer" onClick={() => (l.qty > 1 ? setQty(l.key, l.qty - 1) : remove(l.key))}><Minus size={15} /></button>
            <span>{l.qty}</span>
            <button aria-label="More" onClick={() => setQty(l.key, l.qty + 1)}><Plus size={15} /></button>
          </div>
          <button className="rm" onClick={() => remove(l.key)}>Remove</button>
        </div>
      </div>
    </div>
  ));
}

function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen } = useCart();
  useLockScroll(drawerOpen);
  return (
    <>
      <div className={`scrim ${drawerOpen ? "on" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`sheet right ${drawerOpen ? "on" : ""}`} aria-hidden={!drawerOpen} aria-label="Shopping bag">
        <div className="sheet-head">
          <h3>Your bag</h3>
          <button className="icon-btn" aria-label="Close bag" onClick={() => setDrawerOpen(false)}><X size={22} /></button>
        </div>
        <div className="sheet-body">
          {items.length ? <CartLines compact /> : (
            <div className="empty-state">
              <ShoppingBag size={34} strokeWidth={1.4} />
              <p>Your bag is empty.</p>
              <Link className="btn" to="/shop" onClick={() => setDrawerOpen(false)}>Shop the collection</Link>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="sheet-foot">
            <div className="totals" style={{ marginBottom: 14 }}>
              <div><span>Subtotal</span><b>{aed(subtotal)}</b></div>
              <div className="muted small"><span>Delivery calculated at checkout</span></div>
            </div>
            <Link className="btn block" to="/checkout" onClick={() => setDrawerOpen(false)}>
              Checkout <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function MobileMenu({ open, onClose }) {
  useLockScroll(open);
  return (
    <>
      <div className={`scrim ${open ? "on" : ""}`} onClick={onClose} />
      <aside className={`sheet left ${open ? "on" : ""}`} aria-hidden={!open} aria-label="Menu">
        <div className="sheet-head">
          <Logo />
          <button className="icon-btn" aria-label="Close menu" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="sheet-body">
          <nav className="menu-links">
            <Link to="/shop" onClick={onClose}>Shop all <ArrowRight size={20} strokeWidth={1.4} /></Link>
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/shop/${catSlug(c)}`} onClick={onClose} style={{ fontSize: 22, paddingLeft: 14 }}>{c}</Link>
            ))}
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} onClick={onClose}>{n.label} <ArrowRight size={20} strokeWidth={1.4} /></Link>
            ))}
          </nav>
          <div className="menu-sub">
            <a href={waLink("Hello RTLH,")} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> WhatsApp {WHATSAPP_DISPLAY}</a>
            <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer"><Instagram size={18} /> @{INSTAGRAM}</a>
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)" }}><MapPin size={18} /> {CITY}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header() {
  const { count, setDrawerOpen } = useCart();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="announce">Personalised by hand in Dubai · <b>Delivery across the UAE</b></div>
      <header className="header">
        <div className="wrap header-in">
          <div className="header-left">
            <button className="icon-btn mob-only" aria-label="Open menu" onClick={() => setMenu(true)}><Menu size={23} strokeWidth={1.6} /></button>
            <span className="desk-only"><Logo /></span>
          </div>
          <span className="mob-only" style={{ justifySelf: "center" }}><Logo /></span>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
          </nav>
          <div className="header-right">
            <a className="icon-btn desk-only" href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} strokeWidth={1.6} /></a>
            <button className="icon-btn" aria-label={`Bag, ${count} items`} onClick={() => setDrawerOpen(true)}>
              <ShoppingBag size={22} strokeWidth={1.6} />
              {count > 0 && <span className="badge-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ display: "inline-block" }}>RTLH</div>
            <p style={{ marginTop: 14, fontSize: 14, maxWidth: 320 }}>
              Personalised leather pieces and gifts, engraved by hand in the UAE. Live engraving for weddings, brands and private events.
            </p>
            <div style={{ fontSize: 12.5, color: "#a99d92" }}>DED licensed · {CITY}</div>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/shop">All pieces</Link>
            <Link to="/gallery">Picture gallery</Link>
            {CATEGORIES.map((c) => <Link key={c} to={`/shop/${catSlug(c)}`}>{c}</Link>)}
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/faq">FAQ</Link>
            <Link to="/policies/delivery-returns">Delivery & returns</Link>
            <Link to="/policies/terms">Terms</Link>
            <Link to="/policies/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>RTLH</h4>
            <Link to="/events">Live events</Link>
            <Link to="/about">Our story</Link>
            <a href={waLink("Hello RTLH,")} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> {WHATSAPP_DISPLAY}</a>
            <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer"><Instagram size={15} /> @{INSTAGRAM}</a>
            <a href={`https://www.tiktok.com/@${TIKTOK}`} target="_blank" rel="noopener noreferrer"><Music2 size={15} /> TikTok</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RTLH. All rights reserved.</span>
          <span>{onlineCheckout() ? "Secure payments by Ziina · Card · Apple Pay · Google Pay" : "Order online · confirm on WhatsApp"}</span>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  const { pathname } = useLocation();
  const hide = pathname.startsWith("/product/") || pathname.startsWith("/checkout") || pathname.startsWith("/order");
  return (
    <a className={`wa-float ${hide ? "hide" : ""}`} href={waLink("Hello RTLH, I have a question:")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <MessageCircle size={26} />
    </a>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}
