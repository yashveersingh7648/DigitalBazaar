import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="page">
      <SEO title="Log in" path="/login" />
      <div className="form-card">
      <h2>Log in</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: -4 }}>
        Welcome back — log in to continue
      </p>

      <div style={{ margin: "20px 0" }}>
        <GoogleLogin
          onSuccess={async (cred) => {
            try {
              await googleLogin(cred.credential);
              navigate("/");
            } catch {
              setError("Google login failed");
            }
          }}
          onError={() => setError("Google login failed")}
          width="320"
        />
      </div>
      <div className="divider-text">or continue with email</div>

      <form onSubmit={handleSubmit}>
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
        <button className="btn btn-block" type="submit">Log in</button>
      </form>

      <p style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
      </div>
    </div>
  );
}
