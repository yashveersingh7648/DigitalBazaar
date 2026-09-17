import React from "react";
import SEO from "./SEO";

export default function PrivacyPolicy() {
  return (
    <div className="page container legal-page">
      <SEO title="Privacy Policy" path="/privacy-policy" />
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p>
        This Privacy Policy explains how Bazaar ("we", "us", "our") collects, uses, and protects
        information when you use this website. By using this site, you agree to the practices
        described here.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> name, email address, and password (stored securely, never in plain text) when you register.</li>
        <li><strong>Order information:</strong> phone number and delivery address, submitted when you place an order for a reseller product.</li>
        <li><strong>Payment reference:</strong> for UPI/QR orders, we store the transaction ID / UTR you provide to verify payment — we never see or store your card, bank, or UPI PIN details.</li>
        <li><strong>Contact form:</strong> your name, email, phone (optional), and message when you contact us.</li>
        <li><strong>Usage data:</strong> anonymous, non-personal visit data (pages viewed, approximate time on site) to help us understand how the site is used. This is not linked to your identity.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To respond to your queries via the Contact page</li>
        <li>To verify UPI payments against the transaction ID you submit</li>
        <li>To improve site performance and content, using anonymous usage data</li>
      </ul>

      <h2>3. Third parties</h2>
      <p>
        We use trusted third-party services to run this site: a database provider (MongoDB Atlas)
        to store data, an image hosting service (Cloudinary) for product photos, and an email
        service (SendGrid/Gmail) to send contact replies. When you click through to an affiliate
        product (e.g. Flipkart, Meesho, Amazon, Myntra, Nykaa), you leave this site and that
        platform's own privacy policy applies to your purchase there.
      </p>

      <h2>4. Data security</h2>
      <p>
        Passwords are hashed and never stored in plain text. We do not store card, bank, or UPI
        PIN details anywhere on this site — online payments are verified manually against the
        UTR/transaction ID you provide.
      </p>

      <h2>5. Your choices</h2>
      <p>
        You can update your profile information at any time from the Profile page, or contact us
        to request that your account and associated data be deleted.
      </p>

      <h2>6. Who can use this site</h2>
      <p>
        This site is intended for users of any country, but is currently focused on India-based
        delivery and INR pricing. If you have questions about how your data is handled from
        outside India, please contact us.
      </p>

      <h2>7. Contact us</h2>
      <p>
        For any privacy questions, reach us at{" "}
        <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a> or via the{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </div>
  );
}
