import React from "react";
import { MessageCircle, Facebook, Twitter } from "lucide-react";

// Share-the-current-page buttons (not profile/social links — those already live in Footer).
// Seobility's "social media" check wants visible sharing options on the page itself, so this
// is a small, self-contained addition that doesn't touch any existing component or route.
export default function ShareButtons({ title }) {
  const url = typeof window !== "undefined" ? window.location.href : "https://digitalbazaar.onrender.com/";
  const text = title ? `${title} — DigitalBazaar` : "DigitalBazaar — Curated Finds, Honest Prices";

  const links = [
    {
      icon: MessageCircle,
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      icon: Facebook,
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      icon: Twitter,
      label: "Share on X / Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <div className="share-row" style={{ display: "flex", gap: 10, alignItems: "center", margin: "12px 0" }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>Share:</span>
      {links.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="social-icon"
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}
