import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.jsx";
export { metaFor, allRoutes } from "./seo.js";
export { PRODUCTS, ALL_PRODUCTS, COLORS } from "./data/products.js";
export { DELIVERY_FEE, FREE_DELIVERY_OVER, PICKUP_ENABLED, SITE_URL } from "./config.js";

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
