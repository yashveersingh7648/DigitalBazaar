/**
 * Build-time prerender (no Puppeteer / no extra dependency).
 *
 * Problem: this is a client-side React app, so every URL used to return the SAME raw HTML
 * (same <title>, same description, same body). Crawlers that don't run JavaScript
 * (Semrush with "JS rendering: Disabled", Facebook/WhatsApp, most AI crawlers) therefore
 * saw "duplicate title / duplicate description / duplicate content" on every page.
 *
 * Fix: after `vite build`, this script takes dist/index.html as a template and writes a
 * separate dist/<route>/index.html for every public route, each with its own unique
 * <title>, meta description, canonical, Open Graph tags, H1, body text and internal links.
 * Product / category data is fetched from the backend API at build time.
 *
 * Runtime behaviour is unchanged: React still mounts into #root and replaces this static
 * content, and react-helmet-async takes over the tags that carry data-rh="true".
 *
 * SAFETY: this script NEVER fails the build. Any error is logged and the plain
 * dist/index.html (the old behaviour) is left in place.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.PRERENDER_DIST || path.resolve(__dirname, "..", "dist");
const SITE_URL = (process.env.VITE_SITE_URL || "https://digitalbazaar.onrender.com").replace(/\/$/, "");
const API_URL = (process.env.VITE_API_URL || "https://digitalbazaar-backend-1qdt.onrender.com/api").replace(/\/$/, "");
const BRAND = "DigitalBazaar";

const CATEGORIES = [
  { slug: "fashion", label: "Fashion", blurb: "Men's and women's clothing, shirts, casual wear and everyday fashion picks." },
  { slug: "electronics", label: "Electronics", blurb: "Gadgets, mobile accessories and useful electronics at clearly shown prices." },
  { slug: "home-living", label: "Home & Living", blurb: "Kitchen, storage and home products that make daily life easier." },
  { slug: "beauty", label: "Beauty", blurb: "Everyday personal care and beauty products from trusted sellers." },
  { slug: "footwear", label: "Footwear", blurb: "Casual shoes, sandals and daily-wear footwear for men, women and kids." },
  { slug: "accessories", label: "Accessories", blurb: "Bags, watches, belts and small accessories that complete an outfit." },
  { slug: "kids", label: "Kids", blurb: "Clothing and everyday products for children." },
];

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clean = (s = "") => String(s).replace(/\s+/g, " ").trim();
const clip = (s, n) => {
  const t = clean(s);
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
};
const catSlug = (name = "") => name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--+/g, "-");

// ---------- data ----------
async function fetchJson(url, attempts = 4, timeoutMs = 45000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return await res.json();
      console.warn(`[prerender] ${url} -> HTTP ${res.status} (attempt ${i}/${attempts})`);
    } catch (err) {
      console.warn(`[prerender] ${url} failed: ${err.message} (attempt ${i}/${attempts})`);
    }
    await new Promise((r) => setTimeout(r, 4000)); // backend may be waking up (free tier)
  }
  return null;
}

// ---------- page chrome ----------
const NAV = `
      <header>
        <a href="/">${BRAND}</a>
        <nav>
${CATEGORIES.slice(0, 5).map((c) => `          <a href="/category/${c.slug}">${esc(c.label)}</a>`).join("\n")}
          <a href="/contact">Contact</a>
        </nav>
      </header>`;

const FOOT = `
      <footer>
        <a href="/">Home</a>
        <a href="/contact">Contact</a>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms">Terms &amp; Conditions</a>
        <a href="/affiliate-disclosure">Affiliate Disclosure</a>
      </footer>`;

const productList = (products) =>
  products.length
    ? `<ul>\n${products
        .map((p) => {
          const price = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
          const via = p.type === "affiliate" ? ` (via ${esc(p.affiliateSource || "partner")})` : " (sold by us)";
          return `          <li><a href="/product/${esc(p.slug)}">${esc(p.name)}</a>${price != null ? ` — ₹${esc(price)}` : ""}${via}</li>`;
        })
        .join("\n")}\n        </ul>`
    : "";

const wrap = (main) => `${NAV}\n      <main>\n${main}\n      </main>${FOOT}`;

// ---------- route table ----------
function buildRoutes(products) {
  const active = products.filter((p) => p.slug);
  const routes = [];

  routes.push({
    path: "/",
    title: `${BRAND} — Curated Finds, Honest Prices | Online Shopping`,
    description:
      "Shop curated fashion, electronics, home & beauty — sourced by us or handpicked from Flipkart, Meesho, Amazon, Myntra & Nykaa. Clear pricing.",
    body: wrap(`        <h1>Curated finds, honest prices</h1>
        <p>${BRAND} is a curated online store. Some products are sourced and shipped directly by us, and others are handpicked partner deals from Flipkart, Meesho, Amazon, Myntra and Nykaa — every listing is clearly labelled so you always know exactly what you're buying and from where.</p>
        <h2>Shop by category</h2>
        <ul>
${CATEGORIES.map((c) => `          <li><a href="/category/${c.slug}">${esc(c.label)}</a> — ${esc(c.blurb)}</li>`).join("\n")}
        </ul>
        ${active.length ? `<h2>Latest products</h2>\n        ${productList(active.slice(0, 12))}` : ""}
        <h2>Why shop at ${BRAND}?</h2>
        <p>Our finds are chosen with care, and our prices are honest and clearly shown. Products marked "Sold by us" can be paid by UPI or Cash on Delivery. Products marked with a partner name open on that partner's own site, where you complete the purchase; we may earn a small commission at no extra cost to you.</p>`),
  });

  for (const c of CATEGORIES) {
    const inCat = active.filter((p) => catSlug(p.category) === c.slug);
    routes.push({
      path: `/category/${c.slug}`,
      title: `${c.label} Products — ${BRAND}`,
      description: `Shop ${c.label} at ${BRAND} — curated picks sourced directly by us and handpicked partner deals, all clearly labelled with honest prices.`,
      body: wrap(`        <h1>${esc(c.label)}</h1>
        <p>${esc(c.blurb)} Browse curated ${esc(c.label.toLowerCase())} products from ${BRAND}: items we source and ship ourselves, plus handpicked deals from trusted partners. Every listing shows clearly whether it is sold by us or by a partner.</p>
        ${inCat.length ? `<h2>${esc(c.label)} products</h2>\n        ${productList(inCat)}` : `<p>New ${esc(c.label.toLowerCase())} products are added every week — check back soon.</p>`}
        <p><a href="/">Back to all products</a></p>`),
    });
  }

  routes.push(
    {
      path: "/contact",
      title: `Contact Us — ${BRAND}`,
      description: `Questions about an order, a product or a partnership? Contact ${BRAND} by email, phone or the contact form. We usually reply within a day.`,
      body: wrap(`        <h1>Contact ${BRAND}</h1>
        <p>Have a question about an order, a product or a partnership idea? Send us a message and we usually reply within a day.</p>
        <p>Email: <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a></p>
        <p>Phone: <a href="tel:+916396773509">+91 63967 73509</a></p>
        <p>Location: Sector 49, Noida, Uttar Pradesh, India</p>`),
    },
    {
      path: "/privacy-policy",
      title: `Privacy Policy — ${BRAND}`,
      description: `How ${BRAND} collects, uses and protects your information: account details, orders, payment references and anonymous site usage data.`,
      body: wrap(`        <h1>Privacy Policy</h1>
        <p>This Privacy Policy explains what information ${BRAND} collects (account details, order and delivery details, UPI transaction references, contact-form messages and anonymous usage data), how it is used to process orders and improve the site, and the choices you have. We never store card, bank or UPI PIN details.</p>
        <p>Questions? <a href="/contact">Contact us</a>.</p>`),
    },
    {
      path: "/terms",
      title: `Terms & Conditions — ${BRAND}`,
      description: `The terms for using ${BRAND}: products sold by us versus partner affiliate products, pricing, UPI and Cash on Delivery orders, delivery and returns.`,
      body: wrap(`        <h1>Terms &amp; Conditions</h1>
        <p>These terms explain the two kinds of listings on ${BRAND} — products "Sold by us" (paid on this site by UPI or Cash on Delivery) and affiliate products that open on a partner's website — along with pricing, delivery estimates, cancellations and returns, and account responsibility.</p>
        <p>See also our <a href="/privacy-policy">Privacy Policy</a> and <a href="/affiliate-disclosure">Affiliate Disclosure</a>.</p>`),
    },
    {
      path: "/affiliate-disclosure",
      title: `Affiliate Disclosure — ${BRAND}`,
      description: `${BRAND} earns a commission on qualifying purchases made through affiliate links to Flipkart, Meesho, Amazon, Myntra and Nykaa, at no extra cost to you.`,
      body: wrap(`        <h1>Affiliate Disclosure</h1>
        <p>Some links on ${BRAND} are affiliate links. If you click one and make a qualifying purchase on the partner's website, we may receive a commission at no additional cost to you. Prices shown for affiliate products are a reference only; the final price is always confirmed on the partner's site.</p>
        <p>Products marked "Sold by us" are not affiliate links. <a href="/">Back to shop</a>.</p>`),
    },
    {
      path: "/login",
      title: `Log in — ${BRAND}`,
      description: `Log in to your ${BRAND} account to view your cart, orders and profile.`,
      noindex: true,
      body: wrap(`        <h1>Log in</h1>
        <p>Log in to your ${BRAND} account to view your cart and orders. New here? <a href="/register">Create an account</a>.</p>`),
    },
    {
      path: "/register",
      title: `Create account — ${BRAND}`,
      description: `Create a free ${BRAND} account to save your cart and track your orders.`,
      noindex: true,
      body: wrap(`        <h1>Create account</h1>
        <p>Create a free ${BRAND} account in under a minute. Already registered? <a href="/login">Log in</a>.</p>`),
    }
  );

  for (const p of active) {
    const price = p.type === "affiliate" ? p.displayPrice : p.sellingPrice;
    const gallery = (p.images && p.images.length ? p.images : [p.image]).filter(Boolean);
    const cover = gallery[0] || "";
    const desc = clip(p.seoDescription || p.description || `${p.name} at ${BRAND}.`, 155);
    const title = p.seoTitle || p.name;
    const catLabel = (CATEGORIES.find((c) => c.slug === catSlug(p.category)) || {}).label || p.category || "Products";
    const jsonLd =
      p.type === "reseller"
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: clip(p.description || p.name, 300),
            image: gallery,
            category: p.category,
            offers: {
              "@type": "Offer",
              price: p.sellingPrice,
              priceCurrency: "INR",
              availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `${SITE_URL}/product/${p.slug}`,
            },
          }
        : { "@context": "https://schema.org", "@type": "Product", name: p.name, description: clip(p.description || p.name, 300), image: gallery, category: p.category };

    routes.push({
      path: `/product/${p.slug}`,
      title: `${title} — ${BRAND}`,
      description: desc,
      image: cover,
      jsonLd,
      body: wrap(`        <p><a href="/">Home</a> / <a href="/category/${catSlug(p.category)}">${esc(catLabel)}</a> / ${esc(p.name)}</p>
        <h1>${esc(p.name)}</h1>
        ${cover ? `<img src="${esc(cover)}" alt="${esc(p.name)}" width="400" />` : ""}
        ${price != null ? `<p>Price: ₹${esc(price)}${p.type === "affiliate" ? " (reference price — confirm the latest price on the partner site)" : ""}</p>` : ""}
        <p>${p.type === "affiliate" ? `Available via ${esc(p.affiliateSource || "our partner")}. This is an affiliate link — we may earn a commission at no extra cost to you.` : "Sold and shipped by us. Pay by UPI or Cash on Delivery."}</p>
        <p>${esc(clip(p.description || "", 900))}</p>
        <p><a href="/category/${catSlug(p.category)}">More ${esc(catLabel)} products</a></p>`),
    });
  }
  return routes;
}

// ---------- html templating ----------
function render(template, r) {
  const url = SITE_URL + (r.path === "/" ? "/" : r.path);
  const ogImage = r.image || `${SITE_URL}/logo.png`;
  const tag = (s) => s.replace("/>", 'data-rh="true" />');

  let html = template;
  // strip the generic tags from the template; they are replaced with route-specific ones
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>/gi, "");

  const head = [
    `<title>${esc(r.title)}</title>`,
    tag(`<meta name="description" content="${esc(r.description)}" />`),
    r.noindex ? tag(`<meta name="robots" content="noindex, follow" />`) : "",
    tag(`<link rel="canonical" href="${esc(url)}" />`),
    tag(`<meta property="og:type" content="${r.path.startsWith("/product/") ? "product" : "website"}" />`),
    tag(`<meta property="og:site_name" content="${BRAND}" />`),
    tag(`<meta property="og:title" content="${esc(r.title)}" />`),
    tag(`<meta property="og:description" content="${esc(r.description)}" />`),
    tag(`<meta property="og:url" content="${esc(url)}" />`),
    tag(`<meta property="og:image" content="${esc(ogImage)}" />`),
    tag(`<meta name="twitter:card" content="summary_large_image" />`),
    tag(`<meta name="twitter:title" content="${esc(r.title)}" />`),
    tag(`<meta name="twitter:description" content="${esc(r.description)}" />`),
    tag(`<meta name="twitter:image" content="${esc(ogImage)}" />`),
    r.jsonLd ? `<script type="application/ld+json" data-rh="true">${JSON.stringify(r.jsonLd).replace(/</g, "\\u003c")}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, (m) => `${m}\n    ${head}`);

  // swap the static fallback inside #root for this route's own content
  const rootOpen = html.search(/<div\s+id=["']root["'][^>]*>/i);
  const bodyClose = html.lastIndexOf("</body>");
  if (rootOpen === -1 || bodyClose === -1) throw new Error("template: #root / </body> not found");
  const openEnd = html.indexOf(">", rootOpen) + 1;
  const rootClose = html.lastIndexOf("</div>", bodyClose);
  if (rootClose < openEnd) throw new Error("template: closing </div> for #root not found");
  return html.slice(0, openEnd) + "\n" + r.body + "\n    " + html.slice(rootClose);
}

// ---------- main ----------
async function main() {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.warn(`[prerender] ${templatePath} not found — skipping.`);
    return;
  }
  const template = fs.readFileSync(templatePath, "utf8");

  let products = [];
  const data = await fetchJson(`${API_URL}/products`);
  if (Array.isArray(data)) products = data;
  else console.warn("[prerender] could not load products — generating static pages without product data.");

  const routes = buildRoutes(products);
  let written = 0;
  for (const r of routes) {
    try {
      const out = render(template, r);
      const file = r.path === "/" ? templatePath : path.join(DIST, ...r.path.split("/").filter(Boolean), "index.html");
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, out, "utf8");
      written++;
    } catch (err) {
      console.warn(`[prerender] ${r.path} skipped: ${err.message}`);
    }
  }
  console.log(`[prerender] wrote ${written}/${routes.length} static pages (${products.length} products).`);

  // sitemap.xml: every indexable page + every active product, generated at build time so it is
  // always served from THIS domain (no dependency on host-level proxy rules).
  try {
    const byslug = new Map(products.map((p) => [p.slug, p]));
    const urls = routes
      .filter((r) => !r.noindex)
      .map((r) => {
        const prod = r.path.startsWith("/product/") ? byslug.get(r.path.split("/")[2]) : null;
        const lastmod = prod && prod.updatedAt ? new Date(prod.updatedAt).toISOString().slice(0, 10) : "";
        const priority = r.path === "/" ? "1.0" : r.path.startsWith("/product/") ? "0.8" : r.path.startsWith("/category/") ? "0.7" : "0.4";
        return `  <url>\n    <loc>${esc(SITE_URL + (r.path === "/" ? "/" : r.path))}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <priority>${priority}</priority>\n  </url>`;
      })
      .join("\n");
    fs.writeFileSync(
      path.join(DIST, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      "utf8"
    );
    console.log("[prerender] wrote sitemap.xml");
  } catch (err) {
    console.warn("[prerender] sitemap skipped:", err.message);
  }
}

main().catch((err) => console.warn("[prerender] failed, keeping plain index.html:", err.message)).finally(() => process.exit(0));
