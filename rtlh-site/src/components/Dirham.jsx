import React from "react";

const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

/** A price on the page, e.g. <Dh v={75} /> → "AED 75". Change the format here to change it site-wide. */
export function Dh({ v }) {
  return <span className="dh">AED {fmt(v)}</span>;
}
