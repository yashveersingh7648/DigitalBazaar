import mongoose from "mongoose";

// Sirf ek hi document rehta hai is collection me — admin ki UPI/QR payment details
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "payment", unique: true },
    upiId: { type: String, default: "" },
    payeeName: { type: String, default: "" },
    qrImage: { type: String, default: "" }, // /uploads/xyz.png path
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
