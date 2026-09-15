import React from "react";

const CATEGORIES = [
  "All",
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Footwear",
  "Accessories",
  "Kids",
];

export default function CategoryBar({ active, onSelect }) {
  return (
    <div className="category-bar">
      <div className="container category-bar-scroll">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${active === cat ? "active" : ""}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
