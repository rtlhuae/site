import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, MessageCircle } from "lucide-react";
import { orderStatus } from "../lib/api.js";
import { useCart } from "../lib/cart.jsx";
import { aed, waLink } from "../lib/format.js";

// Ziina sends the customer back here. We never trust the URL alone — we ask
// our server, which asks Ziina, whether the payment really went through.
export default function OrderComplete() {
  const [params] = useSearchParams();
  const { clear, loaded } = useCart();
  const [state, setState] = useState({ phase: "checking" });
  const cleared = useRef(false);

  useEffect(() => {
    let order = params.get("order"), token = params.get("t");
    if (!order) {
      try { const p = JSON.parse(sessionStorage.getItem("rtlh_pending") || "null"); if (p) { order = p.order; token = p.token; } } catch { /* ignore */ }
    }
    if (!order) return setState({ phase: "missing" });
    let tries = 0, stop = false;
    async function poll() {
      try {
        const r = await orderStatus(order, token);
        if (stop) return;
        if (r.status === "paid") return setState({ phase: "paid", order: r.order });
        if (r.status === "received") return setState({ phase: "received", order: r.order });
        if (r.status === "failed" || r.status === "cancelled") return setState({ phase: "failed", order: r.order, reason: r.status });
        if (++tries < 8) return setTimeout(poll, 2500);
        setState({ phase: "pending", order: r.order });
      } catch (e) {
        if (!stop && ++tries < 4) return setTimeout(poll, 2500);
        if (!stop) setState({ phase: "error", message: e.message, orderId: order });
      }
    }
    poll();
    return () => { stop = true; };
  }, [params]);

  useEffect(() => {
    if ((state.phase === "paid" || state.phase === "received") && loaded && !cleared.current) {
      cleared.current = true;
      clear();
      try { sessionStorage.removeItem("rtlh_pending"); sessionStorage.removeItem("rtlh_checkout_draft"); } catch { /* ignore */ }
    }
  }, [state.phase, loaded, clear]);

  const id = state.order?.id || state.orderId || params.get("order") || "";
  const help = waLink(`Hello RTLH, about my order ${id}:`);

  return (
    <section className="section">
      <div className="wrap center" style={{ maxWidth: 600 }}>
        {state.phase === "checking" && (
          <>
            <span className="spin dark" style={{ display: "inline-block", marginBottom: 16 }} />
            <h1 style={{ fontSize: 38 }}>Confirming your payment…</h1>
            <p className="muted">This takes a few seconds. Please don't close this page.</p>
          </>
        )}
        {state.phase === "paid" && (
          <div className="fade-in">
            <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: "var(--ok)", margin: "0 auto 14px" }} />
            <span className="eyebrow">Order {state.order.id}</span>
            <h1 style={{ fontSize: 44, marginBottom: 12 }}>Thank you{state.order.firstName ? `, ${state.order.firstName}` : ""}.</h1>
            <p className="lead" style={{ margin: "0 auto 20px" }}>
              Your payment of <b>{aed(state.order.total)}</b> went through and your order is with our engravers.
              We'll message you on WhatsApp when it's ready{state.order.email ? " — and a receipt is on its way to your email" : ""}.
            </p>
            {state.order.items?.length > 0 && (
              <div className="co-block" style={{ textAlign: "left", margin: "0 auto 22px" }}>
                {state.order.items.map((t, i) => <div key={i} style={{ padding: "6px 0", fontSize: 14.5 }}>{t}</div>)}
              </div>
            )}
            <Link to="/shop" className="btn">Continue shopping</Link>
          </div>
        )}
        {state.phase === "received" && (
          <div className="fade-in">
            <CheckCircle2 size={48} strokeWidth={1.5} style={{ color: "var(--ok)", margin: "0 auto 14px" }} />
            <span className="eyebrow">Order {state.order.id}</span>
            <h1 style={{ fontSize: 44, marginBottom: 12 }}>Order received{state.order.firstName ? `, ${state.order.firstName}` : ""}.</h1>
            <p className="lead" style={{ margin: "0 auto 20px" }}>
              Thank you! Your order total is <b>{aed(state.order.total)}</b>. We'll message you on WhatsApp shortly to confirm the details and arrange payment.
            </p>
            {state.order.items?.length > 0 && (
              <div className="co-block" style={{ textAlign: "left", margin: "0 auto 22px" }}>
                {state.order.items.map((t, i) => <div key={i} style={{ padding: "6px 0", fontSize: 14.5 }}>{t}</div>)}
              </div>
            )}
            <Link to="/shop" className="btn">Continue shopping</Link>
          </div>
        )}
        {state.phase === "failed" && (
          <div className="fade-in">
            <XCircle size={48} strokeWidth={1.5} style={{ color: "var(--bad)", margin: "0 auto 14px" }} />
            <h1 style={{ fontSize: 40, marginBottom: 12 }}>Payment {state.reason === "cancelled" ? "cancelled" : "didn't go through"}</h1>
            <p className="lead muted" style={{ margin: "0 auto 22px" }}>No money was taken. Your bag is saved — you can try again, or order with us on WhatsApp.</p>
            <div style={{ display: "grid", gap: 10, maxWidth: 360, margin: "0 auto" }}>
              <Link to="/checkout" className="btn">Try again</Link>
              <a className="btn ghost" href={help} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp us</a>
            </div>
          </div>
        )}
        {(state.phase === "pending" || state.phase === "error") && (
          <div className="fade-in">
            <Clock size={46} strokeWidth={1.5} style={{ color: "var(--clay)", margin: "0 auto 14px" }} />
            <h1 style={{ fontSize: 38, marginBottom: 12 }}>We're still confirming your payment</h1>
            <p className="lead muted" style={{ margin: "0 auto 22px" }}>
              This can take a minute. If you were charged, your order is safe — we'll confirm it on WhatsApp. Order reference: <b>{id || "—"}</b>
            </p>
            <div style={{ display: "grid", gap: 10, maxWidth: 360, margin: "0 auto" }}>
              <button className="btn" onClick={() => window.location.reload()}>Check again</button>
              <a className="btn ghost" href={help} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp us</a>
            </div>
          </div>
        )}
        {state.phase === "missing" && (
          <>
            <h1 style={{ fontSize: 38, marginBottom: 12 }}>No order to show</h1>
            <Link to="/shop" className="btn">Shop the collection</Link>
          </>
        )}
      </div>
    </section>
  );
}
