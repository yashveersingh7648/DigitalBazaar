import React from "react";
import { Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Free delivery", sub: "On orders above ₹499" },
  { icon: RotateCcw, label: "Easy returns", sub: "7-day return window" },
  { icon: ShieldCheck, label: "Secure payment", sub: "100% protected checkout" },
  { icon: BadgeCheck, label: "Verified sellers", sub: "Authorized suppliers only" },
];

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="container trust-strip-grid">
        {ITEMS.map(({ icon: Icon, label, sub }) => (
          <div className="trust-item" key={label}>
            <Icon size={20} strokeWidth={1.75} />
            <div>
              <div className="trust-label">{label}</div>
              <div className="trust-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
