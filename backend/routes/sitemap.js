import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Jahan aapki website actually live hai — .env me FRONTEND_URL set karke override kar sakte ho.
// Custom domain lene ke baad bas yahi ek value badalni hogi.
const SITE_URL = (process.env.FRONTEND_URL || "https://digitalbazaar.onrender.com").replace(/\/$/, "");

const CATEGORY_SLUGS = ["fashion", "electronics", "home-living", "beauty", "footwear", "accessories", "kids"];

const xmlEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// GET /sitemap.xml — Home + Category pages + har active product, dynamically DB se
router.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).select("slug updatedAt").lean();

    const urls = [
      { loc: "/", changefreq: "daily", priority: "1.0" },
      { loc: "/contact", changefreq: "monthly", priority: "0.5" },
      { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "/terms", changefreq: "yearly", priority: "0.3" },
      { loc: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
      ...CATEGORY_SLUGS.map((slug) => ({ loc: `/category/${slug}`, changefreq: "weekly", priority: "0.7" })),
      ...products
        .filter((p) => p.slug)
        .map((p) => ({
          loc: `/product/${p.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : undefined,
        })),
    ];

    const body = urls
      .map(
        (u) =>
          `  <url>\n    <loc>${xmlEscape(SITE_URL + u.loc)}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
          `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join("\n");

    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

// GET /robots.txt — sitemap ko yahi se point karta hai, hamesha sync rehta hai
router.get("/robots.txt", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

export default router;
