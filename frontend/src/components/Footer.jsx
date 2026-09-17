import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

// TODO: Instagram/Facebook/YouTube handles apne asli profile links se replace kar dena
const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://www.instagram.com/sypwebworks/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=100051831394870", label: "Facebook" },
  { icon: Youtube, href: "https://www.youtube.com/@shivshiv-y5k", label: "YouTube" },
  { icon: MessageCircle, href: "https://wa.me/916396773509", label: "WhatsApp" },
];

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
            <div className="social-row">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a href={href} key={label} aria-label={label} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <Icon size={17} />
                </a>
              ))}
            </div>
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
          <div>
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link><br />
            <Link to="/terms">Terms &amp; Conditions</Link>
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
