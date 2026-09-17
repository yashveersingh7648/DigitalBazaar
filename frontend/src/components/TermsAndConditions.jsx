import React from "react";
import SEO from "./SEO";

export default function TermsAndConditions() {
  return (
    <div className="page container legal-page">
      <SEO title="Terms & Conditions" path="/terms" />
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p>
        Welcome to Bazaar. By accessing or using this website, you agree to the following terms.
        Please read them carefully before placing an order.
      </p>

      <h2>1. Two kinds of listings</h2>
      <p>
        This site lists two kinds of products, always clearly labelled on each product card:
      </p>
      <ul>
        <li>
          <strong>Reseller products ("Sold by us")</strong> — sourced, sold, and shipped directly by
          us. Payment is made on this site (UPI/QR or Cash on Delivery), and we are responsible for
          fulfilling the order.
        </li>
        <li>
          <strong>Affiliate products ("Via Flipkart/Meesho/Amazon/Myntra/Nykaa")</strong> — clicking
          "View" takes you to that partner's own website to complete your purchase. We do not process
          payment, shipping, returns, or support for these — the partner platform's own terms and
          policies apply to that purchase. We may earn a commission on qualifying purchases made
          through these links, at no extra cost to you.
        </li>
      </ul>

      <h2>2. Pricing</h2>
      <p>
        Prices for reseller products are set by us and honoured at checkout. Prices shown for
        affiliate products are a reference only, entered by us at the time of listing — the actual,
        final price is always whatever the partner platform shows on their site at the time of your
        purchase there.
      </p>

      <h2>3. Orders and payment (reseller products only)</h2>
      <p>
        Orders can be paid via UPI (scan the QR / pay to the UPI ID shown, then submit your
        transaction ID) or Cash on Delivery, where available. UPI payments are verified manually
        against the transaction ID you provide — please make sure it is accurate, as delivery is
        confirmed only after payment verification.
      </p>

      <h2>4. Delivery</h2>
      <p>
        Delivery timelines shown at checkout are estimates, not guarantees, and may vary based on
        your location, stock availability, and courier delays.
      </p>

      <h2>5. Cancellations &amp; returns</h2>
      <p>
        For reseller products, contact us as soon as possible after placing an order if you need to
        cancel or report an issue — see the Contact page. For affiliate products, cancellations and
        returns are handled entirely by the partner platform (Flipkart, Meesho, Amazon, Myntra,
        Nykaa) according to their own policies.
      </p>

      <h2>6. Account responsibility</h2>
      <p>
        You are responsible for keeping your account password confidential and for all activity
        under your account.
      </p>

      <h2>7. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes means
        you accept the updated terms.
      </p>

      <h2>8. Contact us</h2>
      <p>
        Questions about these terms? Reach us at{" "}
        <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a> or via the{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </div>
  );
}
