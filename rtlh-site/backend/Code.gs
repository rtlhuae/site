/**
 * RTLH SHOP SERVER — Google Apps Script (free)
 * ============================================================================
 * What it does
 *   • Saves every website order to this Google Sheet (tabs "Orders" + "Items").
 *   • Saves customers' engraving photos to Google Drive ("RTLH Order Photos").
 *   • Creates the Ziina payment and checks with Ziina that it was really paid.
 *   • When an order is paid: emails you, (optionally) pings your phone on
 *     Telegram, emails the customer a receipt, and adds it to your RTLH Admin
 *     app's "To do" list.
 *
 * Setup: see SETUP.md in the website repo. In short:
 *   1. Paste this file into Extensions → Apps Script of a NEW Google Sheet.
 *   2. Run  setup  once (Run ▸ setup) and allow the permissions.
 *   3. Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Who has access: Anyone.
 *   4. Put the /exec URL into src/config.js → ORDER_API_URL.
 *   5. Project Settings ▸ Script Properties: add ZIINA_API_KEY when you have it.
 *
 * Script Properties (Project Settings ▸ Script properties):
 *   ZIINA_API_KEY      Ziina API token. Empty = orders are saved as "received"
 *                      and you collect payment yourself on WhatsApp.
 *   ZIINA_TEST         "true" = test payments (no real money). Set "false" to go live.
 *   OWNER_EMAIL        Where new-order emails go (default: this Google account).
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   Optional instant phone alerts.
 *   ADMIN_SHEET_URL    Your RTLH Admin app's sheet /exec URL (paid orders are
 *                      copied there so they show in "To do" and your stats).
 *   ADMIN_KEY          A password the Admin app uses to read website orders.
 *   SITE_URL           https://rtlh.art
 *   ALLOWED_ORIGINS    Comma list of sites allowed to create orders.
 * ============================================================================
 */

const ORDER_HEADERS = ['Order ID', 'Created', 'Status', 'Paid at', 'Name', 'Phone', 'Email', 'Method', 'Emirate', 'Area', 'Address', 'Notes', 'Gift note', 'Items', 'Subtotal', 'Delivery', 'Total', 'Photos', 'Ziina ID', 'Token', 'Test', 'Fulfilled'];
const ITEM_HEADERS = ['Order ID', 'Created', 'Product', 'Colour', 'Qty', 'Engraving', 'Text', 'Style', 'Photo', 'Unit price', 'Line total'];
const PHOTO_FOLDER = 'RTLH Order Photos';
const TZ = 'Asia/Dubai';
const ZIINA = 'https://api-v2.ziina.com/api';
const MAX_ITEMS = 30;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/* ----------------------------------------------------------------------------
   One-time setup — run this from the editor.
---------------------------------------------------------------------------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet_('Orders', ORDER_HEADERS);
  sheet_('Items', ITEM_HEADERS);
  const props = PropertiesService.getScriptProperties();
  const defaults = {
    ZIINA_TEST: 'true',
    OWNER_EMAIL: Session.getEffectiveUser().getEmail(),
    SITE_URL: 'https://rtlh.art',
    ALLOWED_ORIGINS: 'https://rtlh.art,https://www.rtlh.art,http://localhost:5173,http://localhost:4173',
    ADMIN_KEY: Utilities.getUuid().slice(0, 8),
  };
  Object.keys(defaults).forEach(function (k) { if (!props.getProperty(k)) props.setProperty(k, defaults[k]); });
  photoFolder_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'checkPending') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkPending').timeBased().everyMinutes(10).create();
  if (/^Untitled/i.test(ss.getName())) ss.rename('RTLH Website Orders');
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  Logger.log('Setup done. Your ADMIN_KEY is: ' + props.getProperty('ADMIN_KEY'));
}

/** Run from the editor to check alerts work (sends a fake order email/Telegram). */
function testAlerts() {
  notifyOwner_({ id: 'RTLH-TEST', total: 1, subtotal: 1, delivery: 0, name: 'Test Customer', phone: '+971500000000', email: '', method: 'pickup', emirate: '', area: '', address: '', notes: 'This is a test', gift: '', status: 'paid', test: true,
    items: [{ name: 'The Porte', colorName: 'Ocean Blue', qty: 1, mode: 'text', text: 'M.A', font: 'classic', photoUrl: '', unit: 1, line: 1 }] });
}

