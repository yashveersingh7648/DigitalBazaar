import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import VisitTracker from "./components/VisitTracker";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

// Homepage (ProductList) hamesha eager load hoti hai — pehli baar site khulte hi turant
// dikhni chahiye. Baaki saare pages sirf tabhi download hote hain jab user unhe visit kare —
// isse pehla page load fast hota hai (kam JavaScript bhejni padti hai shuru mein).
const ProductDetail = lazy(() => import("./components/ProductDetail"));
const CategoryPage = lazy(() => import("./components/CategoryPage"));
const Checkout = lazy(() => import("./components/Checkout"));
const Cart = lazy(() => import("./components/Cart"));
const Profile = lazy(() => import("./components/Profile"));
const AdminAddProduct = lazy(() => import("./components/AdminAddProduct"));
const AdminSettings = lazy(() => import("./components/AdminSettings"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Contact = lazy(() => import("./components/Contact"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./components/TermsAndConditions"));
const AffiliateDisclosure = lazy(() => import("./components/AffiliateDisclosure"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const NotFound = lazy(() => import("./components/NotFound"));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <VisitTracker />
              <Header />
              <main>
                <Suspense fallback={<div className="page container" style={{ paddingTop: 60 }}>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/category/:categorySlug" element={<CategoryPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}
