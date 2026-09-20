import React, { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

// Naya tab pehle hi khul chuka hota hai (ProductList me synchronously) — ye component sirf
// current tab par ek branded, reassuring "confirmed, opening in a new tab" card dikhata hai,
// taaki abrupt jump jaisa na lage aur customer ko pata rahe ki wo hamari hi site par bane hue hai.
export default function AffiliateRedirect({ product, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="redirect-overlay">
      <div className="redirect-card">
        <div className="redirect-icon"><ShieldCheck size={22} /></div>
        <h4>Opened {product.affiliateSource || "partner site"} in a new tab</h4>
        <p>
          {product.category ? `${product.category} · ` : ""}
          {product.name} — you're still right here on Bazaar, just switch tabs to complete your purchase.
        </p>
        <div className="redirect-progress"><div className="redirect-progress-bar" /></div>
      </div>
    </div>
  );
}
