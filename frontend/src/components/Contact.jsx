import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import api from "../api/api";
import SEO from "./SEO";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    try {
      await api.post("/contact", form);
      setMessage("Thanks! Your query has been sent — we'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <SEO title="Contact Us" path="/contact" />

      <div className="hero-section hero-section-sm">
        <div className="container">
          <div className="hero" style={{ maxWidth: "100%", padding: "56px 0 44px" }}>
            <span className="hero-eyebrow">We usually reply within a day</span>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)" }}>Get in touch</h1>
            <p>Have a question about an order, a product, or a partnership idea? Send us a message.</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 920 }}>
      <div className="contact-grid" style={{ marginTop: 40 }}>
        <form onSubmit={handleSubmit} className="form-card" style={{ margin: 0, maxWidth: "none" }}>
          <label>Your Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
          <label>Email</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          <label>Phone (optional)</label>
          <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
          <label>Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} required style={{ minHeight: 120 }} />
          {message && <p className={message.startsWith("Error") ? "error-text" : "success-text"}>{message}</p>}
          <button className="btn btn-accent btn-block" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="contact-info-card">
          <h3>Contact details</h3>
          <div className="contact-info-row">
            <span className="contact-icon"><Mail size={18} /></span>
            <div>
              <div className="contact-label">Email</div>
              <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a>
            </div>
          </div>
          <div className="contact-info-row">
            <span className="contact-icon"><Phone size={18} /></span>
            <div>
              <div className="contact-label">Phone</div>
              <a href="tel:+916396773509">+91 63967 73509</a>
            </div>
          </div>
          <div className="contact-info-row">
            <span className="contact-icon"><MapPin size={18} /></span>
            <div>
              <div className="contact-label">Location</div>
              <span>Noida, Sector 49, Uttar Pradesh, India</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
