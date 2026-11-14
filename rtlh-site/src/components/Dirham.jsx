import React from "react";

/* The UAE dirham symbol (Central Bank of the UAE, 2025), drawn as a small
   inline graphic. Most phones and fonts can't show the new Unicode
   character yet, so a drawing is the reliable way to show it everywhere. */
export function DirhamSign() {
  return (
    <svg className="dh-sign" viewBox="0 0 100 90" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M22 8h26c28 0 44 16 44 37S76 82 48 82H22zM34 19v52h13c21 0 33-11 33-26S68 19 47 19z" />
      <rect x="4" y="31" width="94" height="7.5" rx="1.5" />
      <rect x="4" y="50" width="94" height="7.5" rx="1.5" />
    </svg>
  );
}

const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

/** A price with the dirham symbol, e.g. <Dh v={75} /> → [symbol]75 */
export function Dh({ v }) {
  return (
    <span className="dh" aria-label={`${fmt(v)} dirhams`}>
      <DirhamSign />
      <span aria-hidden="true">{fmt(v)}</span>
    </span>
  );
}
