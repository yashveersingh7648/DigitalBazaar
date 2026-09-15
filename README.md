# Bazaar — Affiliate + Reseller Platform (MERN)

Ek professional website jisme:
- **User login** (email/password + Google) — customers order place kar sakte hain
- **Admin login** — sirf admin product add/edit/delete kar sakta hai, orders manage kar sakta hai
- **Affiliate products** — Flipkart/Amazon jaise partners ke products dikhaye jaate hain; click karte hi customer unki site par jaakar kharidta hai, aapko commission milta hai
- **Reseller products** — aap khud supplier se sourcing karke apni price pe becho, khud fulfill karo

---

## ⚠️ Zaroori: Affiliate model sahi se samjho

| | Affiliate | Reseller |
|---|---|---|
| Product kahan se aata hai | Flipkart/Amazon | Aapka authorized supplier |
| Order kahan place hota hai | Partner site par (redirect) | Aapki website par |
| Payment kaun leta hai | Flipkart/Amazon | Aap |
| Delivery kaun karta hai | Flipkart/Amazon | Aap (supplier se mangwake) |
| Aapko kya milta hai | Commission (% of sale) | Full margin (selling − cost) |
| Legal requirement | Official Flipkart Affiliate account (free) | Supplier se permission/catalogue |

**Meesho ka koi public website-affiliate program nahi hai.** Meesho sirf apna Reseller App deta hai jisme aap WhatsApp/Instagram se resell karte ho — apni website me unke products "affiliate" tarah nahi laga sakte. Isliye:
- **Flipkart** → Affiliate program se legally use karo (link neeche)
- **Meesho** → agar unke products chahiye, to unke Reseller App se khud resell karo, ya unse ek authorized bulk-supplier partnership try karo — apni website me unki listing copy karke "affiliate" jaisa dikhana allowed nahi hai.

---

## Setup Steps

### 1. MongoDB Atlas (Free)
https://www.mongodb.com/cloud/atlas/register → free M0 cluster → connection string copy karo.

### 2. Google OAuth Client ID (Free, login ke liye)
1. https://console.cloud.google.com/apis/credentials par jao
2. "Create Credentials" → "OAuth Client ID" → Application type: **Web application**
3. Authorized JavaScript origins me add karo: `http://localhost:3000` (aur baad me apna live domain)
4. Client ID copy karke backend `.env` aur frontend `.env` dono me daalo

### 3. Flipkart Affiliate Account (Free, commission ke liye)
1. https://affiliate.flipkart.com par apply karo
2. Approval ke baad, unke dashboard se har product ka **tracking link** generate hoga
3. Wahi link admin panel ke "Affiliate Link" field me paste karo

### 4. Backend
```bash
cd backend
npm install
cp .env.example .env
# .env me MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, ADMIN_EMAIL bharo
npm run dev
```
Runs on `http://localhost:5000`

### 5. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# .env me REACT_APP_GOOGLE_CLIENT_ID bharo
npm start
```
Runs on `http://localhost:3000`

### 6. Khud ko Admin banao
`.env` me jo `ADMIN_EMAIL` daala hai, wahi email se register/login karo (Google ya email/password dono se) — automatically admin role mil jayega. Baaki sab users "customer" role me rahenge.

---

## Pages
- `/` — Store: affiliate aur reseller dono products, clear badge ke saath ("Via Flipkart" vs "Sold by us")
- `/login`, `/register` — email/password + Google
- `/checkout/:productId` — sirf reseller products ke liye, login required
- `/admin` — Admin: product add karo, type choose karo (affiliate/reseller), fields uske hisaab se change hote hain
- `/dashboard` — Reseller ka margin/orders + Affiliate ka click analytics, sirf admin dekh sakta hai

## Kaise kaam karta hai (Affiliate flow)
1. Customer product dekhta hai apki site pe, "View on Flipkart" click karta hai
2. Click count ho jaata hai (analytics ke liye), naya tab Flipkart par khulta hai (aapke tracking link se)
3. Customer wahi purchase karta hai — payment/delivery Flipkart handle karta hai
4. Commission Flipkart Affiliate dashboard me dikhega (real-time nahi, unke reporting cycle ke hisaab se)

