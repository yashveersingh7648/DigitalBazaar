import React from "react";
import { Link } from "react-router-dom";
import SEO from "./SEO";

const CATEGORIES = [
  { slug: "fashion", label: "Fashion" },
  { slug: "electronics", label: "Electronics" },
  { slug: "home-living", label: "Home & Living" },
  { slug: "beauty", label: "Beauty" },
  { slug: "footwear", label: "Footwear" },
  { slug: "accessories", label: "Accessories" },
  { slug: "kids", label: "Kids" },
];

export default function NotFound() {
  return (
    <div className="page container" style={{ paddingTop: 80, paddingBottom: 60, textAlign: "center" }}>
      <SEO title="Page Not Found" noindex path="/404" />
      <h1>404 — Page not found</h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: 420, margin: "12px auto 24px" }}>
        The page you're looking for doesn't exist or may have been moved. Here are a few
        places that might help instead.
      </p>
      <Link to="/" className="btn btn-primary btn-pill">Back to homepage</Link>

      <div style={{ maxWidth: 520, margin: "40px auto 0" }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Browse a category</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="btn btn-outline btn-sm">
              {c.label}
            </Link>
          ))}
        </div>
        <p style={{ color: "var(--ink-soft)", marginTop: 24, fontSize: 14 }}>
          Still stuck? <Link to="/contact">Contact us</Link> and we'll point you in the right
          direction.
        </p>
      </div>
    </div>
  );
}
