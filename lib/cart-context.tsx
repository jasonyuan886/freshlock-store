'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from './types';

export type ShippingMethod = 'standard' | 'express';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  shippingMethod: ShippingMethod;
  setShippingMethod: (m: ShippingMethod) => void;
  getShippingCost: () => number;
}

// Australia shipping rules
const FREE_SHIPPING_THRESHOLD = 99;
const STANDARD_SHIPPING = 12.95;
const EXPRESS_SHIPPING = 22.95;
const EXPRESS_UPGRADE_FEE = 9.95;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [shippingMethod, setShippingMethodState] = useState<ShippingMethod>('standard');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('freshlock-cart');
      if (stored) setItems(JSON.parse(stored));
      const storedMethod = localStorage.getItem('freshlock-shipping');
      if (storedMethod === 'express' || storedMethod === 'standard') {
        setShippingMethodState(storedMethod);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('freshlock-cart', JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem('freshlock-shipping', shippingMethod);
  }, [shippingMethod, loaded]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.product.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(slug); return; }
    setItems((prev) => prev.map((i) => (i.product.slug === slug ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const setShippingMethod = (m: ShippingMethod) => setShippingMethodState(m);

  const getShippingCost = (): number => {
    const subtotal = totalPrice;
    if (shippingMethod === 'express') {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) return EXPRESS_UPGRADE_FEE;
      return EXPRESS_SHIPPING;
    }
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return STANDARD_SHIPPING;
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, shippingMethod, setShippingMethod, getShippingCost }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
