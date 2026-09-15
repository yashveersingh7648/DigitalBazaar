import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Bazaar logo" />
          Baz<span>aar</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span style={menuOpen ? { transform: "translateY(7px) rotate(45deg)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "translateY(-7px) rotate(-45deg)" } : {}} />
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Store</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          {user?.role === "admin" && (
            <>
              <Link to="/admin" onClick={closeMenu}>Add Product</Link>
              <Link to="/admin/settings" onClick={closeMenu}>Payments</Link>
              <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            </>
          )}
          {user && (
            <Link to="/cart" className="icon-link" onClick={closeMenu} aria-label="Cart">
              <ShoppingCart size={19} />
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="icon-link" onClick={closeMenu} aria-label="Profile">
                <User size={19} />
              </Link>
              <span className="nav-user">{user.name}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  logout();
                  closeMenu();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm" onClick={closeMenu}>Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
