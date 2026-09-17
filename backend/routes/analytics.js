import express from "express";
import VisitSession from "../models/VisitSession.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// POST /api/analytics/ping — public, koi bhi login ke bina call hoti hai.
// Frontend har page-visit par aur har ~25s heartbeat par isse call karta hai,
// isse "kitne unique visitors" aur "kitni der site par rahe" dono nikal sakte hain.
router.post("/ping", async (req, res) => {
  try {
    const { sessionId, path: pagePath, isNewPageview } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const now = new Date();
    await VisitSession.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { firstSeen: now },
        $set: { lastSeen: now, lastPath: pagePath || "/" },
        ...(isNewPageview ? { $inc: { pageCount: 1 } } : {}),
      },
      { upsert: true }
    );
    res.status(204).end();
  } catch (err) {
    // Analytics kabhi bhi user-facing request ko fail nahi karni chahiye
    res.status(204).end();
  }
});

// GET /api/analytics/summary — admin only, Dashboard ke liye
router.get("/summary", protect, adminOnly, async (req, res) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalVisitors, last24h, last7d, sessions] = await Promise.all([
      VisitSession.countDocuments(),
      VisitSession.countDocuments({ lastSeen: { $gte: dayAgo } }),
      VisitSession.countDocuments({ lastSeen: { $gte: weekAgo } }),
      VisitSession.find().sort({ lastSeen: -1 }).limit(500).lean(),
    ]);

    // Har session ka "time on site" = lastSeen - firstSeen (heartbeats se update hota rehta hai)
    const durations = sessions.map((s) => (new Date(s.lastSeen) - new Date(s.firstSeen)) / 1000);
    const avgSeconds = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const totalPageviews = sessions.reduce((sum, s) => sum + (s.pageCount || 1), 0);

    res.json({
      totalVisitors,
      last24h,
      last7d,
      avgSeconds,
      totalPageviews,
      recentSessions: sessions.slice(0, 15).map((s) => ({
        sessionId: s.sessionId.slice(0, 8),
        firstSeen: s.firstSeen,
        lastSeen: s.lastSeen,
        pageCount: s.pageCount,
        lastPath: s.lastPath,
        durationSeconds: Math.round((new Date(s.lastSeen) - new Date(s.firstSeen)) / 1000),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
