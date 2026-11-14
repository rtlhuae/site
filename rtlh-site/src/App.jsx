import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductPage from "./pages/Product.jsx";
import Checkout, { CartPage } from "./pages/Checkout.jsx";
import OrderComplete from "./pages/OrderComplete.jsx";
import { Events, About, Contact, Faq, Policy } from "./pages/Info.jsx";
import NotFound from "./pages/NotFound.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import { CartProvider } from "./lib/cart.jsx";
import { useSeo } from "./seo.js";

function Pages() {
  const { pathname } = useLocation();
  useSeo(pathname);
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:cat" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/complete" element={<OrderComplete />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/policies/delivery-returns" element={<Policy which="delivery-returns" />} />
        <Route path="/policies/terms" element={<Policy which="terms" />} />
        <Route path="/policies/privacy" element={<Policy which="privacy" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Pages />
    </CartProvider>
  );
}
