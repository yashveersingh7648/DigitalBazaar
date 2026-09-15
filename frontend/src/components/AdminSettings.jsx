import React, { useState, useEffect, useRef } from "react";
import api, { resolveImageUrl } from "../api/api";
import SEO from "./SEO";

export default function AdminSettings() {
  const [form, setForm] = useState({ upiId: "", payeeName: "", qrImage: "" });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get("/settings/payment").then((res) => {
      setForm({ upiId: res.data.upiId || "", payeeName: res.data.payeeName || "", qrImage: res.data.qrImage || "" });
      if (res.data.qrImage) setQrPreview(resolveImageUrl(res.data.qrImage));
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let qrImage = form.qrImage;
      if (qrFile) {
        const fd = new FormData();
        fd.append("image", qrFile);
        const uploadRes = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        qrImage = uploadRes.data.url;
      }
      await api.put("/settings/payment", { ...form, qrImage });
      setMessage("Payment settings saved!");
      setQrFile(null);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page container form-wide">
      <SEO title="Admin · Payment Settings" path="/admin/settings" noindex />
      <h2>Payment Settings</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: -8 }}>
        Ye QR aur UPI ID checkout page par customers ko dikhengi. Payment karne ke baad customer
        UTR number submit karega — us se aap apne bank/UPI app me match karke order ko "Verified" mark kar sakte ho.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Your UPI ID</label>
        <input className="form-input" name="upiId" placeholder="yourname@upi" value={form.upiId} onChange={handleChange} />

        <label>Payee / Business Name (optional)</label>
        <input className="form-input" name="payeeName" placeholder="e.g. Yashveer Store" value={form.payeeName} onChange={handleChange} />

        <label>QR Code Image</label>
        <p className="upload-hint" style={{ marginTop: -6 }}>
          Apne payment app (PhonePe/GPay/Paytm) se seedha "Share QR" / "Download QR" wali clean image use karein —
          screenshot me crop hoke code ka koi hissa na kate, isse scan fail hota hai.
        </p>
        {qrPreview ? (
          <div className="qr-admin-preview" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
            <img src={qrPreview} alt="QR preview" />
          </div>
        ) : (
          <label className="upload-box" htmlFor="qr-input">
            <div className="upload-hint" style={{ padding: "18px 0" }}>Click to upload your UPI QR code image</div>
          </label>
        )}
        {qrPreview && <p className="upload-hint" style={{ textAlign: "center", marginTop: -4 }}>Click the QR to change it</p>}
        <input id="qr-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

        {message && <p className={message.startsWith("Error") ? "error-text" : "success-text"}>{message}</p>}
        <button className="btn btn-accent" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Payment Settings"}
        </button>
      </form>
    </div>
  );
}
