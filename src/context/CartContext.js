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

  // Get guestId from localStorage
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
      // console.log('📦 Cart fetched:', response.data);
      

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

  const addToCart = useCallback(async (product) => {
    try {
      const guestId = getGuestId();
      
      const payload = {
        guestId: guestId,
        productId: product.productId || product._id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        quantity: product.quantity || 1,
        originalPrice: product.originalPrice || product.price,
        discountAmount: product.discountAmount || 0,
        couponCode: product.couponCode || null
      };

      const response = await axios.post(`${API_URL}/cart/add`, payload);
      // console.log('✅ Item added to cart:', response.data);
      
      // Refetch cart to update count
      await fetchCart();
      
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [getGuestId, fetchCart]);


  const removeFromCart = useCallback(async (productId) => {
    try {
      const guestId = getGuestId();
      
      const response = await axios.delete(`${API_URL}/cart/remove/${guestId}/${productId}`);

 
      await fetchCart();
      
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [getGuestId, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const guestId = getGuestId();

      const cart = await axios.get(`${API_URL}/cart/${guestId}`);
      const items = cart.data.items || [];
      

      const updatedItems = items.map(item => 
        item.productId === productId ? { ...item, quantity: quantity } : item
      );
      
      const item = items.find(item => item.productId === productId);
      if (item) {
        await axios.post(`${API_URL}/cart/add`, {
          guestId: guestId,
          productId: productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: quantity,
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