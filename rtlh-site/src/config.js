/* =======================================================================
   RTLH SITE SETTINGS
   ======================================================================= */

export const SITE_URL = "https://rtlh.art";
export const BRAND = "RTLH";
export const SLOGAN = "Made yours.";

export const WHATSAPP_NUMBER = "971588822520";       // no + or spaces
export const WHATSAPP_DISPLAY = "+971 58 882 2520";
export const INSTAGRAM = "rtlh.ae";
export const TIKTOK = "rtlh.ae";
export const CITY = "Dubai, UAE";

/* ----------------------------------------------------------------------
   ORDERS & PAYMENT
   Paste your Google Apps Script /exec URL here (see SETUP.md, step 2).
   • Empty  → checkout sends the order to you on WhatsApp (works today).
   • Filled → orders are saved to your Google Sheet, you get an alert,
              and customers pay by card / Apple Pay through Ziina.
   ---------------------------------------------------------------------- */
const ORDER_API = "";   // ← paste your Apps Script /exec URL between the quotes
export const ORDER_API_URL = ORDER_API || import.meta.env.VITE_ORDER_API_URL || "";

/* Delivery. The payment server reads these automatically from the site,
   so changing them here is enough. */
export const DELIVERY_FEE = 0;          // AED, 0 = free delivery
export const FREE_DELIVERY_OVER = 0;    // AED, 0 = no threshold
export const PICKUP_ENABLED = true;     // show "Pick up in Dubai" option (free)
export const PRODUCTION_DAYS = "2–4 working days";

export const EMIRATES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

/* Picture engraving: customers always choose from your gallery
   (assets-src/gallery). true = they can ALSO upload their own photo. */
export const ALLOW_PHOTO_UPLOAD = true;

export const PHOTO_MAX_MB = 15;
