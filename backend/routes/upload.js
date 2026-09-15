import express from "express";
import upload from "../middleware/upload.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// POST /api/upload  (field name: "image") — admin only, seedhe file upload karta hai
router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image file received" });
  // Public URL jo frontend <img src> me seedha use ho sake
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

// Multer errors (file too big, wrong type) ko clean JSON error me convert karta hai
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

export default router;
