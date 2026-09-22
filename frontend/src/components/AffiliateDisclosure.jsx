import React from "react";
import SEO from "./SEO";

export default function AffiliateDisclosure() {
  return (
    <div className="page container legal-page">
      <SEO title="Affiliate Disclosure" path="/affiliate-disclosure" />
      <h1>Affiliate Disclosure</h1>
      <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p>
        Some links on Bazaar are affiliate links — for example, "View on Flipkart", "View on
        Amazon", or similar buttons on listings marked <strong>"Via [Partner]"</strong>. If you
        click one of these links and make a qualifying purchase, we may receive a commission from
        that partner, at no additional cost to you.
      </p>

      <h2>What this means for you</h2>
      <ul>
        <li>Clicking an affiliate button takes you to the partner's own website to complete your purchase.</li>
        <li>The price, stock, and delivery shown on this site for affiliate products is a reference only — the actual price and availability are confirmed on the partner's site at the time of your purchase.</li>
        <li>Your purchase, payment, shipping, and any returns for affiliate products are handled entirely by that partner, under their own terms and policies.</li>
        <li>We only link to products we believe are genuinely useful — commission never influences which products we feature more than usefulness to you.</li>
      </ul>

      <h2>Products sold directly by us</h2>
      <p>
        Listings marked <strong>"Sold by us"</strong> are not affiliate links — these are products
        we source and ship ourselves, and payment is made directly on this site.
      </p>

      <p>
        Questions about this disclosure? Reach us at{" "}
        <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a> or via the{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </div>
  );
}
