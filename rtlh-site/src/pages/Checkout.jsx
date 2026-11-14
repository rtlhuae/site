import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, ShoppingBag, MessageCircle, ChevronLeft } from "lucide-react";
import { useCart, deliveryFor } from "../lib/cart.jsx";
import { CartLines } from "../components/Layout.jsx";
import { aed, lineSummary, waLink } from "../lib/format.js";
import { createOrder, onlineCheckout } from "../lib/api.js";
import { EMIRATES, PICKUP_ENABLED, DELIVERY_FEE, FREE_DELIVERY_OVER, CITY } from "../config.js";

const SAVED = "rtlh_customer";

export function CartPage() {
  const { items, subtotal, loaded } = useCart();
  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 44, marginBottom: 10 }}>Your bag</h1>
        {!loaded ? null : items.length ? (
          <>
            <CartLines />
            <div className="totals" style={{ margin: "20px 0" }}>
              <div><span>Subtotal</span><b>{aed(subtotal)}</b></div>
              <div className="muted small"><span>Delivery calculated at checkout</span></div>
            </div>
            <Link className="btn block" to="/checkout">Checkout <ArrowRight size={16} /></Link>
          </>
        ) : (
          <div className="empty-state"><ShoppingBag size={34} strokeWidth={1.4} /><p>Your bag is empty.</p><Link className="btn" to="/shop">Shop the collection</Link></div>
        )}
      </div>
    </section>
  );
}

function deliveryNote() {
  if (!DELIVERY_FEE) return "Free";
  if (FREE_DELIVERY_OVER) return `${aed(DELIVERY_FEE)} · free over ${aed(FREE_DELIVERY_OVER)}`;
  return aed(DELIVERY_FEE);
}

