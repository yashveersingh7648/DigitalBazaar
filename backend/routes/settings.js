import express from "express";
import Settings from "../models/Settings.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/settings/payment — public, checkout page ko QR/UPI dikhane ke liye chahiye
router.get("/payment", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "payment" });
    if (!settings) settings = await Settings.create({ key: "payment" });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/payment — admin only, UPI ID / payee name / QR image update karo
router.put("/payment", protect, adminOnly, async (req, res) => {
  try {
    const { upiId, payeeName, qrImage } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { key: "payment" },
      { $set: { upiId, payeeName, qrImage } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
