import React, { useState, useEffect, useMemo } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import api, { resolveImageUrl } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SEO from "./SEO";
import CategoryBar from "./CategoryBar";
import TrustStrip from "./TrustStrip";
import Reveal from "./Reveal";
import ImageLightbox from "./ImageLightbox";
import BagIllustration from "./BagIllustration";
import AffiliateRedirect from "./AffiliateRedirect";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState(new Set());
  const [lightboxImg, setLightboxImg] = useState(null);
  const [redirecting, setRedirecting] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [expandedDesc, setExpandedDesc] = useState(new Set());

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return products;
    return products.filter(
      (p) => (p.category || "").toLowerCase() === category.toLowerCase()
    );
  }, [products, category]);

  const handleAffiliateClick = (product) => {
    api.post(`/products/${product._id}/click`).catch(() => {});
    // Naya tab seedha click ke andar hi (synchronously) kholte hain — warna browser ka
    // popup-blocker ise rok sakta hai kyunki delay ke baad wo ek "trusted user click" nahi maanta.
    window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
    // Current tab par branded "Redirecting..." card dikhate hain — user ko lagta hai wo
    // hamari hi site ke andar ek smooth transition se guzra, abrupt jump jaisa nahi lagta.
    setRedirecting(product);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    await addToCart(product._id, 1);
    setJustAdded(product._id);
    setTimeout(() => setJustAdded(null), 1400);
  };

  const featured = useMemo(() => products.filter((p) => p.featured), [products]);

  const renderCard = (p, i, showTrendingBadge = false) => {
    const price = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
    const hasDiscount = p.mrp && price && p.mrp > price;
    const discountPct = hasDiscount ? Math.round(((p.mrp - price) / p.mrp) * 100) : 0;
    const isWishlisted = wishlist.has(p._id);
    const imgSrc = resolveImageUrl(p.image);
    const gallery = (p.images && p.images.length > 0 ? p.images : [p.image]).filter(Boolean).map(resolveImageUrl);

    return (
      <Reveal key={p._id} delay={(i % 4) * 60} className="product-card">
        <div className="img-wrap" onClick={() => imgSrc && setLightboxImg({ images: gallery, alt: p.name })}>
          {imgSrc && <img src={imgSrc} alt={p.name} loading="lazy" />}
          {gallery.length > 1 && <span className="image-count-badge">1/{gallery.length}</span>}
          {showTrendingBadge && (
            <span className="trending-badge">🔥 Trending</span>
          )}
          <button
            className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
            aria-label="Save to wishlist"
            onClick={(e) => { e.stopPropagation(); toggleWishlist(p._id); }}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          {hasDiscount && <span className="discount-badge">{discountPct}% OFF</span>}
        </div>

        <span className={`badge ${p.type === "affiliate" ? "badge-affiliate" : "badge-reseller"}`}>
          {p.type === "affiliate" ? `Via ${p.affiliateSource || "Partner"}` : "Sold by us"}
        </span>

        <h3 style={{ fontSize: 16 }}>{p.name}</h3>
        {/* <p className="desc">{p.description}</p> */}
        {(() => {
  const isExpanded = expandedDesc.has(p._id);
  const descText = p.description || "";
  const LIMIT = 90; // 2 lines ke aas paas
  const needsToggle = descText.length > LIMIT;
  const shown = isExpanded || !needsToggle
    ? descText
    : descText.slice(0, LIMIT).trim() + "...";

  return (
    <div className="desc-wrap">
      <p className={`desc ${isExpanded ? "expanded" : ""}`}>{shown}</p>
      {needsToggle && (
        <button
          type="button"
          className="desc-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedDesc((prev) => {
              const next = new Set(prev);
              next.has(p._id) ? next.delete(p._id) : next.add(p._id);
              return next;
            });
          }}
        >
          {isExpanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
})()}

        <div className="price-row">
          <span className="price">₹{price}</span>
          {hasDiscount && <span className="mrp">₹{p.mrp}</span>}
        </div>

        {p.type === "affiliate" ? (
          <button className="btn btn-accent" onClick={() => handleAffiliateClick(p)}>
            View on {p.affiliateSource || "Partner Site"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn"
              style={{ flex: 1 }}
              disabled={p.stock <= 0}
              onClick={() => navigate(`/checkout/${p._id}`)}
            >
              {p.stock > 0 ? "Buy Now" : "Out of stock"}
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={p.stock <= 0}
              aria-label="Add to cart"
              onClick={() => handleAddToCart(p)}
            >
              {justAdded === p._id ? <Check size={16} /> : <ShoppingCart size={16} />}
            </button>
          </div>
        )}
      </Reveal>
    );
  };

  return (
    <div className="page">
      <SEO
        title="Shop"
        description="Curated products sourced directly by us, plus trusted partner picks — all in one place."
        path="/"
      />

      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero">
              <span className="hero-blob-3" aria-hidden="true"></span>
              <span className="hero-eyebrow">New arrivals every week</span>
              <h1>Curated finds, honest prices</h1>
              <p>
                Some products are sourced and shipped by us directly. Others are handpicked
                from trusted partners like Flipkart and Meesho. Every listing is clearly labelled so
                you always know exactly what you're buying and from where.
              </p>
              <div className="hero-cta-row">
                <a href="#shop-grid" className="btn btn-accent btn-pill">Shop now</a>
                <a href="#category-bar" className="btn btn-outline-light btn-pill">Browse categories</a>
              </div>
            </div>

            {!loading && products.length > 0 && (
              <div className="hero-showcase" aria-hidden="true">
                <BagIllustration />
                {products.slice(0, 3).map((p, i) => {
                  const src = resolveImageUrl(p.image);
                  const price = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
                  if (!src) return null;
                  return (
                    <div className={`hero-showcase-card card-${i}`} key={p._id}>
                      <img src={src} alt="" />
                      <div className="hero-showcase-meta">
                        <span>{p.name}</span>
                        <strong>₹{price}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <TrustStrip />

      <div id="category-bar">
        <CategoryBar active={category} onSelect={setCategory} />
      </div>

      {!loading && featured.length > 0 && (
        <div className="container trending-strip">
          <h2 className="section-title" style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8 }}>
            🔥 Trending picks
          </h2>
          <p style={{ color: "var(--muted)", marginTop: -6 }}>
            Hand-checked by us — genuinely doing well right now, not an algorithm guess.
          </p>
          <div className="product-grid">
            {featured.map((p, i) => renderCard(p, i, true))}
          </div>
        </div>
      )}

      <div className="container" id="shop-grid">
        {loading && (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category, or check back soon — new items are added every week.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="product-grid">
            {filtered.map((p, i) => renderCard(p, i, false))}
          </div>
        )}
      </div>

      {lightboxImg && (
        <ImageLightbox images={lightboxImg.images} alt={lightboxImg.alt} onClose={() => setLightboxImg(null)} />
      )}
      {redirecting && (
        <AffiliateRedirect product={redirecting} onDone={() => setRedirecting(null)} />
      )}
    </div>
  );
}