export default function Checkout() {
  const { items, subtotal, loaded, clear } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const online = onlineCheckout();
  const [f, setF] = useState({ name: "", phone: "", email: "", method: "delivery", emirate: "Dubai", area: "", address: "", notes: "", gift: "", agree: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(params.get("cancelled") ? "Payment was cancelled — your bag is still here. You can try again whenever you're ready." : "");
  const [waSent, setWaSent] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SAVED) || "null");
      const draft = JSON.parse(sessionStorage.getItem("rtlh_checkout_draft") || "null");
      if (s || draft) setF((p) => ({ ...p, ...(s || {}), ...(draft || {}), agree: false }));
    } catch { /* ignore */ }
  }, []);

  const delivery = deliveryFor(subtotal, f.method);
  const total = subtotal + delivery;
  const set = (k) => (e) => { const v = e.target.type === "checkbox" ? e.target.checked : e.target.value; setF((p) => ({ ...p, [k]: v })); setErrors((x) => ({ ...x, [k]: "" })); };

  function validate() {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Please enter your name.";
    if (f.phone.replace(/\D/g, "").length < 9) e.phone = "Please enter a mobile number we can reach on WhatsApp.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "That email doesn't look right.";
    if (f.method === "delivery") {
      if (!f.area.trim()) e.area = "Please enter your area.";
      if (f.address.trim().length < 4) e.address = "Please enter your building / villa and street.";
    }
    if (online && !f.agree) e.agree = "Please confirm you've checked your personalisation.";
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return false;
    }
    return true;
  }

  const customer = useMemo(() => ({ name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() }), [f.name, f.phone, f.email]);
  const deliveryInfo = { method: f.method, emirate: f.method === "delivery" ? f.emirate : "", area: f.area.trim(), address: f.address.trim(), notes: f.notes.trim() };

  async function submit(e) {
    e.preventDefault();
    setFail("");
    if (!validate()) return;
    try {
      const { agree, ...keep } = f;
      localStorage.setItem(SAVED, JSON.stringify({ ...keep, notes: "", gift: "" }));   // remembered for next time
      sessionStorage.setItem("rtlh_checkout_draft", JSON.stringify(keep));               // restored if payment is cancelled
    } catch { /* ignore */ }

    if (!online) {
      const msg = [
        "Hello RTLH, I'd like to place an order:",
        "",
        ...items.map((l) => `• ${lineSummary(l)} — ${aed(l.total)}`),
        "",
        `Subtotal: ${aed(subtotal)}`,
        `Delivery: ${f.method === "pickup" ? `Pick up (${CITY})` : `${aed(delivery)} — ${f.emirate}, ${f.area}, ${f.address}`}`,
        `Total: ${aed(total)}`,
        "",
        `Name: ${customer.name}`,
        `Phone: ${customer.phone}`,
        customer.email ? `Email: ${customer.email}` : null,
        f.notes ? `Notes: ${f.notes}` : null,
        f.gift ? `Gift note: ${f.gift}` : null,
        items.some((l) => l.mode === "photo" && !l.designNo) ? "\nI'll send the photo(s) for engraving in this chat." : null,
      ].filter((x) => typeof x === "string").join("\n");
      window.open(waLink(msg), "_blank", "noopener");
      setWaSent(true);
      return;
    }

    setBusy(true);
    try {
      const res = await createOrder({ customer, delivery: deliveryInfo, giftNote: f.gift.trim(), items });
      try { sessionStorage.setItem("rtlh_pending", JSON.stringify({ order: res.orderId, token: res.token })); } catch { /* ignore */ }
      window.location.href = res.payUrl;
    } catch (err) {
      setFail(err.message || "We couldn't start the payment. Please try again.");
      setBusy(false);
    }
  }

  if (!loaded) return <section className="section"><div className="wrap center"><span className="spin dark" style={{ display: "inline-block" }} /></div></section>;

  if (!items.length) {
    return (
      <section className="section"><div className="wrap empty-state">
        <ShoppingBag size={34} strokeWidth={1.4} /><p>Your bag is empty.</p><Link className="btn" to="/shop">Shop the collection</Link>
      </div></section>
    );
  }

  if (waSent) {
    return (
      <section className="section"><div className="wrap center" style={{ maxWidth: 560 }}>
        <MessageCircle size={36} style={{ color: "#25d366", margin: "0 auto 12px" }} />
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>Almost done</h1>
        <p className="lead muted" style={{ margin: "0 auto 22px" }}>
          WhatsApp opened with your order. <b>Press send</b> and we'll confirm the details and payment with you there.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <button className="btn" onClick={() => { clear(); navigate("/"); }}>I've sent it — clear my bag</button>
          <button className="btn ghost" onClick={() => setWaSent(false)}>Back to checkout</button>
        </div>
      </div></section>
    );
  }

  const Err = ({ k }) => (errors[k] ? <div className="err">{errors[k]}</div> : null);

  return (
    <div className="wrap">
      <div className="crumbs"><Link to="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><ChevronLeft size={15} /> Continue shopping</Link></div>
      <form className="co" onSubmit={submit} noValidate>
        <div>
          <h2>Checkout</h2>
          <p className="muted small" style={{ marginBottom: 18 }}>{online ? "Pay securely by card, Apple Pay or Google Pay." : "Send your order on WhatsApp and we'll confirm payment and delivery with you."}</p>

          <div className="co-block">
            <h3><i>1</i>Your details</h3>
            <label className="field"><span>Full name</span><input className={`input ${errors.name ? "invalid" : ""}`} name="name" autoComplete="name" value={f.name} onChange={set("name")} /></label><Err k="name" />
            <label className="field"><span>Mobile (WhatsApp)</span><input className={`input ${errors.phone ? "invalid" : ""}`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+971 5x xxx xxxx" value={f.phone} onChange={set("phone")} /></label><Err k="phone" />
            <label className="field"><span>Email <span className="muted">(optional, for your receipt)</span></span><input className={`input ${errors.email ? "invalid" : ""}`} name="email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} /></label><Err k="email" />
          </div>

          <div className="co-block">
            <h3><i>2</i>Delivery</h3>
            <div className="radio-cards">
              <label className={`radio-card ${f.method === "delivery" ? "on" : ""}`}>
                <input type="radio" name="method" value="delivery" checked={f.method === "delivery"} onChange={set("method")} />
                <div><b>Deliver to me</b>Anywhere in the UAE</div><span>{deliveryNote()}</span>
              </label>
              {PICKUP_ENABLED && (
                <label className={`radio-card ${f.method === "pickup" ? "on" : ""}`}>
                  <input type="radio" name="method" value="pickup" checked={f.method === "pickup"} onChange={set("method")} />
                  <div><b>Pick up</b>{CITY} — we'll WhatsApp you the location</div><span>Free</span>
                </label>
              )}
            </div>
            {f.method === "delivery" && (
              <div className="fade-in">
                <div className="two">
                  <label className="field"><span>Emirate</span>
                    <select className="select" name="emirate" value={f.emirate} onChange={set("emirate")}>{EMIRATES.map((x) => <option key={x}>{x}</option>)}</select>
                  </label>
                  <label className="field"><span>Area</span><input className={`input ${errors.area ? "invalid" : ""}`} name="area" placeholder="e.g. Al Barsha" value={f.area} onChange={set("area")} /></label>
                </div>
                <Err k="area" />
                <label className="field"><span>Building / villa, street</span><input className={`input ${errors.address ? "invalid" : ""}`} name="address" autoComplete="street-address" value={f.address} onChange={set("address")} /></label><Err k="address" />
              </div>
            )}
            <label className="field"><span>Notes <span className="muted">(optional)</span></span><input className="input" name="notes" placeholder="Delivery time, landmark, a date you need it by…" value={f.notes} onChange={set("notes")} /></label>
            <label className="field"><span>Gift note <span className="muted">(optional)</span></span><textarea className="textarea" name="gift" maxLength={200} placeholder="A short message to go with the gift." value={f.gift} onChange={set("gift")} /></label>
          </div>
        </div>

        <div className="co-summary">
          <div className="co-block">
            <h3><i>3</i>Your order</h3>
            <CartLines compact />
            <div className="totals" style={{ marginTop: 16 }}>
              <div><span>Subtotal</span><span>{aed(subtotal)}</span></div>
              <div><span>Delivery</span><span>{delivery ? aed(delivery) : "Free"}</span></div>
              <div className="grand"><span>Total</span><span>{aed(total)}</span></div>
            </div>
            {online && (
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16, fontSize: 13.5, color: "var(--ink-2)", cursor: "pointer" }}>
                <input type="checkbox" name="agree" checked={f.agree} onChange={set("agree")} style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--ink)" }} />
                <span>I've checked the spelling and photos above. I understand personalised items are made for me and agree to the <Link to="/policies/terms" target="_blank" className="link" style={{ fontSize: 13 }}>terms</Link>.</span>
              </label>
            )}
            <Err k="agree" />
            {fail && <div className="alert bad" role="alert">{fail}</div>}
            <button className="btn block clay" type="submit" disabled={busy} style={{ marginTop: 16 }}>
              {busy ? <><span className="spin" /> Starting secure payment…</> : online ? <><Lock size={16} /> Pay {aed(total)}</> : <><MessageCircle size={17} /> Send order on WhatsApp</>}
            </button>
            {online ? (
              <div className="paybox"><Lock size={13} /> Secured by Ziina <span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span></div>
            ) : (
              <p className="muted small center" style={{ marginTop: 10 }}>We'll confirm your order and payment details on WhatsApp.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