/** Telegram helper: after messaging your bot once, run this to see your chat ID in the log. */
function telegramChatId() {
  const tg = prop_('TELEGRAM_BOT_TOKEN');
  if (!tg) return Logger.log('Add TELEGRAM_BOT_TOKEN to Script Properties first.');
  const res = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + tg + '/getUpdates').getContentText());
  (res.result || []).forEach(function (u) { const c = (u.message || {}).chat; if (c) Logger.log('Chat ID: ' + c.id + ' (' + (c.first_name || c.title || '') + ')'); });
  if (!(res.result || []).length) Logger.log('No messages yet — send your bot any message in Telegram, then run this again.');
}

/* ----------------------------------------------------------------------------
   HTTP entry points
---------------------------------------------------------------------------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'admin_list') return json_(adminList_(p.key, p.limit));
  return json_({ ok: true, service: 'rtlh-shop', payments: Boolean(prop_('ZIINA_API_KEY')), test: isTest_() });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  try {
    // Ziina webhook: never trust its contents — re-check the payment with Ziina.
    if (body.event && body.data && body.data.id) {
      if (body.event === 'payment_intent.status.updated') syncByIntent_(String(body.data.id));
      return ContentService.createTextOutput('OK');
    }
    switch (body.action) {
      case 'create': return json_(createOrder_(body));
      case 'status': return json_(orderStatus_(body.order, body.token));
      case 'admin_list': return json_(adminList_(body.key, body.limit));
      case 'admin_fulfil': return json_(adminFulfil_(body.key, body.order, body.done));
      default: return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    console.error(err && err.stack || err);
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* ----------------------------------------------------------------------------
   Create order
---------------------------------------------------------------------------- */
function createOrder_(b) {
  const catalog = catalog_();
  const c = b.customer || {}, d = b.delivery || {};
  const name = clean_(c.name, 80), phone = clean_(c.phone, 30), email = clean_(c.email, 120);
  if (name.length < 2) throw new Error('Please enter your name.');
  if (phone.replace(/\D/g, '').length < 9) throw new Error('Please enter a valid mobile number.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please check your email address.');
  const method = d.method === 'pickup' && catalog.delivery.pickup ? 'pickup' : 'delivery';
  const emirate = method === 'delivery' ? clean_(d.emirate, 40) : '';
  if (method === 'delivery' && catalog.delivery.emirates && catalog.delivery.emirates.indexOf(emirate) < 0) throw new Error('Please choose your emirate.');
  if (method === 'delivery' && (!clean_(d.area, 80) || clean_(d.address, 200).length < 4)) throw new Error('Please enter your delivery address.');

  const raw = Array.isArray(b.items) ? b.items : [];
  if (!raw.length) throw new Error('Your bag is empty.');
  if (raw.length > MAX_ITEMS) throw new Error('Too many items — please WhatsApp us for large orders.');

  const id = newOrderId_(), token = 't' + Utilities.getUuid().replace(/-/g, '').slice(0, 19);
  const created = new Date();
  const items = raw.map(function (it, i) {
    const p = catalog.products[it.slug];
    if (!p) throw new Error('A product in your bag is no longer available. Please remove it and try again.');
    if (p.colors.indexOf(it.color) < 0) throw new Error(p.name + ': that colour is no longer available.');
    const qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1));
    let mode = it.mode === 'text' || it.mode === 'photo' ? it.mode : 'none';
    if (mode === 'text' && !p.text) mode = 'none';
    if (mode === 'photo' && !p.photo) mode = 'none';
    const text = mode === 'text' ? clean_(it.text, p.maxChars || 40) : '';
    if (mode === 'text' && !text) throw new Error(p.name + ': please add the text to engrave.');
    let photoUrl = '';
    if (mode === 'photo') {
      if (it.photo && it.photo.data) {
        if (catalog.uploads === false) throw new Error(p.name + ': please choose a picture from our gallery.');
        photoUrl = savePhoto_(id, i + 1, it.photo);
      }
      else if (!it.designNo) throw new Error(p.name + ': the photo didn\'t upload. Please add it again.');
    }
    const unit = p.price + (mode === 'text' ? p.textPrice : mode === 'photo' ? p.photoPrice : 0);
    return { slug: it.slug, name: p.name, adminName: p.adminName || p.name, color: it.color, colorName: (p.colorNames && p.colorNames[it.color]) || it.color,
      qty: qty, mode: mode, text: text, font: mode === 'text' ? clean_(it.font, 20) : '', designNo: clean_(it.designNo, 8), photoUrl: photoUrl, unit: unit, line: unit * qty };
  });

  const subtotal = items.reduce(function (a, x) { return a + x.line; }, 0);
  const fees = catalog.delivery.fees || {};
  const fee = method === 'pickup' ? 0
    : (catalog.delivery.freeOver && subtotal >= catalog.delivery.freeOver) ? 0
    : (fees.hasOwnProperty(emirate) ? fees[emirate] : (catalog.delivery.other || 0));
  const total = subtotal + fee;
  const order = { id: id, token: token, created: created, name: name, phone: phone, email: email, method: method,
    emirate: emirate, area: clean_(d.area, 80), address: clean_(d.address, 200),
    notes: clean_(d.notes, 300), gift: clean_(b.giftNote, 200), items: items, subtotal: subtotal, delivery: fee, total: total,
    test: isTest_(), status: 'awaiting_payment' };

  const key = prop_('ZIINA_API_KEY');
  const origin = allowedOrigin_(b.origin);
  const back = origin + '/order/complete?order=' + encodeURIComponent(id) + '&t=' + token;

  if (!key) {
    // Payments not switched on yet: keep the order, alert you, collect payment on WhatsApp.
    order.status = 'received';
    writeOrder_(order, '');
    notifyAll_(order);
    return { ok: true, orderId: id, token: token, payUrl: back };
  }

  writeOrder_(order, '');
  const intent = ziina_('post', '/payment_intent', {
    amount: Math.round(total * 100), currency_code: 'AED',
    message: 'RTLH order ' + id,
    success_url: back, failure_url: back + '&r=failed', cancel_url: origin + '/checkout?cancelled=1',
    test: isTest_(),
  });
  if (!intent || !intent.redirect_url) {
    setOrderFields_(id, { 'Status': 'payment_error' });
    throw new Error('We couldn\'t start the payment. Please try again, or order with us on WhatsApp.');
  }
  setOrderFields_(id, { 'Ziina ID': intent.id });
  return { ok: true, orderId: id, token: token, payUrl: intent.redirect_url };
}

