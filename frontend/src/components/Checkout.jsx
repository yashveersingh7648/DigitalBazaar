import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "./SEO";
import PaymentQR from "./PaymentQR";

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "", quantity: 1 });
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get(`/products/${productId}`).then((res) => setProduct(res.data));
  }, [productId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setMessage("");
    try {
      await api.post("/orders", {
        productId,
        ...form,
        quantity: Number(form.quantity),
        paymentMethod: method,
        transactionId,
      });
      setMessage(
        method === "UPI"
          ? "Order placed! Payment verify hote hi confirm ho jaayega."
          : "Order placed successfully!"
      );
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setPlacing(false);
    }
  };

  if (!product) return <p style={{ padding: 24 }}>Loading...</p>;
  const total = product.sellingPrice * form.quantity;

  return (
    <div className="page">
      <div className="form-card">
      <SEO title="Checkout" path="/checkout" noindex />
      <h2>Checkout</h2>
      <p style={{ color: "var(--ink-soft)" }}>
        <strong>{product.name}</strong> — ₹{product.sellingPrice} × {form.quantity}
      </p>
      <form onSubmit={handleSubmit}>
        <label>Your Name</label>
        <input className="form-input" name="customerName" onChange={handleChange} required />
        <label>Phone Number</label>
        <input className="form-input" name="customerPhone" onChange={handleChange} required />
        <label>Delivery Address</label>
        <textarea name="customerAddress" onChange={handleChange} required />
        <label>Quantity</label>
        <input className="form-input" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />

        <PaymentQR
          amount={total}
          method={method}
          setMethod={setMethod}
          transactionId={transactionId}
          setTransactionId={setTransactionId}
        />

        {message && <p className={message.startsWith("Error") ? "error-text" : "success-text"}>{message}</p>}
        <button className="btn btn-block btn-accent" type="submit" disabled={placing}>
          {placing ? "Placing order..." : `Place Order (Pay ₹${total})`}
        </button>
      </form>
      </div>
    </div>
  );
}
