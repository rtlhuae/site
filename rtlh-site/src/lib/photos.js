// Customer photos for engraving: resized in the browser, kept in IndexedDB
// until checkout (they're too big for localStorage), then uploaded with the order.

const DB = "rtlh-photos";
const STORE = "photos";

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(out && "result" in out ? out.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const savePhoto = (id, blob) => tx("readwrite", (s) => s.put(blob, id));
export const getPhoto = (id) => tx("readonly", (s) => s.get(id));
export const deletePhoto = (id) => tx("readwrite", (s) => s.delete(id)).catch(() => {});

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This file couldn't be opened. Please choose a JPG or PNG photo.")); };
    img.src = url;
  });
}

function draw(img, max, type, quality) {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => c.toBlob(resolve, type, quality)).then((blob) => ({ blob, dataUrl: type === "image/jpeg" && max <= 400 ? c.toDataURL("image/jpeg", 0.7) : null }));
}

/** Resize a picked file: a 2000px JPEG for engraving, and a small thumbnail. */
export async function preparePhoto(file) {
  const img = await loadImage(file);
  const full = await draw(img, 2000, "image/jpeg", 0.9);
  const thumb = await draw(img, 360, "image/jpeg", 0.7);
  return { blob: full.blob, thumb: thumb.dataUrl, width: img.naturalWidth, height: img.naturalHeight };
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
