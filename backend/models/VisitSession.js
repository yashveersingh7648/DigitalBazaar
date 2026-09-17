import mongoose from "mongoose";

// Ek document = ek browser session (anonymous, localStorage-based id — koi personal data nahi)
const visitSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    firstSeen: { type: Date, required: true },
    lastSeen: { type: Date, required: true },
    pageCount: { type: Number, default: 1 },
    lastPath: { type: String, default: "/" },
  },
  { timestamps: true }
);

export default mongoose.model("VisitSession", visitSessionSchema);
