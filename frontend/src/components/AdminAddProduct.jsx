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
  images: [],
  mrp: "",
  featured: false,
  sizeChart: [],
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
  const [existingImages, setExistingImages] = useState([]); // already-uploaded URLs (edit mode)
  const [newImageFiles, setNewImageFiles] = useState([]); // freshly chosen files, not uploaded yet
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 6;
  const totalImageCount = existingImages.length + newImageFiles.length;

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

  const addSizeRow = () =>
    setForm((f) => ({ ...f, sizeChart: [...f.sizeChart, { size: "", chest: "", waist: "", hip: "", shoulder: "", length: "" }] }));
  const updateSizeRow = (idx, field, value) =>
    setForm((f) => ({ ...f, sizeChart: f.sizeChart.map((r, i) => (i === idx ? { ...r, [field]: value } : r)) }));
  const removeSizeRow = (idx) =>
    setForm((f) => ({ ...f, sizeChart: f.sizeChart.filter((_, i) => i !== idx) }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = MAX_IMAGES - totalImageCount;
    const accepted = files.slice(0, room);
    setNewImageFiles((prev) => [...prev, ...accepted]);
    setNewImagePreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
    e.target.value = ""; // same file dobara select karne de
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const removeNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
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
      images: p.images || [],
      mrp: p.mrp ?? "",
      featured: !!p.featured,
      sizeChart: p.sizeChart || [],
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
    // Purane products me sirf "image" ho sakta hai (images array nahi) — dono handle karo
    const gallery = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    setExistingImages(gallery);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      let uploadedUrls = [];

      // Nayi choose ki hui files ko ek saath upload karo (max 6 total)
      if (newImageFiles.length > 0) {
        setUploading(true);
        const fd = new FormData();
        newImageFiles.forEach((f) => fd.append("images", f));
        const uploadRes = await api.post("/upload/multiple", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls = uploadRes.data.urls || [];
        setUploading(false);
      }

      const finalImages = [...existingImages, ...uploadedUrls];
      const payload = {
        ...form,
        image: finalImages[0] || "", // pehli image hi card ka cover image hoti hai
        images: finalImages,
        mrp: form.mrp ? Number(form.mrp) : undefined,
        sizeChart: form.sizeChart
          .filter((r) => r.size)
          .map((r) => ({
            size: r.size,
            chest: r.chest ? Number(r.chest) : undefined,
            waist: r.waist ? Number(r.waist) : undefined,
            hip: r.hip ? Number(r.hip) : undefined,
            shoulder: r.shoulder ? Number(r.shoulder) : undefined,
            length: r.length ? Number(r.length) : undefined,
          })),
      };
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
            <label>Product Images (up to {MAX_IMAGES} — first one is the cover shown on the card)</label>
            <div className="multi-upload-grid">
              {existingImages.map((url, i) => (
                <div className="multi-upload-thumb" key={`ex-${i}`}>
                  <img src={resolveImageUrl(url)} alt={`Image ${i + 1}`} />
                  {i === 0 && <span className="cover-badge">Cover</span>}
                  <button type="button" className="thumb-remove" onClick={() => removeExistingImage(i)} aria-label="Remove image">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((url, i) => (
                <div className="multi-upload-thumb" key={`new-${i}`}>
                  <img src={url} alt={`New image ${i + 1}`} />
                  {existingImages.length === 0 && i === 0 && <span className="cover-badge">Cover</span>}
                  <button type="button" className="thumb-remove" onClick={() => removeNewImage(i)} aria-label="Remove image">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {totalImageCount < MAX_IMAGES && (
                <label className="multi-upload-add" htmlFor="product-image-input">
                  + Add
                  <input
                    id="product-image-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <p className="upload-hint">{totalImageCount}/{MAX_IMAGES} images added</p>
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

        <label>Size Chart (optional — Fashion/Footwear items; inches; leave blank if not applicable)</label>
        {form.sizeChart.map((row, idx) => (
          <div className="size-row" key={idx}>
            <input className="form-input" placeholder="Size (M, L, 9...)" value={row.size} onChange={(e) => updateSizeRow(idx, "size", e.target.value)} />
            <input className="form-input" placeholder="Chest" type="number" value={row.chest} onChange={(e) => updateSizeRow(idx, "chest", e.target.value)} />
            <input className="form-input" placeholder="Waist" type="number" value={row.waist} onChange={(e) => updateSizeRow(idx, "waist", e.target.value)} />
            <input className="form-input" placeholder="Hip" type="number" value={row.hip} onChange={(e) => updateSizeRow(idx, "hip", e.target.value)} />
            <input className="form-input" placeholder="Shoulder" type="number" value={row.shoulder} onChange={(e) => updateSizeRow(idx, "shoulder", e.target.value)} />
            <input className="form-input" placeholder="Length" type="number" value={row.length} onChange={(e) => updateSizeRow(idx, "length", e.target.value)} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => removeSizeRow(idx)} aria-label="Remove size"><X size={13} /></button>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addSizeRow} style={{ marginBottom: 14 }}>+ Add size row</button>

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
