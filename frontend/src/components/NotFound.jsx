import React from "react";
import { Link } from "react-router-dom";
import SEO from "./SEO";

export default function NotFound() {
  return (
    <div className="page container" style={{ paddingTop: 80, textAlign: "center" }}>
      <SEO title="Page Not Found" noindex path="/404" />
      <h1>404 — Page not found</h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: 420, margin: "12px auto 24px" }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-pill">Back to homepage</Link>
    </div>
  );
}
