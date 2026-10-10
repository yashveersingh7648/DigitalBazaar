// Single source of truth for page-level SEO text.
// Used by BOTH the React pages (via <SEO />) and scripts/prerender.mjs (build-time static HTML),
// so the title/description a crawler sees in the raw HTML is identical to what React sets later.
export const BRAND = "DigitalBazaar";

export const HOME_TITLE = "DigitalBazaar — Curated Finds, Honest Prices | Online Shopping";
export const HOME_DESC =
  "Shop curated fashion, electronics, home & beauty — sourced by us or handpicked from Flipkart, Meesho, Amazon, Myntra & Nykaa. Clear pricing.";

export const CATEGORIES = [
  { slug: "fashion", label: "Fashion", blurb: "Men's and women's clothing, shirts, casual wear and everyday fashion picks." },
  { slug: "electronics", label: "Electronics", blurb: "Gadgets, mobile accessories and useful electronics at clearly shown prices." },
  { slug: "home-living", label: "Home & Living", blurb: "Kitchen, storage and home products that make daily life easier." },
  { slug: "beauty", label: "Beauty", blurb: "Everyday personal care and beauty products from trusted sellers." },
  { slug: "footwear", label: "Footwear", blurb: "Casual shoes, sandals and daily-wear footwear for men, women and kids." },
  { slug: "accessories", label: "Accessories", blurb: "Bags, watches, belts and small accessories that complete an outfit." },
  { slug: "kids", label: "Kids", blurb: "Clothing and everyday products for children." },
];

export const categoryMeta = (label) => ({
  title: `${label} Products`,
  description: `Shop ${label} at ${BRAND} — curated picks sourced directly by us and handpicked partner deals, all clearly labelled with honest prices.`,
});

// "title" here has no brand suffix — <SEO /> appends " — DigitalBazaar".
export const PAGE_META = {
  contact: {
    path: "/contact",
    title: "Contact Us",
    description: `Questions about an order, a product or a partnership? Contact ${BRAND} by email, phone or the contact form. We usually reply within a day.`,
  },
  privacy: {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description: `How ${BRAND} collects, uses and protects your information: account details, orders, payment references and anonymous site usage data.`,
  },
  terms: {
    path: "/terms",
    title: "Terms & Conditions",
    description: `The terms for using ${BRAND}: products sold by us versus partner affiliate products, pricing, UPI and Cash on Delivery orders, delivery and returns.`,
  },
  affiliate: {
    path: "/affiliate-disclosure",
    title: "Affiliate Disclosure",
    description: `${BRAND} earns a commission on qualifying purchases made through affiliate links to Flipkart, Meesho, Amazon, Myntra and Nykaa, at no extra cost to you.`,
  },
  login: {
    path: "/login",
    title: "Log in",
    description: `Log in to your ${BRAND} account to view your cart, orders and profile.`,
    noindex: true,
  },
  register: {
    path: "/register",
    title: "Create account",
    description: `Create a free ${BRAND} account to save your cart and track your orders.`,
    noindex: true,
  },
};
