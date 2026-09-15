import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Cart ko product details ke saath populate karke bhejta hai
const sendCart = async (userId, res) => {
  const user = await User.findById(userId).populate("cart.product");
  // Deleted products (jo ab exist nahi karte) ko cart se hata do
  user.cart = user.cart.filter((item) => item.product);
  await user.save();
  res.json(user.cart);
};

// GET /api/cart
router.get("/", protect, async (req, res) => {
  try {
    await sendCart(req.user._id, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart  { productId, quantity }
router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.type !== "reseller") {
      return res.status(400).json({ error: "Affiliate products cart me nahi jud sakte — ye direct partner site par order hote hain" });
    }

    const user = await User.findById(req.user._id);
    const existing = user.cart.find((item) => item.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }
    await user.save();
    await sendCart(req.user._id, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/:productId  { quantity }
router.put("/:productId", protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });
    item.quantity = Math.max(1, Number(quantity) || 1);
    await user.save();
    await sendCart(req.user._id, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/:productId
router.delete("/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    await user.save();
    await sendCart(req.user._id, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart — pura cart khali karo (checkout ke baad)
router.delete("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