/* ----------------------------------------------------------------------------
   Payment status
---------------------------------------------------------------------------- */
function orderStatus_(orderId, token) {
  const row = findOrder_(orderId);
  if (!row || row.data['Token'] !== String(token || '')) return { ok: false, error: 'Order not found.' };
  let status = row.data['Status'];
  if (status === 'awaiting_payment' && row.data['Ziina ID']) status = syncByIntent_(row.data['Ziina ID'], row) || status;
  const map = { paid: 'paid', received: 'received', failed: 'failed', cancelled: 'cancelled' };
  const fresh = findOrder_(orderId).data;
  return { ok: true, status: map[status] || 'pending', order: {
    id: fresh['Order ID'], firstName: String(fresh['Name']).split(' ')[0], total: Number(fresh['Total']),
    email: Boolean(fresh['Email']), items: String(fresh['Items']).split('\n').filter(String) } };
}

/** Ask Ziina for the real status of a payment and update the order. */
function syncByIntent_(intentId, knownRow) {
  const row = knownRow || findOrderBy_('Ziina ID', intentId);
  if (!row) return null;
  const pi = ziina_('get', '/payment_intent/' + encodeURIComponent(intentId));
  if (!pi || !pi.status) return null;
  if (pi.status === 'completed') {
    if (Math.round(Number(row.data['Total']) * 100) !== Number(pi.amount)) {
      setOrderFields_(row.data['Order ID'], { 'Status': 'amount_mismatch' });
      return 'amount_mismatch';
    }
    markPaid_(row.data['Order ID']);
    return 'paid';
  }
  if (pi.status === 'failed' || pi.status === 'canceled') {
    const s = pi.status === 'failed' ? 'failed' : 'cancelled';
    if (row.data['Status'] === 'awaiting_payment') setOrderFields_(row.data['Order ID'], { 'Status': s });
    return s;
  }
  return 'awaiting_payment';
}

