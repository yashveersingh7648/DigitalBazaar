import React, { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import api, { resolveImageUrl } from "../api/api";
import SEO from "./SEO";

const CATEGORY_OPTIONS = ["Fashion", "Electronics", "Home & Living", "Beauty", "Footwear", "Accessories", "Kids"];
const AFFILIATE_SOURCES = ["Flipkart", "Meesho", "Amazon", "Myntra", "Nykaa"];

const emptyForm = {
  type: "reseller",
  name: "",
  description: "",
  category: "",
  image: "",
  mrp: "",
  featured: false,
  // reseller
  sourcePrice: "",
  sellingPrice: "",
  supplierName: "",
  supplierSku: "",
  stock: "",
  // affiliate
  affiliateSource: "Flipkart",
  affiliateLink: "",
  displayPrice: "",
  commissionNote: "",
};

export default function AdminAddProduct() {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    const res = await api.get("/products?admin=true");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const margin =
    form.type === "reseller" && form.sellingPrice && form.sourcePrice
      ? Number(form.sellingPrice) - Number(form.sourcePrice)
      : null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      type: p.type,
      name: p.name || "",
      description: p.description || "",
      category: p.category || "",
      image: p.image || "",
      mrp: p.mrp ?? "",
      featured: !!p.featured,
      sourcePrice: p.sourcePrice ?? "",
      sellingPrice: p.sellingPrice ?? "",
      supplierName: p.supplierName || "",
      supplierSku: p.supplierSku || "",
      stock: p.stock ?? "",
      affiliateSource: p.affiliateSource || "Flipkart",
      affiliateLink: p.affiliateLink || "",
      displayPrice: p.displayPrice ?? "",
      commissionNote: p.commissionNote || "",
    });
    setImageFile(null);
    setImagePreview(p.image ? resolveImageUrl(p.image) : "");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      let imagePath = form.image;

      // Agar nayi file choose ki hai to pehle usse upload karo, fir uska returned path use karo
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePath = uploadRes.data.url;
        setUploading(false);
      }

      const payload = { ...form, image: imagePath, mrp: form.mrp ? Number(form.mrp) : undefined };
      if (form.type === "reseller") {
        payload.sourcePrice = Number(form.sourcePrice);
        payload.sellingPrice = Number(form.sellingPrice);
        payload.stock = Number(form.stock) || 0;
      } else {
        payload.displayPrice = form.displayPrice ? Number(form.displayPrice) : undefined;
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage("Product updated!");
      } else {
        await api.post("/products", payload);
        setMessage("Product published!");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setUploading(false);
      setMessage("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    if (editingId === id) resetForm();
    fetchProducts();
  };

  return (
    <div className="page">
      <SEO title="Admin · Add Product" path="/admin" noindex />

      <div className="admin-banner">
        <div className="container">
          <h2 style={{ color: "#fff", margin: 0 }}>{editingId ? "Edit product" : "Add a new product"}</h2>
          <p style={{ color: "rgba(255,255,255,0.72)", margin: "4px 0 0" }}>
            List items you fulfill yourself, or affiliate products from Flipkart and Meesho.
          </p>
        </div>
      </div>

      <div className="container form-wide">

      {editingId && (
        <div className="editing-banner">
          <span>Editing an existing product</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>
            <X size={14} /> Cancel edit
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Product Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="reseller">Reseller — you fulfill the order yourself</option>
          <option value="affiliate">Affiliate — commission via Flipkart/Meesho link</option>
        </select>

        <label>Product Name</label>
        <input className="form-input" name="name" value={form.name} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />

        <div className="row-2">
          <div>
            <label>Category</label>
            <input className="form-input" name="category" value={form.category} onChange={handleChange} list="category-options" required />
            <datalist id="category-options">
              {CATEGORY_OPTIONS.map((c) => <option value={c} key={c} />)}
            </datalist>
          </div>
          <div>
            <label>Product Image</label>
            <label className="upload-box" htmlFor="product-image-input">
              {imagePreview ? (
                <div className="upload-preview"><img src={imagePreview} alt="preview" /></div>
              ) : (
                <div className="upload-hint" style={{ padding: "18px 0" }}>Click to upload an image (jpg, png, webp)</div>
              )}
              {imagePreview && <div className="upload-hint">Click to change image</div>}
              <input
                id="product-image-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <label>MRP (₹, optional — shows a strikethrough discount to customers)</label>
        <input className="form-input" type="number" name="mrp" value={form.mrp} onChange={handleChange} />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Mark as Trending / Featured pick — you've checked this is genuinely doing well
          (bestseller, high rating, high demand) on its source site or in your own sales,
          and want it highlighted in the homepage "Trending picks" strip.
        </label>

        {form.type === "reseller" ? (
          <>
            <div className="row-2">
              <div>
                <label>Source Price (₹) — your cost from the supplier</label>
                <input className="form-input" type="number" name="sourcePrice" value={form.sourcePrice} onChange={handleChange} required />
              </div>
              <div>
                <label>Selling Price (₹) — shown to the customer</label>
                <input className="form-input" type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange} required />
              </div>
            </div>
            {margin !== null && (
              <p className="success-text">Margin: ₹{margin} (calculated automatically)</p>
            )}
            <div className="row-2">
              <div>
                <label>Supplier / Source Name</label>
                <input className="form-input" name="supplierName" value={form.supplierName} onChange={handleChange} />
              </div>
              <div>
                <label>Supplier SKU / Reference</label>
                <input className="form-input" name="supplierSku" value={form.supplierSku} onChange={handleChange} />
              </div>
            </div>
            <label>Stock Quantity</label>
            <input className="form-input" type="number" name="stock" value={form.stock} onChange={handleChange} />
          </>
        ) : (
          <>
            <div className="row-2">
              <div>
                <label>Affiliate Source</label>
                <select name="affiliateSource" value={form.affiliateSource} onChange={handleChange}>
                  {AFFILIATE_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Display Price (₹, reference only)</label>
                <input className="form-input" type="number" name="displayPrice" value={form.displayPrice} onChange={handleChange} />
              </div>
            </div>
            <label>Official Affiliate Link</label>
            <input
              className="form-input"
              name="affiliateLink"
              placeholder={form.affiliateSource === "Meesho" ? "https://meesho.com/... (from Meesho affiliate dashboard)" : "https://fkrt.it/... (from Flipkart affiliate dashboard)"}
              value={form.affiliateLink}
              onChange={handleChange}
              required
            />
            <p className="upload-hint" style={{ marginTop: -8, marginBottom: 14 }}>
              Link {form.affiliateSource} ka official domain ka hi hona chahiye, warna save nahi hoga — isse
              redirect hone par galat site par jaane ka risk nahi rehta.
            </p>
            <label>Commission Note (optional, for your reference only)</label>
            <input className="form-input" name="commissionNote" placeholder="e.g. ~5% on electronics" value={form.commissionNote} onChange={handleChange} />
          </>
        )}

        {message && <p className={message.startsWith("Error") ? "error-text" : "success-text"}>{message}</p>}
        <button className="btn btn-accent" type="submit" disabled={uploading}>
          {uploading ? "Uploading image..." : editingId ? "Save Changes" : "Publish Product"}
        </button>
      </form>

      <h3 className="section-title">Existing Products</h3>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Type</th>
            <th>Price / Margin</th>
            <th>Stock / Clicks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.image && <img className="product-thumb" src={resolveImageUrl(p.image)} alt={p.name} />}</td>
              <td>{p.name}</td>
              <td>{p.type}</td>
              <td>
                {p.type === "reseller"
                  ? `₹${p.sellingPrice} (margin ₹${p.margin})`
                  : `₹${p.displayPrice ?? "-"} via ${p.affiliateSource}`}
              </td>
              <td>{p.type === "reseller" ? p.stock : `${p.clicks} clicks`}</td>
              <td>
                <div className="actions-cell">
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)} aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}
