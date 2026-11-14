import { ORDER_API_URL, SITE_URL } from "../config.js";
import { getPhoto, blobToBase64 } from "./photos.js";

export const onlineCheckout = () => Boolean(ORDER_API_URL);

// Apps Script only accepts "simple" requests from browsers, so we send JSON as text/plain.
async function call(payload) {
  const res = await fetch(ORDER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error("The order server sent an unexpected reply. Please try again or order on WhatsApp."); }
  if (!json.ok) throw new Error(json.error || "Something went wrong. Please try again.");
  return json;
}

/** Create the order, upload photos, and get the Ziina payment link. */
export async function createOrder({ customer, delivery, giftNote, items }) {
  const payloadItems = [];
  for (const i of items) {
    let photo = null;
    if (i.mode === "photo" && i.photoId) {
      const blob = await getPhoto(i.photoId);
      if (blob) photo = { mime: blob.type || "image/jpeg", data: await blobToBase64(blob) };
    }
    payloadItems.push({
      slug: i.slug, color: i.color, qty: i.qty, mode: i.mode,
      text: i.mode === "text" ? i.text : "", font: i.mode === "text" ? i.font : "",
      designNo: i.designNo || "", photo,
    });
  }
  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;
  return call({ action: "create", customer, delivery, giftNote, items: payloadItems, origin });
}

/** Ask the server (which asks Ziina) whether an order is paid. */
export function orderStatus(order, token) {
  return call({ action: "status", order, token });
}
