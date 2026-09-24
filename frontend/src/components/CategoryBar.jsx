import React from "react";
import { Link, useLocation } from "react-router-dom";

const CATEGORIES = [
  { label: "All", slug: "" },
  { label: "Fashion", slug: "fashion" },
  { label: "Electronics", slug: "electronics" },
  { label: "Home & Living", slug: "home-living" },
  { label: "Beauty", slug: "beauty" },
  { label: "Footwear", slug: "footwear" },
  { label: "Accessories", slug: "accessories" },
  { label: "Kids", slug: "kids" },
];

// Ab ye sirf JS se in-page filter nahi karta — har category apne asli, crawlable
// /category/:slug page par le jaata hai, taaki Google inhe real internal links ki tarah
// discover/follow kar sake (pehle ye sirf onClick se state badalte the, koi <a href> nahi tha).
export default function CategoryBar() {
  const location = useLocation();
  return (
    <div className="category-bar">
      <div className="container category-bar-scroll">
        {CATEGORIES.map(({ label, slug }) => {
          const to = slug ? `/category/${slug}` : "/";
          const active = location.pathname === to;
          return (
            <Link key={label} to={to} className={`category-chip ${active ? "active" : ""}`}>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
