import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import cartRoutes from "./routes/cart.js";
import uploadRoutes from "./routes/upload.js";
import settingsRoutes from "./routes/settings.js";
import contactRoutes from "./routes/contact.js";
import analyticsRoutes from "./routes/analytics.js";
import sitemapRoutes from "./routes/sitemap.js";
import Product from "./models/Product.js";
import { generateUniqueSlug } from "./utils/slug.js";

import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
// Sirf known frontend domains (production + local dev) ko allow karta hai — wildcard se zyada safe,
// aur galat/purane origin se aane wali requests turant clear error dete hain (debug karna aasan hota hai)
const ALLOWED_ORIGINS = [
  "https://digitalbazaar.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",      // ✅ Slash hata diya
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Postman/curl jaise tools origin nahi bhejte — unhe allow rehne do
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(compression()); // responses ko gzip karta hai — page load fast karta hai
app.use(express.json());

// Uploaded product images yahan se serve hoti hain: http://<host>/uploads/<filename>
// (Ab Cloudinary use ho raha hai to naye uploads seedhe Cloudinary URL return karte hain —
// ye sirf bahut purani, disk par save hui images ke liye backward-compatible rakha gaya hai)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/", sitemapRoutes); // /sitemap.xml aur /robots.txt seedhe DB se dynamically generate hote hain

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DigitalBazaar backend is running",
    time: new Date().toISOString(),
  });
});

app.get("/", (req, res) => res.send("Reseller + Affiliate Platform API running"));

const PORT = process.env.PORT || 5000;

// Purane products jinke paas slug nahi hai (feature launch se pehle create hue), unke liye
// ek baar slug backfill kar deta hai — taaki sab products /product/:slug se turant accessible ho jaayein
const backfillMissingSlugs = async () => {
  const missing = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] });
  for (const p of missing) {
    p.slug = await generateUniqueSlug(Product, p.name, p._id);
    await p.save();
  }
  if (missing.length) console.log(`Backfilled slugs for ${missing.length} product(s)`);
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await backfillMissingSlugs().catch((err) => console.error("Slug backfill error:", err.message));
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));



  const SELF_PING_URL =
  process.env.NODE_ENV === "production"
    ? "https://digitalbazaar-backend-1qdt.onrender.com/health"
    : "http://localhost:5000/health";

setInterval(() => {
  axios
    .get(SELF_PING_URL)
    .then(() => console.log("Self-Ping: Server is awake!"))
    .catch((err) => console.error("Self-Ping Error:", err.message));
}, 2 * 60 * 1000);