function markPaid_(orderId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const row = findOrder_(orderId);
    if (!row || row.data['Status'] === 'paid') return; // already handled — never alert twice
    setOrderFields_(orderId, { 'Status': 'paid', 'Paid at': new Date() });
  } finally {
    lock.releaseLock();
  }
  notifyAll_(orderFromSheet_(orderId));
}

/** Runs every 10 minutes: catches payments where the customer closed the page early. */
function checkPending() {
  if (!prop_('ZIINA_API_KEY')) return;
  const sh = sheet_('Orders', ORDER_HEADERS), values = sh.getDataRange().getValues(), h = values[0];
  const iS = h.indexOf('Status'), iZ = h.indexOf('Ziina ID'), iC = h.indexOf('Created'), iO = h.indexOf('Order ID');
  const now = Date.now();
  for (let r = 1; r < values.length; r++) {
    if (values[r][iS] !== 'awaiting_payment' || !values[r][iZ]) continue;
    const age = now - new Date(values[r][iC]).getTime();
    if (age > 48 * 3600 * 1000) { setOrderFields_(values[r][iO], { 'Status': 'abandoned' }); continue; }
    try { syncByIntent_(values[r][iZ]); } catch (err) { console.error(err); }
  }
}

/* ----------------------------------------------------------------------------
   Notifications
---------------------------------------------------------------------------- */
function notifyAll_(o) {
  [notifyOwner_, notifyCustomer_, forwardToAdmin_].forEach(function (fn) {
    try { fn(o); } catch (err) { console.error(fn.name + ': ' + err); }
  });
}

function itemLine_(x) {
  const what = x.mode === 'text' ? 'Engrave "' + x.text + '" (' + (x.font || 'classic') + ')'
    : x.mode === 'photo' ? (x.designNo ? 'Picture No. ' + x.designNo : 'Picture: customer\'s own photo') : 'No engraving';
  return x.qty + ' × ' + x.name + ' — ' + x.colorName + ' — ' + what;
}

