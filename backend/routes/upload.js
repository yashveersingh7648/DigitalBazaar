// import express from "express";
// import upload from "../middleware/upload.js";
// import { protect, adminOnly } from "../middleware/auth.js";

// const router = express.Router();

// // POST /api/upload  (field name: "image") — admin only, seedhe file upload karta hai
// router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No image file received" });
//   // Public URL jo frontend <img src> me seedha use ho sake
//   const url = `/uploads/${req.file.filename}`;
//   res.status(201).json({ url });
// });

// // Multer errors (file too big, wrong type) ko clean JSON error me convert karta hai
// router.use((err, req, res, next) => {
//   if (err) return res.status(400).json({ error: err.message });
//   next();
// });

// export default router;





import express from "express";
import upload from "../middleware/upload.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Single image upload
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "No image file received",
      });
    }

    // Cloudinary URL
    const url = req.file.path || req.file.secure_url;

    if (!url) {
      return res.status(500).json({
        error: "Image uploaded but Cloudinary URL was not returned",
      });
    }

    return res.status(201).json({
      url,
    });
  }
);

// Multiple images upload: max 6
router.post(
  "/multiple",
  protect,
  adminOnly,
  upload.array("images", 6),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No image files received",
      });
    }

    const urls = req.files
      .map((file) => file.path || file.secure_url)
      .filter(Boolean);

    return res.status(201).json({
      urls,
    });
  }
);

// Multer/Cloudinary errors
router.use((err, req, res, next) => {
  console.error("Upload error:", err);

  return res.status(400).json({
    error: err.message || "Image upload failed",
  });
});

export default router;