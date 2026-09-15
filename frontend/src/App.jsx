import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import Checkout from "./components/Checkout";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import AdminAddProduct from "./components/AdminAddProduct";
import AdminSettings from "./components/AdminSettings";
import Contact from "./components/Contact";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export default function App() {
  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<ProductList />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/checkout/:productId"
                    element={
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <PrivateRoute>
                        <Cart />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminAddProduct />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <AdminRoute>
                        <AdminSettings />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <AdminRoute>
                        <Dashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}
