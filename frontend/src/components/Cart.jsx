import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { resolveImageUrl } from "../api/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";
import PaymentQR from "./PaymentQR";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ customerName: user?.name || "", customerPhone: user?.phone || "", customerAddress: user?.address || "" });
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  const total = items.reduce((sum, i) => sum + (i.product?.sellingPrice || 0) * i.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setMessage("");
    try {
      // Order model ek product par based hai, isliye cart ke har item ke liye ek order banta hai
      for (const item of items) {
        await api.post("/orders", {
          productId: item.product._id,
          quantity: item.quantity,
          paymentMethod: method,
          transactionId,
          ...form,
        });
      }
      await clearCart();
      setMessage("Order placed successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
      refresh();
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page container">
        <SEO title="Cart" path="/cart" noindex />
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some reseller products to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page container" style={{ maxWidth: 640 }}>
      <SEO title="Cart" path="/cart" noindex />
      <h2 style={{ marginTop: 32 }}>Your Cart</h2>

      {items.map((item) => item.product && (
        <div className="cart-item" key={item.product._id}>
          {item.product.image && <img src={resolveImageUrl(item.product.image)} alt={item.product.name} />}
          <div className="cart-item-info">
            <h4>{item.product.name}</h4>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 8px" }}>₹{item.product.sellingPrice} each</p>
            <div className="cart-qty">
              <button onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => removeFromCart(item.product._id)} aria-label="Remove">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        {!checkoutOpen && (
          <button className="btn btn-accent btn-block" onClick={() => setCheckoutOpen(true)}>
            Proceed to Checkout
          </button>
        )}
      </div>

      {checkoutOpen && (
        <form onSubmit={placeOrder} className="form-card" style={{ margin: "24px 0 0", maxWidth: "none" }}>
          <h3>Delivery Details</h3>
          <label>Your Name</label>
          <input className="form-input" name="customerName" value={form.customerName} onChange={handleChange} required />
          <label>Phone Number</label>
          <input className="form-input" name="customerPhone" value={form.customerPhone} onChange={handleChange} required />
          <label>Delivery Address</label>
          <textarea name="customerAddress" value={form.customerAddress} onChange={handleChange} required />

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
      )}
    </div>
  );
}
