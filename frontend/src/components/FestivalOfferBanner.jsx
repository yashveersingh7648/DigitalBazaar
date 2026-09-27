import React from "react";
import { Gift, PartyPopper } from "lucide-react";

const CONFETTI_COLORS = ["#f7ca7d", "#e6a83a", "#c264e0", "#e0a8d4", "#ffffff"];

export default function FestivalOfferBanner() {
  return (
    <div className="festival-offer-banner">
      <div className="festival-offer-confetti" aria-hidden="true">
        {CONFETTI_COLORS.concat(CONFETTI_COLORS).map((color, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 7) % 100}%`,
              background: color,
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="festival-offer-inner container">
        <Gift size={20} className="festival-icon festival-icon-bounce" />
        <span className="festival-offer-text">
          <strong>Festival Special</strong> — Extra discount on selected items this week
        </span>
        <a href="#shop-grid" className="btn btn-accent btn-pill btn-sm festival-offer-cta">
          Shop Now
        </a>
        <PartyPopper size={20} className="festival-icon festival-icon-wiggle" />
      </div>
    </div>
  );
}