import React, { useEffect } from "react";

// Product ka type/category match karke, ek chhoti si branded transition dikhata hai
// taaki naye tab me jaana achanak/jhatke jaisa na lage — Flipkart/Meesho par bhejne se pehle.
export default function AffiliateRedirect({ product, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
      onDone();
    }, 900);
    return () => clearTimeout(timer);
  }, [product, onDone]);

  return (
    <div className="redirect-overlay">
      <div className="redirect-card">
        <div className="redirect-spinner" />
        <h4>Taking you to {product.affiliateSource || "the partner site"}</h4>
        <p>
          {product.category ? `${product.category} · ` : ""}
          {product.name} — best price confirmed on their site
        </p>
        <div className="redirect-progress"><div className="redirect-progress-bar" /></div>
      </div>
    </div>
  );
}
