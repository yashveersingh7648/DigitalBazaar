import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true }, // SEO-friendly URL, e.g. "wireless-earbuds-x1"
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    seoTitle: { type: String, default: "" }, // optional override for <title>, else auto-built from name
    seoDescription: { type: String, default: "" }, // optional override for meta description
    image: { type: String, default: "" }, // cover image — always images[0]
    images: { type: [String], default: [] }, // full gallery, up to 6

    // Fashion/footwear size chart — optional, admin fills per product. All measurements in inches.
    sizeChart: {
      type: [
        {
          size: { type: String, required: true }, // "S", "M", "L", "XL", "8", "9", etc.
          chest: Number,
          waist: Number,
          hip: Number,
          shoulder: Number,
          length: Number,
        },
      ],
      default: [],
    },

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
    featured: { type: Boolean, default: false }, // admin-curated "Trending" pick — shown in the homepage highlight strip
  },
  { timestamps: true }
);

productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ category: 1 });

productSchema.virtual("margin").get(function () {
  if (this.type !== "reseller") return null;
  return (this.sellingPrice || 0) - (this.sourcePrice || 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
