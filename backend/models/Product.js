import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    image: { type: String, default: "" },

    // "affiliate" -> customer buys on the official partner site (Flipkart/Amazon), you earn commission
    // "reseller"  -> customer orders directly from your site, you fulfill via your authorized supplier
    type: { type: String, enum: ["affiliate", "reseller"], required: true },

    mrp: { type: Number }, // original price, used to show a strikethrough discount (optional, both types)

    // ---- Affiliate-only fields ----
    affiliateSource: { type: String, default: "" }, // e.g. "Flipkart", "Amazon"
    affiliateLink: { type: String, default: "" }, // official affiliate tracking link
    displayPrice: { type: Number }, // reference price only — actual price is confirmed on the partner site
    commissionNote: { type: String, default: "" }, // e.g. "~5% on electronics via Flipkart Affiliate"
    clicks: { type: Number, default: 0 }, // how many times "View on Flipkart" was clicked

    // ---- Reseller-only fields ----
    sourcePrice: { type: Number }, // your cost from the supplier
    sellingPrice: { type: Number }, // price charged to the customer
    supplierName: { type: String, default: "" },
    supplierSku: { type: String, default: "" },
    stock: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("margin").get(function () {
  if (this.type !== "reseller") return null;
  return (this.sellingPrice || 0) - (this.sourcePrice || 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