function notifyOwner_(o) {
  const paidLabel = o.status === 'paid' ? (o.test ? 'PAID (TEST — no real money)' : 'PAID via Ziina') : 'NOT PAID YET — collect payment on WhatsApp';
  const addr = o.method === 'pickup' ? 'Pick up' : [o.address, o.area, o.emirate].filter(String).join(', ');
  const wa = 'https://wa.me/' + String(o.phone).replace(/\D/g, '').replace(/^0/, '971');
  const lines = o.items.map(function (x) {
    return '<li>' + esc_(itemLine_(x)) + ' — <b>AED ' + x.line + '</b>' + (x.photoUrl ? ' — <a href="' + x.photoUrl + '">open photo</a>' : '') + '</li>';
  }).join('');
  const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">' +
    '<h2 style="margin:0 0 6px">New order ' + esc_(o.id) + ' — AED ' + o.total + '</h2>' +
    '<p style="margin:0 0 14px;color:' + (o.status === 'paid' ? '#2e7d4f' : '#a3423a') + '"><b>' + paidLabel + '</b></p>' +
    '<ul>' + lines + '</ul>' +
    '<p>Subtotal AED ' + o.subtotal + ' · Delivery AED ' + o.delivery + ' · <b>Total AED ' + o.total + '</b></p>' +
    '<p><b>' + esc_(o.name) + '</b><br>' + esc_(o.phone) + ' — <a href="' + wa + '">WhatsApp them</a><br>' + esc_(o.email || '') + '</p>' +
    '<p><b>' + (o.method === 'pickup' ? 'Pick up' : 'Deliver to') + ':</b> ' + esc_(addr) + '</p>' +
    (o.notes ? '<p><b>Notes:</b> ' + esc_(o.notes) + '</p>' : '') +
    (o.gift ? '<p><b>Gift note:</b> ' + esc_(o.gift) + '</p>' : '') +
    '<p><a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">Open the orders sheet</a></p></div>';
  MailApp.sendEmail({ to: prop_('OWNER_EMAIL') || Session.getEffectiveUser().getEmail(),
    subject: (o.test ? '[TEST] ' : '') + '🛍️ New RTLH order ' + o.id + ' — AED ' + o.total + (o.status === 'paid' ? ' (paid)' : ' (unpaid)'),
    htmlBody: html, name: 'RTLH Website' });

  const tg = prop_('TELEGRAM_BOT_TOKEN'), chat = prop_('TELEGRAM_CHAT_ID');
  if (tg && chat) {
    const text = (o.test ? '[TEST] ' : '') + '🛍️ New order ' + o.id + ' — AED ' + o.total + '\n' + paidLabel + '\n\n' +
      o.items.map(itemLine_).join('\n') + '\n\n' + o.name + ' · ' + o.phone + '\n' + (o.method === 'pickup' ? 'Pick up' : addr) +
      (o.gift ? '\nGift note: ' + o.gift : '') + (o.notes ? '\nNotes: ' + o.notes : '') + '\n\nWhatsApp: ' + wa;
    UrlFetchApp.fetch('https://api.telegram.org/bot' + tg + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ chat_id: chat, text: text, disable_web_page_preview: true }) });
  }
}

function notifyCustomer_(o) {
  if (!o.email) return;
  const first = String(o.name).split(' ')[0];
  const intro = o.status === 'paid'
    ? 'Thank you for your order — your payment of AED ' + o.total + ' went through and your piece is now with our engravers.'
    : 'Thank you for your order. We\'ll message you on WhatsApp shortly to confirm the details and payment.';
  const html = '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1e1916;max-width:520px">' +
    '<p style="font-size:26px;letter-spacing:.2em;margin:0 0 18px">RTLH</p>' +
    '<p>Hi ' + esc_(first) + ',</p><p>' + intro + '</p>' +
    '<p style="font-family:Arial,sans-serif;font-size:14px"><b>Order ' + esc_(o.id) + '</b><br>' +
    o.items.map(function (x) { return esc_(itemLine_(x)) + ' — AED ' + x.line; }).join('<br>') +
    '<br>Delivery: AED ' + o.delivery + '<br><b>Total: AED ' + o.total + '</b></p>' +
    '<p>We\'ll WhatsApp you on ' + esc_(o.phone) + ' when it\'s ready. Questions? Just reply to this email.</p>' +
    '<p style="font-style:italic;color:#8f6155">Made yours.</p></div>';
  MailApp.sendEmail({ to: o.email, subject: 'Your RTLH order ' + o.id, htmlBody: html, name: 'RTLH',
    replyTo: prop_('OWNER_EMAIL') || Session.getEffectiveUser().getEmail() });
}

/** Copies the order into the RTLH Admin app's sheet (one row per piece). */
function forwardToAdmin_(o) {
  const url = prop_('ADMIN_SHEET_URL');
  if (!url) return;
  const date = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const addr = o.method === 'pickup' ? 'Pick up' : [o.address, o.area, o.emirate].filter(String).join(', ');
  const base = Date.now();
  let n = 0;
  o.items.forEach(function (x) {
    for (let q = 0; q < x.qty; q++) {
      const notes = ['🌐 Web ' + o.id, o.status === 'paid' ? (o.test ? 'TEST payment' : 'Paid · Ziina') : 'UNPAID', o.phone, addr,
        x.font ? 'Style: ' + x.font : '', x.designNo ? 'Picture No. ' + x.designNo : '', x.photoUrl ? 'Photo: ' + x.photoUrl : '',
        o.gift ? 'Gift note: ' + o.gift : '', o.notes].filter(String).join(' · ');
      UrlFetchApp.fetch(url, { method: 'post', contentType: 'text/plain;charset=utf-8', muteHttpExceptions: true, followRedirects: true,
        payload: JSON.stringify({ action: 'order', id: base + (n++), date: date, customer: o.name, product: x.adminName || x.name,
          color: x.colorName, type: x.mode === 'text' ? 'Engraving' : x.mode === 'photo' ? 'Picture engraving' : 'No personalisation',
          text: x.text || '', price: x.unit, notes: notes }) });
    }
  });
}

