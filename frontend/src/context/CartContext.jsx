import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // [{ product, quantity }]
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post("/cart", { productId, quantity });
    setItems(res.data);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/${productId}`, { quantity });
    setItems(res.data);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setItems(res.data);
  };

  const clearCart = async () => {
    await api.delete("/cart");
    setItems([]);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, count, addToCart, updateQuantity, removeFromCart, clearCart, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