## Kaise kaam karta hai (Reseller flow)
Wahi jo pehle bana tha — admin product add karta hai with source/selling price, customer login karke order place karta hai, aap supplier se mangwake deliver karte ho, margin dashboard me dikhta hai.

## Deploy (sab free tier)
- Backend → Render ya Railway
- Frontend → Vercel ya Netlify
- Database → MongoDB Atlas
- Deploy ke baad Google Cloud Console aur Flipkart Affiliate dono jagah apna live domain "authorized origin" me add karna mat bhoolna.

## Design v6 — Light theme + animated gradient hero (latest)
- **Switched from full dark theme to a light e-commerce base** (white pages, standard for shopping sites) while keeping the navy header/footer as dark bookends for strong navbar visibility.
- **Full-bleed animated gradient-mesh hero** at the top of the homepage — navy base with moving cyan/blue/amber glows (contained to the hero only, not the whole site), inspired by dark-navy-plus-cyan corporate sites and gradient-hero SaaS pages, built with original colors/copy (no third-party assets used).
- **Fixed: Log in button in the navbar** — it was rendering with the plain `.btn` class, which is the same color as the dark header background (invisible). It now uses `.btn-accent` (solid amber pill, persistent shadow, icon) so it's unmistakably a button.
- **Motion added across every page**: page-level slide-up-and-fade on route change, staggered entrance for dashboard stat cards / cart items / contact rows / admin table rows, floating gradient orbs behind auth forms, and an animated gradient admin banner — all via pure CSS (`prefers-reduced-motion` respected).
- **Contrast fix**: several text/icon colors (badges, trust icons, category chip hover, profile role tag) were tuned for a dark theme and read poorly on white — recolored to a darker teal for AA-safe contrast on light surfaces.

## Design, SEO & Responsiveness (v4)
- **All content in English** — every page, label, and error message across frontend and backend.
- **E-commerce patterns** inspired by common conventions seen on major Indian shopping platforms (category chips, trust badges, discount strikethrough pricing, wishlist icon) — implemented with original code, copy, and design tokens. No logos, images, text, or brand assets from any third-party site are used anywhere in this project.
- **New sections**: sticky category filter bar, trust-badge strip (delivery/returns/payment/verified sellers), MRP + discount badge on product cards, wishlist toggle (local UI state).
- **Scroll animations**: product cards fade/slide into view once as you scroll (`src/components/Reveal.jsx`, IntersectionObserver-based — respects `prefers-reduced-motion`).
- **Brand colors**: palette pulled directly from your logo — deep navy (`#0c1c3e`) + medium blue (`#1f5c96`), used consistently across navbar, footer, buttons, badges, and stat highlights. Navbar and footer are both solid navy so they're always clearly visible and match each other.
- **Logo**: `frontend/public/logo.png` — used in the navbar brand mark, footer, and as favicon/apple-touch-icon. Replace this file directly to update the logo everywhere at once.
- **Design**: Fraunces (display) + Inter (body) typefaces, subtle hover/scroll/entrance animations, sticky dark header.
- **Fully responsive**: mobile hamburger menu, fluid hero type sizing, stacked forms/stats below 768px, horizontally scrollable tables on small screens.
- **SEO**:
  - Per-page `<title>`/meta description via `react-helmet-async` (see `src/components/SEO.jsx`)
  - Open Graph + Twitter card tags, canonical URLs, Organization structured data in `public/index.html`
  - `public/robots.txt` and `public/sitemap.xml` included — **replace `yourdomain.com` with your real domain everywhere** (index.html, SEO.jsx, robots.txt, sitemap.xml) before going live
  - `/admin`, `/dashboard`, `/checkout` are marked `noindex` since they're private pages
  - ⚠️ Important limitation: this is a client-rendered React app (CRA), so search engines get a mostly-empty HTML shell before JS runs. Google can usually still index CSR pages, but if SEO is business-critical, consider migrating to Next.js (SSR/SSG) later — the components/logic here port over with minimal changes.

## Next Steps (aage kya)
- Razorpay/Cashfree se real payment collection (abhi COD-jaisa order flow hai)
- Email/SMS notification jab order status change ho
- Product images ke liye Cloudinary (URL ki jagah direct upload)