/* ----------------------------------------------------------------------------
   Admin app API (needs ADMIN_KEY)
---------------------------------------------------------------------------- */
function adminList_(key, limit) {
  if (!key || key !== prop_('ADMIN_KEY')) return { ok: false, error: 'Wrong admin key' };
  const sh = sheet_('Orders', ORDER_HEADERS), values = sh.getDataRange().getValues(), h = values[0];
  const rows = values.slice(1).map(function (r) {
    const o = {}; h.forEach(function (k, i) { o[k] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); delete o['Token']; return o;
  }).reverse().slice(0, Math.min(500, parseInt(limit, 10) || 200));
  return { ok: true, orders: rows, test: isTest_(), payments: Boolean(prop_('ZIINA_API_KEY')) };
}

function adminFulfil_(key, orderId, done) {
  if (!key || key !== prop_('ADMIN_KEY')) return { ok: false, error: 'Wrong admin key' };
  if (!findOrder_(orderId)) return { ok: false, error: 'Order not found' };
  setOrderFields_(orderId, { 'Fulfilled': done ? new Date() : '' });
  return { ok: true };
}

/* ----------------------------------------------------------------------------
   Helpers
---------------------------------------------------------------------------- */
function writeOrder_(o, intentId) {
  const photos = o.items.map(function (x) { return x.photoUrl; }).filter(String).join('\n');
  const itemsText = o.items.map(function (x) { return itemLine_(x) + ' — AED ' + x.line; }).join('\n');
  const rowObj = { 'Order ID': o.id, 'Created': o.created, 'Status': o.status, 'Paid at': '', 'Name': o.name, 'Phone': "'" + o.phone, 'Email': o.email,
    'Method': o.method, 'Emirate': o.emirate, 'Area': o.area, 'Address': o.address, 'Notes': o.notes, 'Gift note': o.gift, 'Items': itemsText,
    'Subtotal': o.subtotal, 'Delivery': o.delivery, 'Total': o.total, 'Photos': photos, 'Ziina ID': intentId || '', 'Token': o.token,
    'Test': o.test ? 'TEST' : '', 'Fulfilled': '' };
  sheet_('Orders', ORDER_HEADERS).appendRow(ORDER_HEADERS.map(function (k) { return rowObj[k]; }));
  const items = sheet_('Items', ITEM_HEADERS);
  o.items.forEach(function (x) {
    items.appendRow([o.id, o.created, x.name, x.colorName, x.qty, x.mode, x.text, x.font, x.photoUrl || (x.designNo ? 'Picture No. ' + x.designNo : ''), x.unit, x.line]);
  });
}

function orderFromSheet_(orderId) {
  const d = findOrder_(orderId).data;
  const items = sheet_('Items', ITEM_HEADERS).getDataRange().getValues().slice(1).filter(function (r) { return r[0] === orderId; }).map(function (r) {
    const photo = String(r[8] || '');
    return { name: r[2], adminName: adminNameFor_(r[2]), colorName: r[3], qty: Number(r[4]), mode: r[5], text: r[6], font: r[7],
      photoUrl: /^https?:/.test(photo) ? photo : '', designNo: photo.indexOf('Picture No. ') === 0 ? photo.slice(12) : '', unit: Number(r[9]), line: Number(r[10]) };
  });
  return { id: d['Order ID'], status: d['Status'], test: d['Test'] === 'TEST', name: d['Name'], phone: String(d['Phone']), email: d['Email'],
    method: d['Method'], emirate: d['Emirate'], area: d['Area'], address: d['Address'], notes: d['Notes'], gift: d['Gift note'],
    items: items, subtotal: Number(d['Subtotal']), delivery: Number(d['Delivery']), total: Number(d['Total']) };
}

function adminNameFor_(name) {
  try {
    const products = catalog_().products;
    for (const k in products) if (products[k].name === name) return products[k].adminName || name;
  } catch (err) { /* ignore */ }
  return name;
}

function findOrder_(orderId) { return findOrderBy_('Order ID', orderId); }

function findOrderBy_(column, value) {
  if (!value) return null;
  const sh = sheet_('Orders', ORDER_HEADERS);
  const col = ORDER_HEADERS.indexOf(column) + 1;
  const last = sh.getLastRow();
  if (last < 2) return null;
  const hit = sh.getRange(2, col, last - 1, 1).createTextFinder(String(value)).matchEntireCell(true).findNext();
  if (!hit) return null;
  const r = hit.getRow();
  const vals = sh.getRange(r, 1, 1, ORDER_HEADERS.length).getValues()[0];
  const data = {}; ORDER_HEADERS.forEach(function (k, i) { data[k] = vals[i]; });
  data['Token'] = String(data['Token']);
  return { row: r, data: data };
}

function setOrderFields_(orderId, fields) {
  const found = findOrder_(orderId);
  if (!found) return;
  const sh = sheet_('Orders', ORDER_HEADERS);
  Object.keys(fields).forEach(function (k) { sh.getRange(found.row, ORDER_HEADERS.indexOf(k) + 1).setValue(fields[k]); });
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3ece2');
  }
  return sh;
}

