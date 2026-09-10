// context/CartContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const getGuestId = useCallback(() => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const guestId = getGuestId();

      if (!guestId) {
        setCartItems([]);
        setCartCount(0);
        return;
      }

      const response = await axios.get(`${API_URL}/cart/${guestId}`);

      let items = [];
      if (response.data && response.data.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && response.data.cart) {
        items = response.data.cart.items || [];
      }

      setCartItems(items);
      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalQty);

      return items;
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setCartCount(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getGuestId]);

  // ✅ NESTED product payload with variant fields
  const addToCart = useCallback(async (product) => {
    try {
      const guestId = getGuestId();

      const strictVariantId =
        product.variantId && String(product.variantId).trim() !== ""
          ? String(product.variantId).trim()
          : null;

      console.log("📦 addToCart called with:", {
        productId: product.productId || product._id,
        variantId: strictVariantId,
        selectedColor: product.selectedColor,
        variantPrice: product.variantPrice,
      });

      const payload = {
        guestId: guestId,
        product: {
          productId: product.productId || product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          discountAmount: product.discountAmount || 0,
          couponCode: product.couponCode || null,
          quantity: product.quantity || 1,
          image: Array.isArray(product.image) ? product.image[0] : product.image,

          variantId: strictVariantId,
          selectedColor: product.selectedColor || "",
          selectedSize: product.selectedSize || "",
          variantImage: product.variantImage || "",
          variantPrice: product.variantPrice || 0,

          size: product.size || "",
          weight: product.weight || 0,
          weightUnit: product.weightUnit || "",
          sku: product.sku || "",
          variant: product.variant || "",
          stock: product.stock || 0,
          company: product.company || "N/A",
          vendorId: product.vendorId || null,
        },
      };

      console.log("📦 Full payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_URL}/cart/add`, payload);
      console.log("✅ Response:", response.data);

      await fetchCart();
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [getGuestId, fetchCart]);

  const removeFromCart = useCallback(async (productId, variantId = null) => {
    try {
      const guestId = getGuestId();

      const url = variantId
        ? `${API_URL}/cart/remove/${guestId}/${productId}?variantId=${variantId}`
        : `${API_URL}/cart/remove/${guestId}/${productId}`;

      const response = await axios.delete(url);
      await fetchCart();
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [getGuestId, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity, variantId = null) => {
    try {
      const guestId = getGuestId();

      const cart = await axios.get(`${API_URL}/cart/${guestId}`);
      const items = cart.data.items || [];

      const item = items.find((i) => {
        const sameProduct = i.productId === productId;
        const itemVariant = i.variantId ? i.variantId.toString() : null;
        const targetVariant = variantId ? variantId.toString() : null;
        return sameProduct && itemVariant === targetVariant;
      });

      if (item) {
        await axios.post(`${API_URL}/cart/add`, {
          guestId: guestId,
          product: {
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: quantity,
            originalPrice: item.originalPrice,
            discountAmount: item.discountAmount || 0,
            couponCode: item.couponCode || null,
            variantId: item.variantId || null,
            selectedColor: item.selectedColor || "",
            selectedSize: item.selectedSize || "",
            variantImage: item.variantImage || "",
            variantPrice: item.variantPrice || 0,
            stock: item.stock || 0,
            company: item.company || "N/A",
            vendorId: item.vendorId || null,
          },
        });

        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }, [getGuestId, fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      const guestId = getGuestId();
      const response = await axios.delete(`${API_URL}/cart/clear/${guestId}`);

      setCartItems([]);
      setCartCount(0);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      try {
        const response = await axios.post(`${API_URL}/cart/clear`, { guestId: getGuestId() });
        setCartItems([]);
        setCartCount(0);
        return response.data;
      } catch (err) {
        console.error('Alternative clear also failed:', err);
        throw err;
      }
    }
  }, [getGuestId]);

  const toggleCart = useCallback(() => {
    setShowCart(prev => !prev);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cartItems,
    cartCount,
    loading,
    showCart,
    setShowCart,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};