import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { getMailer } from "../utils/mailer.js";

const router = express.Router();

// Jahan query email hoke jaani chahiye — .env me CONTACT_EMAIL se override kar sakte ho
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "yashveersingh7648@gmail.com";

// POST /api/contact — public, koi bhi visitor query bhej sakta hai
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email aur message zaroori hain" });
    }

    const saved = await ContactMessage.create({ name, email, phone, message });

    // Email bhejne ki koshish karo (SendGrid pehle, warna Gmail) — agar dono me se kuch bhi
    // set nahi hai to ye chup-chaap skip ho jaayega, lekin query DB me save ho hi chuki hai.
    const mailer = getMailer();
    if (mailer) {
      try {
        await mailer.transporter.sendMail({
          from: `"${name} (via website)" <${mailer.from}>`,
          to: CONTACT_EMAIL,
          replyTo: email,
          subject: `New contact query from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\n\nMessage:\n${message}`,
        });
        saved.emailSent = true;
        await saved.save();
      } catch (mailErr) {
        console.error("Contact email failed to send:", mailErr.message);
      }
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contact — admin only, saari queries dekhne ke liye (email fail ho jaaye tab bhi backup)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