function photoFolder_() {
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
}

function savePhoto_(orderId, n, photo) {
  const bytes = Utilities.base64Decode(String(photo.data));
  if (bytes.length > MAX_PHOTO_BYTES) throw new Error('A photo is too large. Please use a smaller one.');
  const mime = /^image\/(jpeg|png|webp)$/.test(photo.mime) ? photo.mime : 'image/jpeg';
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const file = photoFolder_().createFile(Utilities.newBlob(bytes, mime, orderId + '-' + n + '.' + ext));
  return file.getUrl();
}

function catalog_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('catalog');
  if (hit) return JSON.parse(hit);
  const site = prop_('SITE_URL') || 'https://rtlh.art';
  const res = UrlFetchApp.fetch(site + '/catalog.json?ts=' + Date.now(), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    const saved = PropertiesService.getScriptProperties().getProperty('CATALOG_BACKUP');
    if (saved) return JSON.parse(saved);
    throw new Error('Shop is updating — please try again in a minute.');
  }
  const text = res.getContentText();
  cache.put('catalog', text, 300);
  try { PropertiesService.getScriptProperties().setProperty('CATALOG_BACKUP', text); } catch (err) { /* too big, fine */ }
  return JSON.parse(text);
}

function ziina_(method, path, body) {
  const res = UrlFetchApp.fetch(ZIINA + path, {
    method: method, contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + prop_('ZIINA_API_KEY') },
    payload: body ? JSON.stringify(body) : undefined,
  });
  const code = res.getResponseCode();
  if (code >= 300) { console.error('Ziina ' + code + ': ' + res.getContentText()); return null; }
  return JSON.parse(res.getContentText());
}

function newOrderId_() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'RTLH-' + Utilities.formatDate(new Date(), TZ, 'yyMMdd') + '-' + s;
}

function allowedOrigin_(origin) {
  const list = String(prop_('ALLOWED_ORIGINS') || '').split(',').map(function (s) { return s.trim(); }).filter(String);
  return list.indexOf(origin) >= 0 ? origin : (prop_('SITE_URL') || 'https://rtlh.art');
}

function isTest_() { return String(prop_('ZIINA_TEST') || 'true').toLowerCase() !== 'false'; }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max || 200); }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
