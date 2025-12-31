// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  productId: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (productId: number, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "ecom_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      return [];
    }
  });

  // persist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function addToCart(productId: number, qty = 1) {
    setItems(prev => {
      const exists = prev.find(i => i.productId === productId);
      if (exists) {
        return prev.map(i =>
          i.productId === productId ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }

  function removeFromCart(productId: number) {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }

  function setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }

  function clearCart() {
    setItems([]);
  }

  function getTotalItems() {
    return items.reduce((s, i) => s + i.quantity, 0);
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
