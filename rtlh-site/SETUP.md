# RTLH website — setup guide

Everything here is **free**. GitHub hosts the site, Google Sheets is the database, Google Apps Script
is the payment server, and Gmail / Telegram send the alerts. The only cost is Ziina's fee on each card payment.

```
Customer on rtlh.art ──► Google Apps Script (free) ──► Ziina payment page
                              │                              │
                              ├─ Google Sheet "Orders"  ◄────┘ checks the payment is real
                              ├─ Google Drive (photos)
                              ├─ Email + Telegram alert to you
                              ├─ Email receipt to customer
                              └─ RTLH Admin app ("To do" + new "Web" tab)
```

The site works in two modes, so you can launch before Ziina is ready:

| Mode | When | What happens at checkout |
|---|---|---|
| **WhatsApp** | `ORDER_API` in `src/config.js` is empty | Order is sent to your WhatsApp as a ready-written message |
| **Online** | `ORDER_API` is filled in | Order saved to your Sheet, you get alerts. Without a Ziina key → "we'll WhatsApp you for payment". With a Ziina key → customer pays by card / Apple Pay |

---

## Step 1 — The website (already live)

The site lives in the `rtlh-site/` folder of the **rtlhuae/site** repo. Every commit to `main` rebuilds it
and publishes it to rtlh.art in about 2 minutes (Actions tab shows progress).

Every page now has a real address: `rtlh.art/shop`, `rtlh.art/product/the-porte`, `rtlh.art/events`,
`rtlh.art/gallery`, `rtlh.art/faq`… Each one opens directly, can be shared, and Google can find it.

## Step 2 — Order database + alerts (10 min)

Do this logged in to the Google account that should own the orders (e.g. rtlhuae@gmail.com).

1. Go to **sheets.new** — a blank Google Sheet opens.
2. **Extensions → Apps Script.** Delete the sample code, paste all of [`rtlh-site/backend/Code.gs`](backend/Code.gs), press **Save** (💾).
3. In the function dropdown at the top pick **`setup`** → **Run**. Google asks for permission:
   *Review permissions → your account → Advanced → Go to project (unsafe) → Allow.*
   (It says "unsafe" only because you wrote the script yourself and Google hasn't reviewed it.)
   This creates the **Orders** and **Items** tabs, a Drive folder **RTLH Order Photos**, and a 10-minute payment checker.
4. **Deploy → New deployment →** ⚙ **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** → copy the **Web app URL** (ends in `/exec`).
5. On GitHub open `rtlh-site/src/config.js` → ✏️ edit → paste the URL between the quotes:
   `const ORDER_API = "https://script.google.com/macros/s/…/exec";` → **Commit**.
6. After the site rebuilds (~2 min), place a test order on rtlh.art. You should get an email and see a row in the Sheet.

> **Changed `Code.gs` later?** Deploy → **Manage deployments** → ✏️ → Version: **New version** → Deploy.
> The URL stays the same. (Just saving is not enough.)

## Step 3 — Instant phone alerts with Telegram (optional, 5 min)

Email alerts already work (turn on Gmail notifications on your phone). For a louder, instant ping:

1. In Telegram, message **@BotFather** → `/newbot` → pick a name → copy the **token**.
2. Apps Script → ⚙ **Project Settings → Script Properties → Add**: `TELEGRAM_BOT_TOKEN` = the token.
3. Open your new bot in Telegram and send it "hi".
4. Back in Apps Script run **`telegramChatId`** → the log shows `Chat ID: 123456789`.
5. Add Script Property `TELEGRAM_CHAT_ID` = that number.
6. Run **`testAlerts`** — you get a test email and Telegram message.

(Both partners can get alerts: add the bot to a Telegram group and use the group's chat ID.)

## Step 4 — Connect your RTLH Admin app (3 min)

**a) Paid website orders go into your "To do" list automatically.**
Script Properties → add `ADMIN_SHEET_URL` = the same Sales sheet URL your admin app uses
(Admin app → Settings → "Sales sheet URL"). Each piece becomes one "To do" row with the engraving text,
colour, phone, address and photo link in the notes, and it counts in your revenue stats.

**b) See full website orders in the Admin app.**
1. Update the admin repo (merge the `website-orders` branch).
2. Script Properties → copy the value of `ADMIN_KEY` (created by `setup`).
3. Admin app → **Settings** → *Website orders URL* = your shop `/exec` URL, *Website admin key* = that key → **Save & connect**.
4. Orders → **Web** tab: customer, phone (tap → WhatsApp), address, gift note, photos, and a **Fulfilled ✓** button.
   The Overview shows "🌐 N website orders to send" when something new comes in.

## Step 5 — Ziina card payments

1. **Ziina Business account.** In the Ziina app, complete business onboarding (Emirates ID, trade licence) and wait for verification.
2. **API key.** Go to **ziina.com/business/connect** → *Other builder or custom* → enter phone, OTP and email.
   The key appears **once** — copy it somewhere safe.
3. Apps Script → Script Properties → add `ZIINA_API_KEY` = the key.
   `ZIINA_TEST` is already `true`, so payments are **test payments — no real money moves.**
4. **Test it:** add something to the bag on rtlh.art → Pay → finish on the Ziina test page → you land on
   "Thank you", the Sheet row says **paid**, and the email subject starts with **[TEST]**.
   Try **Cancel** too — you should come back to checkout with your bag still there.
5. **Go live:** change `ZIINA_TEST` to `false`. Make one real small purchase yourself, then refund it in the Ziina app.

How payment checking works (nothing to set up): when the customer returns from Ziina, the script asks
Ziina directly whether the payment completed — it never trusts the browser. If the customer closes the
page early, the 10-minute checker catches the payment anyway. Prices are always recalculated on the
server from `rtlh.art/catalog.json`, so nobody can change a price in their browser.

---

## Day-to-day editing

All paths are inside `rtlh-site/`.

| I want to… | Do this |
|---|---|
| Change a price / name / description | `src/data/products.js` on GitHub → ✏️ → commit |
| Hide a product or colour | `hidden: true` in `src/data/products.js` |
| Add a colour or product photo | Upload the PNG/JPG into `assets-src/products/` on GitHub, then add `{ id: "black", image: "FileNameWithoutExtension" }` in products.js. The build optimises it automatically. |
| Add gallery pictures | Upload `101.jpg`, `102.jpg`… into `assets-src/gallery/`. They appear in the picture chooser automatically — nothing else to change. |
| Turn off "Upload your own" photos | `ALLOW_PHOTO_UPLOAD = false` in `src/config.js` (customers then only pick from the gallery) |
| Charge for engraving | `textPrice: 10` / `picturePrice: 20` in that product's `personalise` |
| Set a delivery fee | `DELIVERY_FEE` / `FREE_DELIVERY_OVER` in `src/config.js` |
| Change WhatsApp number | `src/config.js` |
| Edit policies / FAQ text | `src/pages/Info.jsx` |

Every commit to `main` rebuilds the site in about 2 minutes.

## Local preview (optional, needs Node.js)

```bash
cd rtlh-site
npm install
npm run dev
```

## Free-tier limits (plenty for a small shop)

- Google Apps Script: 100 emails/day on a normal Gmail account (2 per order → ~50 orders/day), 20,000 web calls/day.
- GitHub Pages: 100 GB bandwidth/month.
- Telegram bots: free, no limit you'll hit.
