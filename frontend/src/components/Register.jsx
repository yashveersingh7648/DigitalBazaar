import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="page">
      <SEO title="Create account" path="/register" />
      <div className="form-card">
      <h2>Create account</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: -4 }}>
        Create your account — takes less than a minute
      </p>

      <div style={{ margin: "20px 0" }}>
        <GoogleLogin
          onSuccess={async (cred) => {
            try {
              await googleLogin(cred.credential);
              navigate("/");
            } catch {
              setError("Google signup failed");
            }
          }}
          onError={() => setError("Google signup failed")}
          width="100%"
        />
      </div>
      <div className="divider-text">or continue with email</div>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          className="form-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label>Email</label>
        <input
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          className="form-input"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-block" type="submit">Create account</button>
      </form>

      <p style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      </div>
    </div>
  );
}
