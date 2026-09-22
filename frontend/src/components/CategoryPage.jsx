import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImageUrl } from "../api/api";
import SEO from "./SEO";
import Reveal from "./Reveal";

const CATEGORY_LABELS = {
  fashion: "Fashion",
  electronics: "Electronics",
  "home-living": "Home & Living",
  beauty: "Beauty",
  footwear: "Footwear",
  accessories: "Accessories",
  kids: "Kids",
};

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const label = CATEGORY_LABELS[categorySlug] || categorySlug;

  useEffect(() => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data.filter((p) => (p.category || "").toLowerCase().replace(/\s+/g, "-") === categorySlug)))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  const seoDesc = useMemo(
    () => `Shop ${label} — curated picks sourced directly by us and handpicked partner deals, all clearly labelled.`,
    [label]
  );

  return (
    <div className="page container" style={{ paddingTop: 40 }}>
      <SEO title={`${label} Products`} description={seoDesc} path={`/category/${categorySlug}`} />

      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>{label}</span>
      </div>
      <h1 style={{ marginTop: 8 }}>{label}</h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: 560 }}>{seoDesc}</p>

      {loading && <div className="product-grid">{[1, 2, 3, 4].map((i) => <div className="skeleton" key={i} />)}</div>}

      {!loading && products.length === 0 && (
        <div className="empty-state">
          <h3>No {label} products yet</h3>
          <p>Check back soon — new items are added every week.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="product-grid">
          {products.map((p, i) => {
            const price = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
            const img = resolveImageUrl(p.image);
            return (
              <Reveal key={p._id} delay={(i % 4) * 60} className="product-card">
                <Link to={`/product/${p.slug}`} className="img-wrap" style={{ display: "block" }}>
                  {img && <img src={img} alt={p.name} loading="lazy" />}
                </Link>
                <span className={`badge ${p.type === "affiliate" ? "badge-affiliate" : "badge-reseller"}`}>
                  {p.type === "affiliate" ? `Via ${p.affiliateSource || "Partner"}` : "Sold by us"}
                </span>
                <h3 style={{ fontSize: 16 }}>
                  <Link to={`/product/${p.slug}`} className="product-title-link">{p.name}</Link>
                </h3>
                <div className="price-row"><span className="price">₹{price}</span></div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
