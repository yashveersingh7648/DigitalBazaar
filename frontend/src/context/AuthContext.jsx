import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ token, user }) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    saveSession(res.data);
    return res.data.user;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    saveSession(res.data);
    return res.data.user;
  };

  const googleLogin = async (credential) => {
    const res = await api.post("/auth/google", { credential });
    saveSession(res.data);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await api.put("/auth/me", updates);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
