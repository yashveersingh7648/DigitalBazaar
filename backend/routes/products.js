import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Supported affiliate partners — verified each has a real, official affiliate program
// as of 2026 (Flipkart Affiliate, Meesho Creator Club, Amazon Associates India, Myntra
// Affiliate Feature, Nykaa Affiliate Program). Links are checked against these domains.
const AFFILIATE_DOMAINS = {
  flipkart: ["flipkart.com", "fkrt.it", "fkrt.co"],
  meesho: ["meesho.com"],
  amazon: ["amazon.in", "amzn.to", "amzn.in"],
  myntra: ["myntra.com"],
  nykaa: ["nykaa.com"],
};

// Affiliate product ki basic sanity check: source ek supported partner ho, aur link usi ke domain ka ho.
// NOTE: Ye sirf link-domain match karta hai — ye guarantee nahi de sakta ki wahi exact
// product/category us partner par bhi available hai, kyunki uske liye unke
// official Product Search API + approved affiliate credentials chahiye hote hain.
const validateAffiliate = (body) => {
  if (body.type !== "affiliate") return null;
  if (!body.category) return "Category zaroori hai, taaki hum sahi partner category se match kar sakein";

  const source = (body.affiliateSource || "").trim().toLowerCase();
  const supported = Object.keys(AFFILIATE_DOMAINS);
  if (!supported.includes(source)) {
    return `Affiliate Source sirf ${supported.map((s) => s[0].toUpperCase() + s.slice(1)).join(", ")} me se ek hona chahiye`;
  }

  const link = (body.affiliateLink || "").trim().toLowerCase();
  const domains = AFFILIATE_DOMAINS[source];
  const matches = domains.some((d) => link.includes(d));
  if (!matches) {
    return `Ye link ${body.affiliateSource} ka official link nahi lagta — link me ${domains.join(" ya ")} hona chahiye`;
  }
  return null;
};

// GET all products - public (customers browse). ?admin=true + admin token => sab products (inactive bhi)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.admin === "true" ? {} : { isActive: true };
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    // .lean() se Mongoose virtuals (jaise "margin") nahi aate — isliye yahan khud add kar rahe hain
    const withMargin = products.map((p) => ({
      ...p,
      margin: p.type === "reseller" ? (p.sellingPrice || 0) - (p.sourcePrice || 0) : null,
    }));
    res.json(withMargin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product - admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.type) {
      return res.status(400).json({ error: "Name and type (affiliate/reseller) are required" });
    }
    if (body.type === "reseller" && (body.sourcePrice == null || body.sellingPrice == null)) {
      return res.status(400).json({ error: "sourcePrice and sellingPrice are required for reseller products" });
    }
    if (body.type === "affiliate" && !body.affiliateLink) {
      return res.status(400).json({ error: "affiliateLink is required for affiliate products" });
    }
    const affiliateError = validateAffiliate(body);
    if (affiliateError) return res.status(400).json({ error: affiliateError });

    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update - admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (req.body.type === "affiliate") {
      const affiliateError = validateAffiliate(req.body);
      if (affiliateError) return res.status(400).json({ error: affiliateError });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/click - tracks a click on the affiliate link (public, no login required)
router.post("/:id/click", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ clicks: product.clicks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
