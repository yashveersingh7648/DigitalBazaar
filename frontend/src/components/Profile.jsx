import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import SEO from "./SEO";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "", address: user.address || "" });
  }, [user]);

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(form);
      setMessage("Profile updated!");
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const initial = (user.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="page container" style={{ maxWidth: 640 }}>
      <SEO title="My Profile" path="/profile" noindex />

      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div>
          <h2 style={{ marginBottom: 2 }}>{user.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>{user.email}</p>
          <span className="profile-role">{user.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card" style={{ margin: "0 0 24px", maxWidth: "none" }}>
        <h3>Edit Profile</h3>
        <label>Name</label>
        <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
        <label>Phone Number</label>
        <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
        <label>Default Delivery Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} />
        {message && <p className={message.startsWith("Error") ? "error-text" : "success-text"}>{message}</p>}
        <button className="btn btn-accent" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <h3 className="section-title">Order History</h3>
      {orders.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No orders yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Paid ₹</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.productName}</td>
                  <td>{o.quantity}</td>
                  <td>{o.totalPaid}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
