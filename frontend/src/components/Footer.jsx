import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/logo.png" alt="Bazaar logo" />
              <span>Bazaar</span>
            </div>
            <p style={{ maxWidth: 280 }}>
              Some products are sourced and shipped by us directly. Others come
              through trusted partners — every listing clearly says which is which.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/">All Products</Link><br />
            <Link to="/contact">Contact Us</Link><br />
            <Link to="/login">Log in</Link><br />
            <Link to="/register">Create account</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="mailto:yashveersingh7648@gmail.com">yashveersingh7648@gmail.com</a><br />
            <a href="tel:+916396773509">+91 63967 73509</a><br />
            <span>Noida, Sector 49, UP</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bazaar. All rights reserved.</span>
          <span>Affiliate links may earn commission on qualifying purchases.</span>
        </div>
      </div>
    </footer>
  );
}
