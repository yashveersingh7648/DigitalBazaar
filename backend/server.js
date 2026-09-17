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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
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

app.get("/", (req, res) => res.send("Reseller + Affiliate Platform API running"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));
