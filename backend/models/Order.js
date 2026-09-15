import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },

    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },

    quantity: { type: Number, default: 1 },

    // ---- Payment (UPI QR — admin manually verify karta hai) ----
    paymentMethod: { type: String, enum: ["UPI", "COD"], default: "UPI" },
    transactionId: { type: String, default: "" }, // UTR / reference number jo customer ne diya
    paymentStatus: {
      type: String,
      enum: ["pending_verification", "verified", "failed", "not_applicable"],
      default: "pending_verification",
    },

    sourceCostAtOrder: { type: Number, required: true },
    sellingPriceAtOrder: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.virtual("totalPaid").get(function () {
  return this.sellingPriceAtOrder * this.quantity;
});
orderSchema.virtual("totalCost").get(function () {
  return this.sourceCostAtOrder * this.quantity;
});
orderSchema.virtual("totalMargin").get(function () {
  return (this.sellingPriceAtOrder - this.sourceCostAtOrder) * this.quantity;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);
