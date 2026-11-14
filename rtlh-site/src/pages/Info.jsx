import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Instagram, MapPin, ArrowRight, Music2 } from "lucide-react";
import { waLink } from "../lib/format.js";
import { INSTAGRAM, TIKTOK, WHATSAPP_DISPLAY, CITY, PRODUCTION_DAYS, PICKUP_ENABLED, DELIVERY_FEES, DELIVERY_FEE_OTHER, FREE_DELIVERY_OVER, ALLOW_PHOTO_UPLOAD } from "../config.js";
import { onlineCheckout } from "../lib/api.js";

const ig = (k) => `/img/ig/${k}.webp`;
const bookLink = (t) => waLink(`Hello RTLH, I'd like to book a live engraving experience${t ? ` for ${t}` : ""}. Date: , guests: `);

export function Events() {
  const occasions = [
    ["Weddings & Engagements", "Favors, place settings, and keepsakes engraved live as your guests arrive."],
    ["Corporate Activations", "A branded, tactile moment for launches, conferences, and client gifting."],
    ["Luxury & Private Gatherings", "An intimate personalization experience for gatherings that ask for more than catering."],
  ];
  const steps = [
    ["Inquiry", "Tell us about your event on WhatsApp — date, guest count, and the pieces you have in mind."],
    ["Curation", "We recommend pieces, colors, and customization options suited to your occasion and guests."],
    ["Setup", "Our engraving station arrives, styled to sit naturally within your event design."],
    ["Live Engraving", "Guests watch each piece personalized in real time — a moment, not just a favor."],
  ];
  return (
    <>
      <section className="page-hero">
        <div className="wrap split">
          <div>
            <span className="eyebrow">Live engraving · Events</span>
            <h1 style={{ marginBottom: 16 }}>A live engraving experience, staged for your occasion.</h1>
            <p className="lead">RTLH brings a working atelier into the room — a place where guests can watch a name become permanent, in the minutes before it's placed in their hands.</p>
            <a className="btn wa" href={bookLink()} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Book on WhatsApp</a>
          </div>
          <div className="split-media"><img src={ig("popup-counter-1200")} alt="The RTLH engraving counter at a pop-up" /></div>
        </div>
      </section>
      <section className="section bg-sand">
        <div className="wrap">
          <span className="eyebrow">Occasions</span>
          <div className="steps" style={{ marginTop: 10 }}>
            {occasions.map(([t, d], i) => (
              <a key={t} className="step" href={bookLink(t.toLowerCase())} target="_blank" rel="noopener noreferrer">
                <span className="n">{i + 1}</span><h3>{t}</h3><p>{d}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap split rev">
          <div className="split-media"><img src={ig("booth-night-1200")} alt="The RTLH booth set up outdoors at night" loading="lazy" /></div>
          <div>
            <span className="eyebrow">How it works</span>
            <h2 style={{ marginBottom: 20 }}>From first message to the last guest.</h2>
            {steps.map(([t, d], i) => (
              <div key={t} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
                <span style={{ font: "500 28px/1 var(--serif)", color: "var(--clay)", minWidth: 34 }}>0{i + 1}</span>
                <div><b>{t}</b><p className="muted small" style={{ margin: "4px 0 0" }}>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap"><div className="band bg-ink">
          <h2 style={{ color: "#fff" }}>Tell us about your event.</h2>
          <p style={{ color: "#d9cec3", maxWidth: 480, margin: "0 auto 22px" }}>Share your date, guest count, and vision, and we'll curate a live engraving experience for your occasion.</p>
          <a className="btn wa" href={bookLink()} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Book a live experience</a>
        </div></div>
      </section>
    </>
  );
}

export function About() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap split">
          <div>
            <span className="eyebrow">Our story · رتله</span>
            <h1 style={{ marginBottom: 16 }}>Made by hand, for the moment it's given.</h1>
            <p className="lead">RTLH — pronounced Retlah — began with a simple belief: that a gift means more when someone can watch it become theirs. Not a name printed at a factory, but a name engraved by hand.</p>
            <p className="lead">We work across the UAE with couples, brands, and hosts who want their gifting to feel considered — and now with anyone who wants to order a personalised piece online, engraved by the same hands.</p>
            <Link to="/shop" className="btn">Shop the collection <ArrowRight size={16} /></Link>
          </div>
          <div className="mosaic">
            <div><img src={ig("gift-glove-800")} alt="A white-gloved hand holding an ivory RTLH gift bag" /></div>
            <div><img src={ig("cardholders-studio-800")} alt="Monogrammed RTLH cardholders" loading="lazy" /></div>
            <div><img src={ig("charms-900")} alt="RTLH leather Voyage tags in five colours" loading="lazy" /></div>
          </div>
        </div>
      </section>
      <section className="section bg-sand">
        <div className="wrap steps">
          {[["Materials", "Leathers and metals chosen for how they wear, weather, and hold a mark over years, not seasons."],
            ["Precision", "Every mark is set against the true contour of the piece — no templates, no shortcuts."],
            ["Ceremony", "Personalization is a small, deliberate moment — whether it happens in front of you at an event or in our atelier for your order."]].map(([t, d], i) => (
            <div className="step" key={t}><span className="n">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}

export function Contact() {
  return (
    <section className="page-hero section">
      <div className="wrap split">
        <div>
          <span className="eyebrow">Contact</span>
          <h1 style={{ marginBottom: 16 }}>Let's talk about your piece, or your event.</h1>
          <p className="lead">For questions about an order, a custom piece, or a live engraving booking, WhatsApp is the fastest way to reach us.</p>
          <div style={{ display: "grid", gap: 10, maxWidth: 380 }}>
            <a className="btn wa" href={waLink("Hello RTLH,")} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp {WHATSAPP_DISPLAY}</a>
            <a className="btn ghost" href={`https://ig.me/m/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Message @{INSTAGRAM}</a>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 26, color: "var(--ink-2)" }}>
            <span style={{ display: "flex", gap: 10, alignItems: "center" }}><MapPin size={17} /> {CITY} · delivering across the UAE</span>
            <a href={`https://www.tiktok.com/@${TIKTOK}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 10, alignItems: "center" }}><Music2 size={17} /> TikTok @{TIKTOK}</a>
          </div>
        </div>
        <div className="split-media"><img src={ig("burgundy-hand-800")} alt="A burgundy RTLH wallet" /></div>
      </div>
    </section>
  );
}

const delivery = () => {
  const named = Object.entries(DELIVERY_FEES).map(([em, fee]) => `${fee} dirhams in ${em}`);
  const other = `${DELIVERY_FEE_OTHER} dirhams to ${named.length ? "the other emirates" : "anywhere in the UAE"}`;
  return `Delivery costs ${[...named, other].join(" and ")}${FREE_DELIVERY_OVER ? `, and it's free on orders over ${FREE_DELIVERY_OVER} dirhams` : ""}.`;
};

export function Faq() {
  const qa = [
    ["How long does my order take?", `Personalised pieces are usually ready in ${PRODUCTION_DAYS}, then delivered across the UAE. Need it by a date? Add it in the order notes or WhatsApp us.`],
    ["How much is delivery?", `${delivery()}${PICKUP_ENABLED ? ` You can also pick up in ${CITY} for free.` : ""}`],
    ["Can I engrave Arabic?", "Yes — type Arabic in the text box and the Arabic style is selected for you."],
    ["How does picture engraving work?", "On any product, choose Picture and tap a design from our gallery." + (ALLOW_PHOTO_UPLOAD ? " You can also upload your own picture: logos and simple line drawings engrave best." : "") + " We confirm the final artwork with you on WhatsApp before engraving."],
    ["How do I pay?", onlineCheckout() ? "At checkout you pay securely through Ziina by card, Apple Pay or Google Pay." : "Send your order from the checkout page on WhatsApp, and we'll confirm payment with you there."],
    ["Can I return a personalised item?", "Because each piece is made for you, personalised items can't be returned or exchanged unless they arrive damaged or with a mistake on our side. See Delivery & returns for details."],
    ["Do you do events and bulk orders?", "Yes — we bring a live engraving station to weddings, activations and private events, and handle bulk corporate gifting. See Live events or WhatsApp us."],
  ];
  return (
    <section className="page-hero section">
      <div className="wrap faq">
        <span className="eyebrow">Help</span>
        <h1 style={{ marginBottom: 20 }}>Questions, answered.</h1>
        <div className="acc">
          {qa.map(([q, a]) => <details key={q}><summary>{q}</summary><div>{a}</div></details>)}
        </div>
        <p style={{ marginTop: 26 }}>Something else? <a className="link" href={waLink("Hello RTLH, I have a question:")} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a></p>
      </div>
    </section>
  );
}

/* NOTE FOR RTLH: these policies are a starting draft. Read them and change
   anything that doesn't match how you actually work. Payment providers
   (including Ziina) expect refund, delivery, terms and privacy pages. */
export function Policy({ which }) {
  const P = {
    "delivery-returns": ["Delivery & returns", [
      ["Production", `Every piece is personalised to order. Most orders are engraved and ready in ${PRODUCTION_DAYS}. Busy periods (Eid, National Day, Valentine's) may take longer — we'll tell you on WhatsApp if so.`],
      ["Delivery", `We deliver to all seven emirates. ${delivery()} Once your order is ready, we'll message you to arrange delivery.${PICKUP_ENABLED ? ` You can also choose free pick-up in ${CITY} at checkout.` : ""}`],
      ["Personalised items", "Because each piece is engraved with your text or photo, it can't be resold. Personalised items can't be returned or exchanged for change of mind, so please check your spelling and photo carefully before paying."],
      ["If something is wrong", "If your piece arrives damaged, or the engraving doesn't match what you ordered, message us within 3 days of delivery with a photo. We'll remake it or refund you in full."],
      ["Cancellations", "You can cancel for a full refund until we start engraving your piece. Message us on WhatsApp as soon as possible."],
      ["Refunds", "Approved refunds go back to the original payment method. Depending on your bank, they can take 5–10 working days to appear."],
    ]],
    terms: ["Terms of sale", [
      ["Who we are", `RTLH is a DED-licensed business based in ${CITY}. These terms apply to orders placed on rtlh.art.`],
      ["Orders", "Your order is confirmed once payment is received. We may contact you on WhatsApp to confirm your personalisation, especially for photo engraving. We may decline an order or a design (for example, trademarks you don't own, or offensive content) and refund you in full."],
      ["Prices & payment", "Prices are in UAE dirhams (AED), shown with the dirham symbol. Payments are processed securely by Ziina; RTLH never sees or stores your card details."],
      ["Your content", "By uploading a photo or text, you confirm you have the right to use it. We only use it to make your order."],
      ["Product photos", "Product photos are for reference. Leather is a natural material and every engraving is set by hand, so colour, texture and placement may vary slightly."],
      ["Delivery & returns", "See our Delivery & returns policy."],
      ["Contact", `WhatsApp ${WHATSAPP_DISPLAY} or Instagram @${INSTAGRAM}.`],
    ]],
    privacy: ["Privacy policy", [
      ["What we collect", "Your name, mobile number, email (if you give it), delivery address, order details, and the text or picture you choose for engraving."],
      ["Why", "Only to make and deliver your order, contact you about it, and keep business and tax records."],
      ["Payments", "Card and Apple Pay / Google Pay payments are handled by Ziina. We don't receive or store your card details."],
      ["Where it's stored", "Order details are stored in our private Google account (Google Sheets and Google Drive). We don't sell or share your information with anyone except our delivery partner, who needs your name, phone and address."],
      ["Your photos", "Uploaded photos are used only to engrave your piece. Ask us any time and we'll delete them."],
      ["This website", "Your bag is saved in your own browser so it's still there when you come back. We don't use advertising cookies."],
      ["Contact", `To see, change or delete your information, WhatsApp ${WHATSAPP_DISPLAY}.`],
    ]],
  }[which];
  return (
    <section className="page-hero section">
      <div className="wrap prose">
        <span className="eyebrow">Policies</span>
        <h1 style={{ marginBottom: 10 }}>{P[0]}</h1>
        {P[1].map(([h, t]) => <React.Fragment key={h}><h2>{h}</h2><p>{t}</p></React.Fragment>)}
      </div>
    </section>
  );
}
