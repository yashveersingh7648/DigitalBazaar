import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "cancelled" } });

    let totalOrders = orders.length;
    let totalSales = 0;
    let totalCost = 0;
    let totalMargin = 0;

    orders.forEach((order) => {
      const paid = order.sellingPriceAtOrder * order.quantity;
      const cost = order.sourceCostAtOrder * order.quantity;
      totalSales += paid;
      totalCost += cost;
      totalMargin += paid - cost;
    });

    const statusCounts = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Affiliate analytics — actual commission is only available on the Flipkart Affiliate dashboard,
    // here we just track clicks to see which products are getting the most interest
    const affiliateProducts = await Product.find({ type: "affiliate" }).sort({ clicks: -1 });
    const totalAffiliateClicks = affiliateProducts.reduce((sum, p) => sum + (p.clicks || 0), 0);

    res.json({
      reseller: { totalOrders, totalSales, totalCost, totalMargin, statusCounts },
      affiliate: {
        totalAffiliateClicks,
        topProducts: affiliateProducts.slice(0, 5).map((p) => ({
          id: p._id,
          name: p.name,
          clicks: p.clicks,
          source: p.affiliateSource,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
