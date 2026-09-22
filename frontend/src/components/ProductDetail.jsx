import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Check, ChevronRight } from "lucide-react";
import api, { resolveImageUrl } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SEO, { SITE_URL } from "./SEO";
import ImageLightbox from "./ImageLightbox";
import AffiliateRedirect from "./AffiliateRedirect";
import Reveal from "./Reveal";
import SizeFitChecker from "./SizeFitChecker";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    let fetchedCategory = null;
    api
      .get(`/products/slug/${slug}`)
      .then((res) => {
        setProduct(res.data);
        fetchedCategory = res.data.category;
        return api.get("/products");
      })
      .then((res) => {
        if (res?.data) {
          const others = res.data.filter((p) => p.slug !== slug && p.category === fetchedCategory);
          setRelated(others.slice(0, 4));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page container" style={{ paddingTop: 60 }}>Loading...</div>;
  if (notFound || !product) {
    return (
      <div className="page container" style={{ paddingTop: 60 }}>
        <SEO title="Product not found" noindex path={`/product/${slug}`} />
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>It may have been removed or the link is incorrect.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to shop</Link>
        </div>
      </div>
    );
  }

  const price = product.type === "affiliate" ? product.displayPrice : product.sellingPrice;
  const hasDiscount = product.mrp && price && product.mrp > price;
  const discountPct = hasDiscount ? Math.round(((product.mrp - price) / product.mrp) * 100) : 0;
  const gallery = (product.images?.length > 0 ? product.images : [product.image]).filter(Boolean).map(resolveImageUrl);

  const seoTitle = product.seoTitle || `${product.name}${price ? ` Under ₹${Math.ceil(price / 100) * 100}` : ""}`;
  const seoDesc = product.seoDescription || (product.description || "").slice(0, 155);

  // Affiliate products ka price partner site par badal sakta hai — isliye offers.price sirf
  // reseller (apni site par bikne wale, confirmed price) products ke liye include karte hain.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery,
    category: product.category,
    ...(product.type === "reseller"
      ? {
          offers: {
            "@type": "Offer",
            price: product.sellingPrice,
            priceCurrency: "INR",
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/product/${product.slug}`,
          },
        }
      : {}),
  };

  const handleAffiliateClick = () => {
    api.post(`/products/${product._id}/click`).catch(() => {});
    window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
    setRedirecting(product);
  };

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    await addToCart(product._id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="page container product-detail-page">
      <SEO title={seoTitle} description={seoDesc} path={`/product/${product.slug}`} image={gallery[0]} jsonLd={jsonLd} />

      <div className="breadcrumb">
        <Link to="/">Home</Link> <ChevronRight size={13} />{" "}
        <Link to={`/category/${(product.category || "").toLowerCase().replace(/\s+/g, "-")}`}>{product.category}</Link>{" "}
        <ChevronRight size={13} /> <span>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        <div>
          <div className="pd-gallery-main" onClick={() => setLightboxOpen(true)}>
            {gallery[activeImg] && <img src={gallery[activeImg]} alt={product.name} />}
          </div>
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((src, i) => (
                <button key={i} className={`pd-thumb ${i === activeImg ? "active" : ""}`} onClick={() => setActiveImg(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className={`badge ${product.type === "affiliate" ? "badge-affiliate" : "badge-reseller"}`}>
            {product.type === "affiliate" ? `Via ${product.affiliateSource || "Partner"}` : "Sold by us"}
          </span>
          <h1 style={{ marginTop: 10 }}>{product.name}</h1>

          <div className="price-row" style={{ fontSize: 22, margin: "12px 0" }}>
            <span className="price">₹{price}</span>
            {hasDiscount && <span className="mrp">₹{product.mrp}</span>}
            {hasDiscount && <span className="badge" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>{discountPct}% off</span>}
          </div>

          {product.type === "affiliate" && (
            <p className="pd-price-note">Price and availability may change. Confirm the latest details on the partner site.</p>
          )}

          <p style={{ color: "var(--ink-soft)", whiteSpace: "pre-line", lineHeight: 1.7 }}>{product.description}</p>

          {product.type === "affiliate" ? (
            <button className="btn btn-accent btn-pill" onClick={handleAffiliateClick} style={{ marginTop: 12 }}>
              View on {product.affiliateSource || "Partner Site"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn btn-accent btn-pill" disabled={product.stock <= 0} onClick={() => navigate(`/checkout/${product._id}`)}>
                {product.stock > 0 ? "Buy Now" : "Out of stock"}
              </button>
              <button className="btn btn-outline btn-pill" disabled={product.stock <= 0} onClick={handleAddToCart}>
                {added ? <Check size={16} /> : <ShoppingCart size={16} />} Add to Cart
              </button>
            </div>
          )}

          <p className="pd-affiliate-disclosure">
            {product.type === "affiliate"
              ? "This is an affiliate link — we may earn a commission at no extra cost to you. "
              : ""}
            See our <Link to="/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>

          {product.sizeChart?.length > 0 && (
            <>
              <h3 className="pd-size-heading">Size Chart</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Size</th>
                      {product.sizeChart.some((r) => r.chest) && <th>Chest (in)</th>}
                      {product.sizeChart.some((r) => r.waist) && <th>Waist (in)</th>}
                      {product.sizeChart.some((r) => r.hip) && <th>Hip (in)</th>}
                      {product.sizeChart.some((r) => r.shoulder) && <th>Shoulder (in)</th>}
                      {product.sizeChart.some((r) => r.length) && <th>Length (in)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeChart.map((row, i) => (
                      <tr key={i}>
                        <td><strong>{row.size}</strong></td>
                        {product.sizeChart.some((r) => r.chest) && <td>{row.chest ?? "-"}</td>}
                        {product.sizeChart.some((r) => r.waist) && <td>{row.waist ?? "-"}</td>}
                        {product.sizeChart.some((r) => r.hip) && <td>{row.hip ?? "-"}</td>}
                        {product.sizeChart.some((r) => r.shoulder) && <td>{row.shoulder ?? "-"}</td>}
                        {product.sizeChart.some((r) => r.length) && <td>{row.length ?? "-"}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SizeFitChecker sizeChart={product.sizeChart} />
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="section-title">Related Products</h2>
          <div className="product-grid">
            {related.map((p, i) => {
              const rPrice = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
              const rImg = resolveImageUrl(p.image);
              return (
                <Reveal key={p._id} delay={(i % 4) * 60} className="product-card">
                  <Link to={`/product/${p.slug}`} className="img-wrap" style={{ display: "block" }}>
                    {rImg && <img src={rImg} alt={p.name} loading="lazy" />}
                  </Link>
                  <h3 style={{ fontSize: 16 }}>
                    <Link to={`/product/${p.slug}`} className="product-title-link">{p.name}</Link>
                  </h3>
                  <div className="price-row"><span className="price">₹{rPrice}</span></div>
                </Reveal>
              );
            })}
          </div>
        </>
      )}

      {lightboxOpen && (
        <ImageLightbox images={gallery} startIndex={activeImg} alt={product.name} onClose={() => setLightboxOpen(false)} />
      )}
      {redirecting && <AffiliateRedirect product={redirecting} onDone={() => setRedirecting(null)} />}
    </div>
  );
}
