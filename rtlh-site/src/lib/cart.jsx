import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { findProduct, unitPrice } from "../data/products.js";
import { DELIVERY_FEES, DELIVERY_FEE_OTHER, FREE_DELIVERY_OVER } from "../config.js";
import { deletePhoto } from "./photos.js";

const KEY = "rtlh_cart_v2";
const CartCtx = createContext(null);

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => findProduct(i.slug)) : [];
  } catch {
    return [];
  }
}

export const feeForEmirate = (emirate) => (emirate in DELIVERY_FEES ? DELIVERY_FEES[emirate] : DELIVERY_FEE_OTHER);

export function deliveryFor(subtotal, method, emirate) {
  if (method === "pickup") return 0;
  if (FREE_DELIVERY_OVER && subtotal >= FREE_DELIVERY_OVER) return 0;
  return feeForEmirate(emirate);
}

export function CartProvider({ children }) {
  // Start empty so the server-rendered HTML matches the first browser paint,
  // then load the saved cart.
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(read());
    setLoaded(true);
    const onStorage = (e) => e.key === KEY && setItems(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage full or blocked */ }
  }, [items, loaded]);

  const add = useCallback((item) => {
    setItems((prev) => {
      // Merge identical unpersonalised lines; personalised ones stay separate.
      if (item.mode === "none") {
        const i = prev.findIndex((p) => p.mode === "none" && p.slug === item.slug && p.color === item.color);
        if (i >= 0) {
          const next = prev.slice();
          next[i] = { ...next[i], qty: Math.min(20, next[i].qty + item.qty) };
          return next;
        }
      }
      return [...prev, { ...item, key: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` }];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, Math.min(20, qty)) } : p)));
  }, []);

  const remove = useCallback((key) => {
    setItems((prev) => {
      const gone = prev.find((p) => p.key === key);
      if (gone && gone.photoId) deletePhoto(gone.photoId);
      return prev.filter((p) => p.key !== key);
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((p) => p.photoId && deletePhoto(p.photoId));
      return [];
    });
  }, []);

  const lines = useMemo(
    () =>
      items.map((i) => {
        const product = findProduct(i.slug);
        const unit = unitPrice(product, i.mode);
        return { ...i, product, unit, total: unit * i.qty };
      }),
    [items]
  );
  const subtotal = lines.reduce((a, l) => a + l.total, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);

  const value = { items: lines, add, setQty, remove, clear, subtotal, count, loaded, drawerOpen, setDrawerOpen };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
