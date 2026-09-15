import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET all orders - admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET my orders - logged in customer
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new order - logged in customer, reseller products only
router.post("/", protect, async (req, res) => {
  try {
    const { productId, customerName, customerPhone, customerAddress, quantity, paymentMethod, transactionId } = req.body;

    if (!productId || !customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const method = paymentMethod === "COD" ? "COD" : "UPI";
    if (method === "UPI" && !transactionId) {
      return res.status(400).json({ error: "UPI payment ka transaction ID / UTR number dena zaroori hai" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.type !== "reseller") {
      return res.status(400).json({ error: "This is an affiliate product — orders are placed directly on the partner site" });
    }

    const qty = quantity || 1;
    if (product.stock < qty) return res.status(400).json({ error: "Not enough stock available" });

    const order = await Order.create({
      user: req.user._id,
      product: product._id,
      productName: product.name,
      customerName,
      customerPhone,
      customerAddress,
      quantity: qty,
      paymentMethod: method,
      transactionId: transactionId || "",
      paymentStatus: method === "COD" ? "not_applicable" : "pending_verification",
      sourceCostAtOrder: product.sourcePrice,
      sellingPriceAtOrder: product.sellingPrice,
    });

    product.stock -= qty;
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status - admin only
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT verify/reject payment — admin only (bank/UPI app me UTR check karke manually confirm karo)
router.put("/:id/payment-status", protect, adminOnly, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const valid = ["pending_verification", "verified", "failed"];
    if (!valid.includes(paymentStatus)) return res.status(400).json({ error: "Invalid payment status" });

    const updated = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
