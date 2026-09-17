import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  address: user.address || "",
});

// If this email matches ADMIN_EMAIL, promote the user to admin on register/login
const resolveRole = (email) =>
  process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
    ? "admin"
    : "customer";

const isAdminEmail = (email) =>
  !!process.env.ADMIN_EMAIL && email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

// Constant-time string compare — taaki password check timing se guess na ho sake
const safeEqual = (a, b) => {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Admin ka email reserved hai — isse koi bhi normal signup se register nahi kar sakta,
    // warna email ke public hone (Contact page) par koi bhi wahi email use karke admin ban sakta tha
    if (isAdminEmail(email)) {
      return res.status(400).json({ error: "This email is reserved for the site admin. Please log in instead." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: "This email is already registered" });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login: password hamesha process.env.ADMIN_PASSWORD se match hota hai —
    // isse aap sirf .env edit karke admin password rotate kar sakte ho, DB chhue bina
    if (isAdminEmail(email)) {
      if (!process.env.ADMIN_PASSWORD || !safeEqual(password || "", process.env.ADMIN_PASSWORD)) {
        return res.status(401).json({ error: "Incorrect email or password" });
      }
      let admin = await User.findOne({ email: email.toLowerCase() });
      if (!admin) {
        admin = await User.create({ name: "Admin", email: email.toLowerCase(), role: "admin" });
      } else if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
      }
      return res.json({ token: signToken(admin), user: publicUser(admin) });
    }

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google  { credential: <Google ID token> }
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: resolveRole(payload.email),
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(401).json({ error: "Google login failed: " + err.message });
  }
});

// GET /api/auth/me — returns the currently logged-in user
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Not logged in" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json(publicUser(user));
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// PUT /api/auth/me — apni profile update karo (name, phone, address)
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    await req.user.save();
    res.json(publicUser(req.user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
